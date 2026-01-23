"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseAudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
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
  const { rate = 0.9, pitch = 1, volume = 1 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Find the best voice for a language
  const findBestVoice = useCallback(
    (language: string): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;

      const locales = LANGUAGE_LOCALES[language] || LANGUAGE_LOCALES["en"];

      // Priority: Neural/Natural voices > Online voices > Local voices
      for (const locale of locales) {
        // First try to find a Neural/Natural voice (highest quality)
        const neuralVoice = voices.find(
          (v) =>
            v.lang.startsWith(locale) &&
            (v.name.includes("Neural") ||
              v.name.includes("Natural") ||
              v.name.includes("Premium") ||
              v.name.includes("Enhanced") ||
              v.name.includes("Online"))
        );
        if (neuralVoice) return neuralVoice;

        // Then try any voice for this locale
        const anyVoice = voices.find((v) => v.lang.startsWith(locale));
        if (anyVoice) return anyVoice;
      }

      // Fallback: any voice that matches the base language
      const fallbackVoice = voices.find((v) => v.lang.startsWith(language));
      if (fallbackVoice) return fallbackVoice;

      // Last resort: default voice
      return voices.find((v) => v.default) || voices[0] || null;
    },
    [voices]
  );

  const speak = useCallback(
    async (text: string, language: string = "en") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setError("Speech synthesis not supported");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Wait for voices to load if not already loaded
        let availableVoices = voices;
        if (availableVoices.length === 0) {
          availableVoices = window.speechSynthesis.getVoices();
          // If still no voices, wait a bit
          if (availableVoices.length === 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            availableVoices = window.speechSynthesis.getVoices();
          }
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        // Find and set the best voice for the language
        const bestVoice = findBestVoice(language);
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        } else {
          // Set language code if no specific voice found
          const locales = LANGUAGE_LOCALES[language];
          utterance.lang = locales ? locales[0] : language;
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
          console.error("Speech synthesis error:", e);
          setError("Failed to play audio");
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("TTS error:", err);
        setError(err instanceof Error ? err.message : "Failed to play audio");
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [rate, pitch, volume, voices, findBestVoice]
  );

  const pause = useCallback(() => {
    if ("speechSynthesis" in window && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if ("speechSynthesis" in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
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
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    voices,
  };
}
