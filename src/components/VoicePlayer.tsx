import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play, Square, Settings2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface VoicePlayerProps {
  text: string;
  compact?: boolean;
}

const VoicePlayer = ({ text, compact = false }: VoicePlayerProps) => {
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  
  const {
    speak,
    stop,
    togglePause,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    isSupported,
  } = useSpeechSynthesis({ rate, pitch });

  if (!isSupported) {
    return null;
  }

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      togglePause();
    } else if (isPaused) {
      togglePause();
    } else {
      speak(text);
    }
  };

  const arabicVoices = voices.filter((v) => v.lang.startsWith("ar"));
  const otherVoices = voices.filter((v) => !v.lang.startsWith("ar"));

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSpeak}
          title={isSpeaking ? (isPaused ? "متابعة" : "إيقاف مؤقت") : "استمع"}
        >
          {isSpeaking ? (
            isPaused ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>
        {isSpeaking && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={stop}
            title="إيقاف"
          >
            <Square className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSpeaking ? "secondary" : "outline"}
        size="sm"
        onClick={handleSpeak}
        className="gap-2"
      >
        {isSpeaking ? (
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
          </>
        )}
      </Button>

      {isSpeaking && (
        <Button variant="ghost" size="icon" onClick={stop} title="إيقاف">
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
            <div className="space-y-2">
              <Label>الصوت</Label>
              <Select
                value={selectedVoice?.name || ""}
                onValueChange={(name) => {
                  const voice = voices.find((v) => v.name === name);
                  if (voice) setSelectedVoice(voice);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر صوتاً" />
                </SelectTrigger>
                <SelectContent>
                  {arabicVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        أصوات عربية
                      </div>
                      {arabicVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {otherVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        أصوات أخرى
                      </div>
                      {otherVoices.slice(0, 5).map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>السرعة</Label>
                <span className="text-xs text-muted-foreground">{rate}x</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={([v]) => setRate(v)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>النبرة</Label>
                <span className="text-xs text-muted-foreground">{pitch}</span>
              </div>
              <Slider
                value={[pitch]}
                onValueChange={([v]) => setPitch(v)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VoicePlayer;
