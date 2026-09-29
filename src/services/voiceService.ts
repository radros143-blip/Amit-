import { VoiceProfileId } from '../types/assistant';

export interface VoiceServiceCallbacks {
  onResult: (text: string, isFinal: boolean) => void;
  onWakeWord: () => void;
  onEnd: () => void;
  onError?: (errorType: string, friendlyMsg: string) => void;
  onAudioLevel?: (level: number) => void;
  onTripleClap?: () => void;
}

class VoiceService {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private clapData: number[] = [];
  private lastClapTime: number = 0;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private wakeWords: string[] = ['hey mayra', 'mayra', 'हे मायरा', 'मायरा', 'mera', 'myra'];
  private wakeWordEnabled: boolean = true;
  private clapDetectionEnabled: boolean = true;
  private currentLang: string = 'hi-IN';
  private restartTimeout: any = null;
  private silenceTimer: any = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private shouldKeepListening: boolean = false;

  private callbacks: VoiceServiceCallbacks = {
    onResult: () => {},
    onWakeWord: () => {},
    onEnd: () => {},
  };

  private animFrameId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis || null;
      if (this.synth) {
        this.loadVoices();
        if (typeof this.synth.onvoiceschanged !== 'undefined') {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.cachedVoices = this.synth.getVoices() || [];
    } catch {
      // ignore
    }
  }

