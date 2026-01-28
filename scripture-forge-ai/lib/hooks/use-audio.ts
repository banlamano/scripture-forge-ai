"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseAudioOptions {
  volume?: number;
}

export function useAudio(options: UseAudioOptions = {}) {
  const { volume = 1 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<string>("");

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      // Only revoke blob: URLs we created locally
      try {
        if (audioUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
      } finally {
        audioUrlRef.current = null;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // Browser speech synthesis fallback with improved naturalness
  const useBrowserFallback = useCallback((text: string, language: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Speech synthesis not supported");
      setIsLoading(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Slower rate for more natural Bible reading
    utterance.rate = 0.85;
    // Slightly lower pitch for a more reverent tone
    utterance.pitch = 0.95;
    utterance.volume = Math.max(0.1, Math.min(1, volume));

    // Find the best voice for language - prefer natural/enhanced voices
    const voices = window.speechSynthesis.getVoices();
    
    // Map language codes to full locale patterns
    const localeMap: Record<string, string[]> = {
      en: ["en-US", "en-GB", "en"],
      es: ["es-ES", "es-MX", "es"],
      fr: ["fr-FR", "fr-CA", "fr"],
      de: ["de-DE", "de"],
      it: ["it-IT", "it"],
      pt: ["pt-BR", "pt-PT", "pt"],
      zh: ["zh-CN", "zh-TW", "zh"],
    };
    
    const preferredLocales = localeMap[language] || [language];
    
    // Find best matching voice - prefer "Natural", "Premium", or "Enhanced" voices
    let selectedVoice = null;
    
    for (const locale of preferredLocales) {
      // First try to find a natural/premium voice
      const naturalVoice = voices.find(
        (v) => v.lang.startsWith(locale) && 
        (v.name.toLowerCase().includes("natural") || 
         v.name.toLowerCase().includes("premium") ||
         v.name.toLowerCase().includes("enhanced") ||
         v.name.toLowerCase().includes("neural"))
      );
      if (naturalVoice) {
        selectedVoice = naturalVoice;
        break;
      }
      
      // Fall back to any voice for this locale
      const anyVoice = voices.find((v) => v.lang.startsWith(locale));
      if (anyVoice && !selectedVoice) {
        selectedVoice = anyVoice;
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log(`Browser TTS: Using voice "${selectedVoice.name}" for language ${language}`);
    } else {
      utterance.lang = language;
      console.log(`Browser TTS: No specific voice found, using default for ${language}`);
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("Browser TTS error:", e);
      setError("Audio playback failed");
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
    };

    // Chrome long text bug workaround - pause/resume every 10 seconds
    const checkInterval = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.speaking) {
        clearInterval(checkInterval);
      }
    }, 10000);

    window.speechSynthesis.speak(utterance);

    // Set playing immediately since onstart may not fire
    setTimeout(() => {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        setIsPlaying(true);
        setIsLoading(false);
      }
    }, 200);
  }, [volume]);

  const speak = useCallback(
    async (text: string, language: string = "en") => {
      try {
        // Cleanup previous audio
        cleanupAudio();
        
        // Reset states
        setError(null);
        setIsLoading(true);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentCharIndex(0);
        setCurrentWord("");
        textRef.current = text;

        console.log("Fetching TTS audio for language:", language);

        // Call our TTS API
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: "Failed to generate audio" };
          }
          
          // If API returns fallback flag OR any server error, use browser speech synthesis
          if (errorData.useFallback || response.status >= 500) {
            console.log("TTS API unavailable, using browser fallback");
            useBrowserFallback(text, language);
            return;
          }
          
          throw new Error(errorData.error || "Failed to generate audio");
        }

        const data = await response.json();

        console.log("Audio received, creating player...");

        let audioSrc: string;

        // Prefer streaming URL (fast start) when provided
        if (data.audioUrl && typeof data.audioUrl === "string") {
          audioSrc = data.audioUrl;
          // Do NOT store remote URLs in audioUrlRef (only blob URLs should be revoked)
          audioUrlRef.current = null;
        } else if (data.audioContent && typeof data.audioContent === "string") {
          // Legacy/base64 path (slower): Convert base64 to blob
          const audioBytes = atob(data.audioContent);
          const audioArray = new Uint8Array(audioBytes.length);
          for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
          }
          const audioBlob = new Blob([audioArray], { type: data.contentType || "audio/mpeg" });

          const blobUrl = URL.createObjectURL(audioBlob);
          audioUrlRef.current = blobUrl;
          audioSrc = blobUrl;
        } else {
          throw new Error("No audio received");
        }

        const audio = new Audio();
        // Allow streaming cross-origin audio (Murf hosted URLs)
        audio.crossOrigin = "anonymous";
        audio.preload = "auto";
        audio.src = audioSrc;
        audio.volume = Math.max(0.1, Math.min(1, volume));
        audioRef.current = audio;

        // Set up event listeners
        audio.onplay = () => {
          console.log("Audio playing");
          setIsPlaying(true);
          setIsPaused(false);
          setIsLoading(false);
        };

        audio.onpause = () => {
          if (!audio.ended) {
            setIsPaused(true);
          }
        };

        audio.onended = () => {
          console.log("Audio ended");
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentCharIndex(0);
          setCurrentWord("");
          cleanupAudio();
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setError("Failed to play audio");
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
          cleanupAudio();
        };

        // Simulate progress tracking based on audio currentTime
        audio.ontimeupdate = () => {
          if (audio.duration > 0 && textRef.current) {
            const progress = audio.currentTime / audio.duration;
            const charIndex = Math.floor(progress * textRef.current.length);
            setCurrentCharIndex(charIndex);
            
            // Extract approximate current word
            const textFromIndex = textRef.current.substring(charIndex);
            const wordMatch = textFromIndex.match(/^[\w\u00C0-\u024F\u1E00-\u1EFF]+/);
            if (wordMatch) {
              setCurrentWord(wordMatch[0]);
            }
          }
        };

        // Start playing
        console.log("Starting audio playback...");
        await audio.play();

      } catch (err) {
        console.error("TTS error:", err);
        setError(err instanceof Error ? err.message : "Failed to play audio");
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [volume, cleanupAudio]
  );

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  const stop = useCallback(() => {
    cleanupAudio();
    // Also stop browser speech synthesis if active
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    textRef.current = "";
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentCharIndex(0);
    setCurrentWord("");
  }, [cleanupAudio]);

  const toggle = useCallback(() => {
    if (isPaused) {
      resume();
    } else if (isPlaying) {
      pause();
    }
  }, [isPaused, isPlaying, pause, resume]);

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    isPlaying,
    isPaused,
    isLoading,
    error,
    currentCharIndex,
    currentWord,
    isSupported: true,
    voices: [],
  };
}
