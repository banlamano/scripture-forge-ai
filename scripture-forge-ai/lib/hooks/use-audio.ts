"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseAudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onBoundary?: (event: { charIndex: number; charLength: number; name: string }) => void;
}

// Language locale preferences for voice selection
const LANGUAGE_LOCALES: Record<string, string[]> = {
  en: ["en-US", "en-GB", "en-AU", "en"],
  es: ["es-ES", "es-MX", "es-US", "es"],
  fr: ["fr-FR", "fr-CA", "fr"],
  de: ["de-DE", "de-AT", "de"],
  it: ["it-IT", "it"],
  pt: ["pt-BR", "pt-PT", "pt"],
  zh: ["zh-CN", "zh-TW", "zh-HK", "zh"],
  ja: ["ja-JP", "ja"],
  ko: ["ko-KR", "ko"],
  nl: ["nl-NL", "nl-BE", "nl"],
  pl: ["pl-PL", "pl"],
  ru: ["ru-RU", "ru"],
  ar: ["ar-SA", "ar-EG", "ar"],
  hi: ["hi-IN", "hi"],
  tr: ["tr-TR", "tr"],
  vi: ["vi-VN", "vi"],
  th: ["th-TH", "th"],
  id: ["id-ID", "id"],
  sw: ["sw-KE", "sw-TZ", "sw"],
};

