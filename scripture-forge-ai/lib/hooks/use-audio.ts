"use client";

import { useState, useCallback, useRef } from "react";

interface UseAudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceGender?: "male" | "female";
}

export function useAudio(options: UseAudioOptions = {}) {
  const { volume = 1, voiceGender = "male" } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Cleanup function to revoke object URL
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const speak = useCallback(
    async (text: string, language: string = "en") => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cleanup any previous audio
        cleanupAudio();

        // Call our TTS API
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            language,
            voiceGender,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate audio");
        }

        const data = await response.json();
        
        // Convert base64 to blob
        const audioBytes = atob(data.audioContent);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: "audio/mpeg" });
        
        // Create audio element
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;
        
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audioRef.current = audio;

        // Set up event listeners
        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
          setIsLoading(false);
        };

        audio.onpause = () => {
          setIsPaused(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
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

        // Start playing
        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        setError(err instanceof Error ? err.message : "Failed to generate audio");
        setIsLoading(false);
        setIsPlaying(false);
        
        // Fallback to browser TTS if Google TTS fails
        fallbackSpeak(text, language);
      }
    },
    [volume, voiceGender, cleanupAudio]
  );

  // Fallback to browser's speech synthesis
  const fallbackSpeak = useCallback((text: string, language: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.volume = volume;

    // Try to find a voice for the specified language
    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find((v) => v.lang.startsWith(language));
    if (langVoice) {
      utterance.voice = langVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [volume]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if ("speechSynthesis" in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    } else if ("speechSynthesis" in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    cleanupAudio();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
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
    isSupported: true, // Always supported with fallback
  };
}
