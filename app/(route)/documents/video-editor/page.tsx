"use client";

import { useRef, useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { PageHeader } from "@/components/shared/page-header";
import ToolWrapper from "@/components/shared/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Video as VideoIcon,
  Upload,
  Download,
  Play,
  Pause,
  Scissors,
  Volume2,
  Settings,
  Image as ImageIcon,
  Type,
  Sparkles,
  FastForward,
  RotateCw,
  Crop,
  Camera,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export default function VideoEditorPage() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("input.mp4");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);

  const [startTrim, setStartTrim] = useState(0);
  const [endTrim, setEndTrim] = useState(0);
  const [effect, setEffect] = useState<"none" | "grayscale">("none");

  // Load FFmpeg on first client render
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadFFmpeg = async () => {
      setLoading(true);
      const base = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      const ff = new FFmpeg();
      ffmpegRef.current = ff;
      await ff.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(
          `${base}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      setLoaded(true);
      setLoading(false);
      toast.success("FFmpeg ready");
    };
    loadFFmpeg().catch(() => toast.error("Failed to load FFmpeg"));
  }, []);

  // File inputs
  const pickVideo = () => fileInputRef.current?.click();
  const pickLogo = () => logoInputRef.current?.click();
  const pickText = () => textInputRef.current?.click();

  const onVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoUrl(URL.createObjectURL(f));
    setFileName(f.name);
    setCurrentTime(0);
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ff = ffmpegRef.current!;
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await fetchFile(file);
    await ff.writeFile("logo.png", data);
    toast.success("Logo loaded");
  };

  const onTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ff = ffmpegRef.current!;
    const text = e.target.value;
    // write to a text file so drawtext can read it
    await ff.writeFile("caption.txt", new TextEncoder().encode(text));
    toast.success("Caption set");
  };

  const captureFrame = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    c.toBlob((b) => {
      if (b) downloadBlob(b, `frame_${Math.floor(currentTime)}.png`);
    });
  };

  // Video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => {
      setDuration(v.duration);
      setStartTrim(0);
      setEndTrim(v.duration);
    };
    const onTime = () => setCurrentTime(v.currentTime);
    const onPlayPause = () => setIsPlaying(!v.paused);

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlayPause);
    v.addEventListener("pause", onPlayPause);
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlayPause);
      v.removeEventListener("pause", onPlayPause);
    };
  }, [videoUrl]);

  // Controls
  const togglePlay = () => {
    const v = videoRef.current!;
    v.paused ? v.play() : v.pause();
  };
  const onSeek = ([t]: number[]) => {
    const v = videoRef.current!;
    v.currentTime = t;
  };
  const onVol = ([vol]: number[]) => {
    const v = videoRef.current!;
    v.volume = vol / 100;
    setVolume(vol);
  };

  // Download helper
  const downloadBlob = (blob: Blob, name: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  // Core processing runner
  const runFF = async (args: string[], outName: string) => {
    const ff = ffmpegRef.current!;
    await ff.writeFile("input.mp4", await fetchFile(videoUrl));
    await ff.exec(args);
    const data = (await ff.readFile(outName)) as any;
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    downloadBlob(blob, outName);
    toast.success(`${outName} ready`);
  };

  // Feature handlers
  const doTrim = () =>
    runFF(
      [
        "-i",
        "input.mp4",
        "-ss",
        `${startTrim}`,
        "-to",
        `${endTrim}`,
        ...(effect === "grayscale" ? ["-vf", "hue=s=0"] : []),
        "output_trim.mp4",
      ],
      "output_trim.mp4"
    );

  const overlayLogo = () =>
    runFF(
      [
        "-i",
        "input.mp4",
        "-i",
        "logo.png",
        "-filter_complex",
        "[0:v][1:v]overlay=10:10:enable='between(t,2,5)'",
        "-c:a",
        "copy",
        "output_logo.mp4",
      ],
      "output_logo.mp4"
    );

  const addText = () =>
    runFF(
      [
        "-i",
        "input.mp4",
        "-vf",
        "drawtext=fontfile=/path/to/font.ttf:textfile=caption.txt:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-50:enable='between(t,1,4)'",
        "-c:a",
        "copy",
        "output_text.mp4",
      ],
      "output_text.mp4"
    );

  const fadeInOut = () =>
    runFF(
      [
        "-i",
        "input.mp4",
        "-vf",
        `fade=t=in:st=0:d=2,fade=t=out:st=${duration - 2}:d=2`,
        "-af",
        `afade=t=in:st=0:d=2,afade=t=out:st=${duration - 2}:d=2`,
        "output_fade.mp4",
      ],
      "output_fade.mp4"
    );

  const speedUp = () =>
    runFF(
      [
        "-i",
        "input.mp4",
        "-filter_complex",
        "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2[a]",
        "-map",
        "[v]",
        "-map",
        "[a]",
        "output_speed.mp4",
      ],
      "output_speed.mp4"
    );

  const rotate = () =>
    runFF(["-i", "input.mp4", "-vf", "transpose=1", "output_rotated.mp4"], "output_rotated.mp4");

  const crop = () =>
    runFF(
      ["-i", "input.mp4", "-vf", "crop=640:360:(in_w-640)/2:(in_h-360)/2", "output_crop.mp4"],
      "output_crop.mp4"
    );

  return (
    <div className="container py-8 md:py-12">
      <PageHeader title="Video Editor" description="Trim, grayscale & capture frames entirely in-browser" />
      <Separator className="my-8" />

      {!loaded ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Button
            size="lg"
            variant="outline"
            onClick={pickVideo}
            disabled={loading}
            className="px-8 py-4 text-lg"
          >
            {loading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" /> Loading FFmpeg…
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" /> Upload Video to Init
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Hidden inputs */}
          <input ref={fileInputRef} type="file" accept="video/*" onChange={onVideoChange} className="hidden" />
          <input ref={logoInputRef} type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
          <input ref={textInputRef} type="text" placeholder="Caption text" onBlur={onTextChange} className="hidden" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              <ToolWrapper title="Video Editor">
                <div className="space-y-6">
                  {/* Upload & Download */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={pickVideo}>
                      <Upload className="h-4 w-4 mr-2" /> Upload Video
                    </Button>
                    <Button
                      variant={isPlaying ? "destructive" : "default"}
                      onClick={togglePlay}
                      disabled={!videoUrl}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => downloadBlob(new Blob([await fetchFile(videoUrl)]), fileName)}
                      disabled={!videoUrl}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download Original
                    </Button>
                  </div>

                  {/* Video Preview */}
                  <div className="aspect-video bg-muted rounded-xl shadow-lg flex items-center justify-center border border-muted-foreground/10">
                    {videoUrl ? (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain rounded-xl"
                        controls={false}
                      />
                    ) : (
                      <div className="text-center">
                        <VideoIcon className="h-14 w-14 mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground text-lg">Upload to begin</p>
                      </div>
                    )}
                  </div>

                  {/* Seek & volume */}
                  <div className="space-y-3">
                    <Slider
                      value={[currentTime]}
                      onValueChange={onSeek}
                      min={0}
                      max={duration}
                      step={0.1}
                      disabled={!videoUrl}
                    />
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>
                        {new Date(currentTime * 1000)
                          .toISOString()
                          .substring(14, 19)}
                      </span>
                      <span>
                        {new Date(duration * 1000)
                          .toISOString()
                          .substring(14, 19)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Volume2 className="opacity-70" />
                      <Slider
                        value={[volume]}
                        onValueChange={onVol}
                        min={0}
                        max={100}
                        step={1}
                        className="w-28"
                        disabled={!videoUrl}
                      />
                      <Select
                        value={effect}
                        onValueChange={(v) => setEffect(v as any)}
                        disabled={!videoUrl}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Effect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="grayscale">Grayscale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Trim & Export */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Start: {startTrim.toFixed(1)}s</span>
                      <span>End: {endTrim.toFixed(1)}s</span>
                    </div>
                    <Slider
                      value={[startTrim, endTrim]}
                      onValueChange={([s, e]) => {
                        setStartTrim(s);
                        setEndTrim(e);
                        setCurrentTime(Math.min(Math.max(currentTime, s), e));
                      }}
                      min={0}
                      max={duration}
                      step={0.1}
                      disabled={!videoUrl}
                    />
                    <Button
                      variant="default"
                      onClick={doTrim}
                      disabled={!videoUrl}
                      className="w-full"
                    >
                      <Scissors className="h-4 w-4 mr-2" /> Trim & Export
                    </Button>
                  </div>

                  {/* Advanced actions */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                    <Button variant="outline" onClick={pickLogo} disabled={!videoUrl}>
                      <ImageIcon className="h-4 w-4 mr-2" /> Load Logo
                    </Button>
                    <Button variant="outline" onClick={overlayLogo} disabled={!videoUrl}>
                      <Star className="h-4 w-4 mr-2" /> Overlay Logo
                    </Button>
                    <Button variant="outline" onClick={pickText} disabled={!videoUrl}>
                      <Type className="h-4 w-4 mr-2" /> Set Caption
                    </Button>
                    <Button variant="outline" onClick={addText} disabled={!videoUrl}>
                      <Type className="h-4 w-4 mr-2" /> Add Caption
                    </Button>
                    <Button variant="outline" onClick={fadeInOut} disabled={!videoUrl}>
                      <Sparkles className="h-4 w-4 mr-2" /> Fade In/Out
                    </Button>
                    <Button variant="outline" onClick={speedUp} disabled={!videoUrl}>
                      <FastForward className="h-4 w-4 mr-2" /> Speed ×2
                    </Button>
                    <Button variant="outline" onClick={rotate} disabled={!videoUrl}>
                      <RotateCw className="h-4 w-4 mr-2" /> Rotate 90°
                    </Button>
                    <Button variant="outline" onClick={crop} disabled={!videoUrl}>
                      <Crop className="h-4 w-4 mr-2" /> Crop Center
                    </Button>
                    <Button variant="outline" onClick={captureFrame} disabled={!videoUrl}>
                      <Camera className="h-4 w-4 mr-2" /> Capture Frame
                    </Button>
                  </div>
                </div>
              </ToolWrapper>
            </div>

            {/* Sidebar */}
            <div>
              {/* <ToolWrapper title="Pro Features">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg border border-muted-foreground/10">
                    <p className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" /> Advanced Effects
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Professional video effects and transitions
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-muted-foreground/10">
                    <p className="font-semibold flex items-center gap-2">
                      <VideoIcon className="h-4 w-4 text-blue-500" /> 4K Support
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Edit and export in 4K quality
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-muted-foreground/10">
                    <p className="font-semibold flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-green-500" /> Audio Enhancement
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Advanced audio editing tools
                    </p>
                  </div>
                  <div className="mt-6 text-center">
                    <Button size="lg" className="w-full">
                      <Star className="h-4 w-4 mr-2" /> Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </ToolWrapper> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