export function useAudio(options: UseAudioOptions = {}) {
  const { rate = 0.9, pitch = 1, volume = 1, onBoundary } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<string>("");

  // Load available voices and warm up speech synthesis for mobile
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        console.log(`Loaded ${availableVoices.length} voices`);
      }
    };

    // Load voices immediately
    loadVoices();
    
    // Also listen for voices changed event (needed for some browsers)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Fallback: try loading voices after a short delay
    const timeout = setTimeout(loadVoices, 100);
    
    // Try loading again after longer delay for slow mobile browsers
    const timeout2 = setTimeout(loadVoices, 500);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find the best voice for a language
  const findBestVoice = useCallback(
    (language: string, availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
      if (availableVoices.length === 0) return null;

      const locales = LANGUAGE_LOCALES[language] || LANGUAGE_LOCALES["en"];

      // Priority: Neural/Natural voices > Online voices > Local voices
      for (const locale of locales) {
        // First try to find a Neural/Natural voice (highest quality)
        const neuralVoice = availableVoices.find(
          (v) =>
            v.lang.startsWith(locale) &&
            (v.name.includes("Neural") ||
              v.name.includes("Natural") ||
              v.name.includes("Premium") ||
              v.name.includes("Enhanced") ||
              v.name.includes("Online") ||
              v.name.includes("Google") ||
              v.name.includes("Microsoft"))
        );
        if (neuralVoice) return neuralVoice;

        // Then try any voice for this locale
        const anyVoice = availableVoices.find((v) => v.lang.startsWith(locale));
        if (anyVoice) return anyVoice;
      }

      // Fallback: any voice that matches the base language
      const fallbackVoice = availableVoices.find((v) => v.lang.startsWith(language));
      if (fallbackVoice) return fallbackVoice;

      // Last resort: default voice or first voice
      return availableVoices.find((v) => v.default) || availableVoices[0] || null;
    },
    []
  );

  const speak = useCallback(
    (text: string, language: string = "en") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setError("Speech synthesis not supported in this browser");
        return;
      }

      // Clear any existing interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      // Reset states
      setError(null);
      setIsLoading(true);
      setIsPlaying(false);
      setIsPaused(false);

      // Mobile browsers require speech synthesis to be triggered directly from user interaction
      // Also, some mobile browsers need a small delay after cancel()
      const initSpeech = () => {
        // Get voices - try multiple times if needed
        let availableVoices = window.speechSynthesis.getVoices();
      
      const startSpeech = () => {
        // Get fresh list of voices
        availableVoices = window.speechSynthesis.getVoices();
        
        if (availableVoices.length === 0) {
          // Still no voices, try again shortly
          setTimeout(startSpeech, 50);
          return;
        }

        try {
          // Store text for boundary tracking
          textRef.current = text;
          setCurrentCharIndex(0);
          setCurrentWord("");

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = rate;
          utterance.pitch = pitch;
          utterance.volume = Math.max(0.1, Math.min(1, volume)); // Ensure volume is between 0.1 and 1

          // Find and set the best voice for the language
          const bestVoice = findBestVoice(language, availableVoices);
          if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang;
            console.log(`Using voice: ${bestVoice.name} (${bestVoice.lang}), volume: ${utterance.volume}`);
          } else {
            // Set language code if no specific voice found
            const locales = LANGUAGE_LOCALES[language];
            utterance.lang = locales ? locales[0] : "en-US";
            console.log(`No voice found for ${language}, using lang: ${utterance.lang}`);
          }

          // Track word boundaries for highlighting
          utterance.onboundary = (event) => {
            if (event.name === 'word') {
              const charIndex = event.charIndex;
              const charLength = event.charLength || 0;
              setCurrentCharIndex(charIndex);
              
              // Extract the current word
              if (charLength > 0) {
                const word = text.substring(charIndex, charIndex + charLength);
                setCurrentWord(word);
              } else {
                // Try to find word boundary manually
                const wordMatch = text.substring(charIndex).match(/^[\w\u00C0-\u024F\u1E00-\u1EFF]+/);
                if (wordMatch) {
                  setCurrentWord(wordMatch[0]);
                }
              }
              
              // Call the callback if provided
              if (onBoundary) {
                onBoundary({ charIndex, charLength, name: event.name });
              }
            }
          };

          utterance.onstart = () => {
            console.log("Speech started, volume:", utterance.volume);
            setIsPlaying(true);
            setIsPaused(false);
            setIsLoading(false);
          };

          utterance.onend = () => {
            console.log("Speech ended");
            setIsPlaying(false);
            setIsPaused(false);
            setIsLoading(false);
            setCurrentCharIndex(0);
            setCurrentWord("");
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
          };

          utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            // Don't set error for 'interrupted' which happens on cancel
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              setError(`Speech error: ${e.error}`);
            }
            setIsPlaying(false);
            setIsPaused(false);
            setIsLoading(false);
            setCurrentCharIndex(0);
            setCurrentWord("");
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
          };

          utteranceRef.current = utterance;
          
          // Speak the utterance
          window.speechSynthesis.speak(utterance);

          // Chrome has a bug where long texts get cut off after ~15 seconds
          // This workaround keeps the speech synthesis active
          checkIntervalRef.current = setInterval(() => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
              // Keep it active by pausing and resuming
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          }, 10000);

          // Set playing state immediately since onstart might not fire on some browsers
          setTimeout(() => {
            if (window.speechSynthesis.speaking) {
              setIsPlaying(true);
              setIsLoading(false);
            }
          }, 100);

        } catch (err) {
          console.error("TTS error:", err);
          setError(err instanceof Error ? err.message : "Failed to play audio");
          setIsLoading(false);
          setIsPlaying(false);
        }
      };

        // Start speech after a small delay to ensure voices are loaded
        if (availableVoices.length > 0) {
          startSpeech();
        } else {
          // Wait for voices to load
          setTimeout(startSpeech, 100);
        }
      };

      // On mobile, we need a small delay after cancel() before speaking again
      // This also helps with iOS Safari which can be finicky
      setTimeout(initSpeech, 50);
    },
    [rate, pitch, volume, findBestVoice, onBoundary]
  );

  const pause = useCallback(() => {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(true);
    }
  }, []);

  const resume = useCallback(() => {
    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    textRef.current = "";
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentCharIndex(0);
    setCurrentWord("");
  }, []);

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
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    voices,
  };
}