  public isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  private createRecognition(): any {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = this.currentLang;

      rec.onresult = (event: any) => {
        // Prevent MAYRA from hearing and transcribing her own voice
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const transcript = item[0].transcript;
            if (item.isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
        }

        const currentText = (finalTranscript || interimTranscript).toLowerCase().trim();

        // Check for wake words
        if (this.wakeWordEnabled && this.callbacks.onWakeWord && currentText) {
          for (const word of this.wakeWords) {
            if (currentText.includes(word)) {
              this.playSciFiBeep(880, 0.1);
              this.callbacks.onWakeWord();
              break;
            }
          }
        }

        const effectiveText = (finalTranscript || interimTranscript).trim();

        if (finalTranscript && this.callbacks.onResult) {
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.callbacks.onResult(finalTranscript.trim(), true);
        } else if (effectiveText && this.callbacks.onResult) {
          this.callbacks.onResult(effectiveText, false);

          // Silence timeout: If user stops talking for 1.3 seconds, automatically submit!
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (effectiveText && !this.isSpeaking) {
              this.callbacks.onResult(effectiveText, true);
            }
          }, 1300);
        }
      };

      rec.onerror = (event: any) => {
        const error = event.error || 'unknown';
        console.warn('Speech recognition event warning:', error);

        // 'no-speech' is normal when user is thinking or quiet; don't terminate listening
        if (error === 'no-speech') {
          return;
        }

        // 'aborted' happens on manual stop/abort
        if (error === 'aborted') {
          return;
        }

        let friendlyMsg = 'माइक से आवाज़ नहीं आ पा रही है।';

        if (error === 'not-allowed' || error === 'permission-denied') {
          friendlyMsg = 'माइक्रोफोन (Mic) की अनुमति नहीं है। कृपया ब्राउज़र में Mic Access Allow करें।';
          this.shouldKeepListening = false;
          this.isListening = false;
        } else if (error === 'audio-capture') {
          friendlyMsg = 'माइक हार्डवेयर उपलब्ध नहीं है। कृपया जांचें कि कोई अन्य ऐप माइक का उपयोग तो नहीं कर रहा।';
          this.shouldKeepListening = false;
          this.isListening = false;
        } else if (error === 'network') {
          friendlyMsg = 'Speech Recognition नेटवर्क समस्या आई। इंटरनेट कनेक्शन जांचें।';
        } else if (error === 'language-not-supported') {
          friendlyMsg = 'हिंदी भाषा रिकग्निशन में समस्या आई। डिफ़ॉल्ट भाषा पर स्विच किया जा रहा है।';
          this.currentLang = 'en-IN';
        }

        if (this.callbacks.onError) {
          this.callbacks.onError(error, friendlyMsg);
        }
      };

      rec.onend = () => {
        // Safe debounced restart if continuous listening is desired
        if (this.shouldKeepListening && !this.isSpeaking) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldKeepListening && !this.isSpeaking) {
              try {
                this.safeStart();
              } catch (e) {
                console.warn('Recognition restart skipped:', e);
              }
            }
          }, 300);
        } else {
          this.isListening = false;
          this.callbacks.onEnd();
        }
      };

      return rec;
    } catch (e) {
      console.error('Failed to create SpeechRecognition instance:', e);
      return null;
    }
  }

  public initRecognition(
    onResult: (text: string, isFinal: boolean) => void,
    onWakeWord: () => void,
    onEnd: () => void,
    onError?: (errorType: string, friendlyMsg: string) => void
  ) {
    this.callbacks.onResult = onResult;
    this.callbacks.onWakeWord = onWakeWord;
    this.callbacks.onEnd = onEnd;
    if (onError) this.callbacks.onError = onError;

    this.recognition = this.createRecognition();
  }

  private safeStart(): boolean {
    if (!this.recognition) {
      this.recognition = this.createRecognition();
    }
    if (!this.recognition) return false;

    try {
      this.recognition.lang = this.currentLang;
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      // If recognition is already started or state is dirty, recreate it
      if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
        try {
          this.recognition.abort();
        } catch {
          // ignore
        }
        this.recognition = this.createRecognition();
        try {
          this.recognition?.start();
          this.isListening = true;
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  public startListening(lang: string = 'hi-IN'): { success: boolean; message?: string } {
    if (!this.isSpeechSupported()) {
      const msg = 'इस ब्राउज़र में Web Speech API उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें या नीचे टेक्स्ट बॉक्स में टाइप करें।';
      if (this.callbacks.onError) {
        this.callbacks.onError('not-supported', msg);
      }
      return { success: false, message: msg };
    }

    this.currentLang = lang;
    this.shouldKeepListening = true;

    // Start recognition safely
    const started = this.safeStart();

    // Start audio frequency analysis safely (non-blocking)
    this.startMicAudioAnalysis().catch(() => {});

    if (started) {
      this.playSciFiBeep(640, 0.08);
      return { success: true };
    } else {
      const errMsg = 'माइक चालू नहीं हो सका। कृपया दोबारा कोशिश करें या पेज रिफ्रेश करें।';
      if (this.callbacks.onError) {
        this.callbacks.onError('start-failed', errMsg);
      }
      return { success: false, message: errMsg };
    }
  }

  public stopListening() {
    this.shouldKeepListening = false;
    this.isListening = false;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }

    this.stopMicAudioAnalysis();
  }

  public speak(
    text: string,
    profileId: VoiceProfileId = 'MAYRA',
    options?: { onStart?: () => void; onEnd?: () => void }
  ) {
    if (!this.synth) return;

    try {
      this.synth.cancel();
    } catch {
      // ignore
    }

    // Clean text: strip markdown symbols and action tags
    const cleanText = text
      .replace(/\[\[ACTION:.*?\]\]/g, '')
      .replace(/[*_#`~>]/g, '')
      .trim();

    if (!cleanText) return;

    // Unpause speech synthesis if browser paused it
    if (this.synth.paused) {
      try {
        this.synth.resume();
      } catch {
        // ignore
      }
    }

    // Play subtle scifi vocal indicator beep
    try {
      this.playSciFiBeep(700, 0.05);
    } catch {
      // ignore
    }

    // Pause recognition while speaking so MAYRA does not hear herself
    this.isSpeaking = true;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Protect against Chrome GC bug by attaching to window
    if (typeof window !== 'undefined') {
      (window as any)._mayraActiveUtterance = utterance;
    }

    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();

    // Pick best voice for persona
    let matchedVoice = null;
    if (profileId === 'MAYRA') {
      utterance.lang = 'hi-IN';
      matchedVoice =
        voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang.includes('IN') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india')) ||
        null;
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
    } else if (profileId === 'JARVIS') {
      utterance.lang = 'en-GB';
      matchedVoice =
        voices.find((v) => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('British')) ||
        null;
      utterance.pitch = 0.85;
      utterance.rate = 0.95;
    } else if (profileId === 'NATASHA') {
      utterance.lang = 'en-US';
      matchedVoice =
        voices.find((v) => v.lang.includes('en-US') && v.name.includes('Female')) ||
        voices.find((v) => v.lang.includes('en')) ||
        null;
      utterance.pitch = 1.15;
      utterance.rate = 1.05;
    } else if (profileId === 'FRIDAY') {
      utterance.lang = 'en-IE';
      matchedVoice =
        voices.find((v) => v.lang.includes('en-IE') || v.lang.includes('en-GB')) ||
        null;
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let finishCalled = false;
    const handleSpeechFinish = () => {
      if (finishCalled) return;
      finishCalled = true;
      this.isSpeaking = false;
      if (typeof window !== 'undefined') {
        (window as any)._mayraActiveUtterance = null;
      }
      if (options?.onEnd) options.onEnd();

      // Resume recognition if user had listening mode active
      if (this.shouldKeepListening) {
        setTimeout(() => {
          if (this.shouldKeepListening && !this.isSpeaking) {
            this.safeStart();
          }
        }, 300);
      }
    };

    utterance.onstart = () => {
      if (options?.onStart) options.onStart();
    };

    utterance.onend = handleSpeechFinish;
    utterance.onerror = () => handleSpeechFinish();

    // Failsafe timeout based on text length (max 15s) so state is never permanently stuck
    const maxSpeechDurationMs = Math.min(20000, Math.max(3500, cleanText.length * 90));
    setTimeout(() => {
      if (this.isSpeaking && !finishCalled) {
        handleSpeechFinish();
      }
    }, maxSpeechDurationMs);

    try {
      this.synth.speak(utterance);
      // Double check resume in case browser queued it
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      handleSpeechFinish();
    }
  }

  public stopSpeaking() {
    this.isSpeaking = false;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
  }

  // Web Audio Context for Reactive Visualizer & Triple Clap Detection
  public async startMicAudioAnalysis(
    onAudioLevel?: (level: number) => void,
    onTripleClap?: () => void
  ) {
    if (onAudioLevel) this.callbacks.onAudioLevel = onAudioLevel;
    if (onTripleClap) this.callbacks.onTripleClap = onTripleClap;

    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.micStream && navigator.mediaDevices?.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      }

      if (!this.audioContext || !this.micStream) return;

      if (!this.analyser) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.65;

        const source = this.audioContext.createMediaStreamSource(this.micStream);
        source.connect(this.analyser);
      }

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);

        if (this.callbacks.onAudioLevel) {
          this.callbacks.onAudioLevel(normalized);
        }

        // Triple Clap Detection Algorithm
        if (this.clapDetectionEnabled && normalized > 0.68) {
          const now = Date.now();
          if (now - this.lastClapTime > 180) {
            this.clapData.push(now);
            this.lastClapTime = now;

            // Keep claps within the last 1500ms
            this.clapData = this.clapData.filter((t) => now - t <= 1500);

            if (this.clapData.length >= 3) {
              this.clapData = [];
              if (this.callbacks.onTripleClap) {
                this.playSciFiBeep(1200, 0.15);
                this.callbacks.onTripleClap();
              }
            }
          }
        }

        this.animFrameId = requestAnimationFrame(analyze);
      };

      if (!this.animFrameId) {
        this.animFrameId = requestAnimationFrame(analyze);
      }
    } catch (e) {
      // Audio stream error should not crash speech recognition
      console.warn('Audio analysis unavailable or mic busy:', e);
    }
  }

  public stopMicAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      this.micStream = null;
    }
    this.analyser = null;
  }

  // Futuristic Sound Synthesizer
  public playSciFiBeep(
    frequency: number = 880,
    duration: number = 0.1,
    type: OscillatorType = 'sine'
  ) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio playback restrictions
    }
  }

  public playAlarmChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public setWakeWordEnabled(val: boolean) {
    this.wakeWordEnabled = val;
  }

  public setClapDetectionEnabled(val: boolean) {
    this.clapDetectionEnabled = val;
  }

  public setLanguage(lang: string) {
    this.currentLang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}

export const voiceService = new VoiceService();
