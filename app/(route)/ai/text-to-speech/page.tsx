"use client";

import { useState, useRef } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Download,
  History,
  HeadphonesIcon,
  Volume2,
} from 'lucide-react';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';
import { toast } from 'sonner';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('9BWtsMINqrJLrRacOk9x');
  const [speed, setSpeed] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('text_to_speech', {
    redirectToPricing: true,
    showToast: true
  });

  const voices = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
    { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam'},
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda' },
    { id: 'bIHbv24MWmeRgasZH58o', name: 'Will' },
    { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica' },
    { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
    { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris' },
    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },
    { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily' },
    { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' },
    { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry' },
  ];

  const handleGenerate = async () => {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for text-to-speech. Please upgrade your plan for more usage.");
      return;
    }
    
    setIsGenerating(true);
    try {
     const res = await fetch('/api/text-to-speach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice,
          modelId: 'eleven_multilingual_v2',
          voiceSettings: { stability: 0.5, similarity_boost: 0.75 },
          outputFormat: 'mp3_44100_128',
        }),
      });
      const { audio } = await res.json();
      if (res.ok && audio) {
      const src = `data:audio/mpeg;base64,${audio}`;
        setAudioSrc(src);
        // set up audio element
        audioRef.current = new Audio(src);
        audioRef.current.playbackRate = speed[0];
        
        // Increment usage after successful generation
        await incrementUsage();
      } else {
        console.error('Generation failed');
      }
    } catch (err) {
      console.error('Error generating audio:', err);
    } finally {
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = speed[0];
      // pitch is not supported directly on HTMLAudioElement
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!audioSrc) return;
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = 'speech.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Text to Speech"
        description="Convert text to natural-sounding speech in multiple languages"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="text_to_speech" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Text to Speech">
            <div className="space-y-6">
              <Textarea
                placeholder="Enter text to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px]"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice</label>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Speed: {speed}x
                    </label>
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={0.7}
                      max={1.2}
                      step={0.1}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isGenerating
                          ? 'Generating audio...'
                          : audioSrc
                          ? isPlaying
                            ? 'Playing'
                            : 'Ready to play'
                          : 'Audio preview'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={togglePlayback}
                      disabled={isGenerating || !audioSrc}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDownload}
                      disabled={isGenerating || !audioSrc}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!text || isGenerating || !canUse}
                  className="min-w-[200px]"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Speech'}
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div>
          <ToolWrapper title="Recent Conversions">
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent conversions</p>
              </div>
            </div>
          </ToolWrapper>

          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Neural Voices</p>
                  <p className="text-sm text-muted-foreground">
                    Access high-quality neural voices
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Batch Conversion</p>
                  <p className="text-sm text-muted-foreground">
                    Convert multiple texts at once
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">SSML Support</p>
                  <p className="text-sm text-muted-foreground">
                    Fine-tune speech with SSML tags
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <Button>Upgrade to Pro</Button>
                </div>
              </div>
            </ToolWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}