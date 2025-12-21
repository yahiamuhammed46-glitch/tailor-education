import { Button } from "@/components/ui/button";
import { Volume2, Pause, Play, Square, Settings2, Loader2, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface VoicePlayerProps {
  text: string;
  compact?: boolean;
}

// ElevenLabs voices with Arabic support - expanded collection
const ELEVENLABS_VOICES = [
  // أصوات عربية متخصصة
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", description: "صوت أنثوي واضح ومميز", category: "أنثوي" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "صوت أنثوي طبيعي ودافئ", category: "أنثوي" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "صوت أنثوي احترافي", category: "أنثوي" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "صوت أنثوي ناعم وهادئ", category: "أنثوي" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "صوت أنثوي حيوي", category: "أنثوي" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", description: "صوت أنثوي واثق", category: "أنثوي" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", description: "صوت محايد هادئ", category: "أنثوي" },
  // أصوات ذكورية
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "صوت ذكوري عميق وواضح", category: "ذكوري" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "صوت ذكوري بريطاني", category: "ذكوري" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "صوت ذكوري شاب", category: "ذكوري" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "صوت ذكوري ناضج", category: "ذكوري" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "صوت ذكوري ودود", category: "ذكوري" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", description: "صوت ذكوري قوي", category: "ذكوري" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", description: "صوت ذكوري ودي", category: "ذكوري" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", description: "صوت ذكوري أمريكي", category: "ذكوري" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", description: "صوت ذكوري واضح", category: "ذكوري" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", description: "صوت ذكوري سلس", category: "ذكوري" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", description: "صوت ذكوري دافئ", category: "ذكوري" },
];

const VoicePlayer = ({ text, compact = false }: VoicePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(ELEVENLABS_VOICES[0].id);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playWithElevenLabs = useCallback(async () => {
    if (!text) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId: selectedVoiceId }),
        }
      );

      if (!response.ok) {
        throw new Error("فشل في توليد الصوت");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      audio.onpause = () => {
        setIsPaused(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        toast.error("حدث خطأ أثناء تشغيل الصوت");
      };

      await audio.play();
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      toast.error("فشل في توليد الصوت. جاري استخدام الصوت البديل...");
      // Fallback to browser TTS
      playWithBrowserTTS();
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoiceId]);

  const playWithBrowserTTS = useCallback(() => {
    if (!text || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text]);

  const handleSpeak = () => {
    if (isPlaying && !isPaused) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        window.speechSynthesis.pause();
      }
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      if (audioRef.current) {
        audioRef.current.play();
      } else {
        window.speechSynthesis.resume();
      }
      setIsPaused(false);
    } else {
      // Start playing
      if (useElevenLabs) {
        playWithElevenLabs();
      } else {
        playWithBrowserTTS();
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSpeak}
          disabled={isLoading}
          title={isPlaying ? (isPaused ? "متابعة" : "إيقاف مؤقت") : "استمع"}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPlaying ? (
            isPaused ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>
        {isPlaying && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleStop}
            title="إيقاف"
          >
            <Square className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  const selectedVoice = ELEVENLABS_VOICES.find((v) => v.id === selectedVoiceId);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isPlaying ? "secondary" : "outline"}
        size="sm"
        onClick={handleSpeak}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ التحميل...
          </>
        ) : isPlaying ? (
          isPaused ? (
            <>
              <Play className="h-4 w-4" />
              متابعة
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              إيقاف مؤقت
            </>
          )
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            استمع للشرح
            {useElevenLabs && <Sparkles className="h-3 w-3 text-accent" />}
          </>
        )}
      </Button>

      {isPlaying && (
        <Button variant="ghost" size="icon" onClick={handleStop} title="إيقاف">
          <Square className="h-4 w-4" />
        </Button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="إعدادات الصوت">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            {/* ElevenLabs Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-1">
                  صوت واقعي
                  <Sparkles className="h-3 w-3 text-accent" />
                </Label>
                <p className="text-xs text-muted-foreground">
                  استخدام ElevenLabs AI
                </p>
              </div>
              <Switch
                checked={useElevenLabs}
                onCheckedChange={setUseElevenLabs}
              />
            </div>

            {/* Voice Selection */}
            {useElevenLabs && (
              <div className="space-y-2">
                <Label>اختر الصوت</Label>
                <Select
                  value={selectedVoiceId}
                  onValueChange={setSelectedVoiceId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedVoice?.name} - {selectedVoice?.description}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">أصوات أنثوية</div>
                      {ELEVENLABS_VOICES.filter(v => v.category === "أنثوي").map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{voice.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {voice.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">أصوات ذكورية</div>
                      {ELEVENLABS_VOICES.filter(v => v.category === "ذكوري").map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{voice.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {voice.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!useElevenLabs && (
              <p className="text-xs text-muted-foreground">
                سيتم استخدام صوت المتصفح الافتراضي
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VoicePlayer;
