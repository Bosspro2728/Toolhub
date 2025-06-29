"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Palette, Copy, RefreshCw, Save } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Clipboard } from "lucide-react";
import { toast } from "sonner"; // If you use sonner for toasts, otherwise use your toast lib

// Helper to convert HSL to HEX
function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  s /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16).padStart(2, "0");
    return hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

// Helper to convert HEX to HSL
function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h * 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

// Helper to convert RGB to HEX
function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

// Helper to convert HEX to RGB
function hexToRgb(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return [r, g, b];
}

// Generate a palette of 4 random colors + 1 custom color
function generateRandomPalette(customColor: string) {
  const palette = Array.from({ length: 4 }).map(() => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const l = Math.floor(Math.random() * 100);
    return hslToHex(h, s, l);
  });
  palette.push(customColor);
  return palette;
}

export default function ColorGeneratorPage() {
  // HSL state for the custom color (last palette color)
  const [hue, setHue] = useState([180]);
  const [saturation, setSaturation] = useState([50]);
  const [lightness, setLightness] = useState([50]);
  const [customHex, setCustomHex] = useState(hslToHex(hue[0], saturation[0], lightness[0]));
  const [rgb, setRgb] = useState<[number, number, number]>(hexToRgb(customHex));

  // Palette state: 4 random + 1 custom
  const [colors, setColors] = useState<string[]>(
    generateRandomPalette(customHex)
  );
  const [copiedIndex, setCopiedIndex] = useState<{ idx: number; type: string } | null>(null);

  // Update custom color and palette when HSL or RGB sliders change
  const handleSliderChange = (
    type: "hue" | "saturation" | "lightness" | "r" | "g" | "b",
    value: number[]
  ) => {
    let h = hue[0], s = saturation[0], l = lightness[0];
    let [r, g, b] = rgb;
    if (type === "hue") { setHue(value); h = value[0]; }
    if (type === "saturation") { setSaturation(value); s = value[0]; }
    if (type === "lightness") { setLightness(value); l = value[0]; }
    if (type === "r") { r = value[0]; setRgb([r, g, b]); }
    if (type === "g") { g = value[0]; setRgb([r, g, b]); }
    if (type === "b") { b = value[0]; setRgb([r, g, b]); }

    // If RGB changed, update HSL and hex
    if (["r", "g", "b"].includes(type)) {
      const hex = rgbToHex(r, g, b);
      setCustomHex(hex);
      const [newH, newS, newL] = hexToHsl(hex);
      setHue([newH]);
      setSaturation([newS]);
      setLightness([newL]);
      setColors((prev) => [...prev.slice(0, 4), hex]);
    } else {
      // If HSL changed, update RGB and hex
      const hex = hslToHex(h, s, l);
      setCustomHex(hex);
      setRgb(hexToRgb(hex));
      setColors((prev) => [...prev.slice(0, 4), hex]);
    }
  };

  // Update custom color and sliders when hex input changes
  const handleHexInput = (val: string) => {
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const [h, s, l] = hexToHsl(val);
      setHue([h]);
      setSaturation([s]);
      setLightness([l]);
      setRgb(hexToRgb(val));
      setColors((prev) => [...prev.slice(0, 4), val]);
    }
  };

  // Generate new random palette (keep custom color as last)
  const generateRandomColor = () => {
    setColors(generateRandomPalette(customHex));
  };

  // Helper functions for copying formats
  const toHsl = (hex: string) => {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };
  const toRgb = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };
  const toTailwind = (hex: string) => `bg-[${hex}]`;
  const toCss = (hex: string) => `background: ${hex};`;

  const handleCopy = (text: string, idx: number, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ idx, type });
    toast.success(`Copied ${type.toUpperCase()} for color #${idx + 1}!`);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Color Generator"
        description="Generate beautiful color palettes for your projects"
      />
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Color Palette">
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-4">
                {colors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className={`aspect-square rounded-lg cursor-pointer transition-transform hover:scale-105 border ${index === 4 ? "ring-2 ring-primary" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleCopy(color, index, "hex")}
                      title={index === 4 ? "Custom color" : "Random color"}
                    />
                    <div className="flex items-center justify-between">
                      <code className="text-sm">{color}</code>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(color, index, "hex")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {index === 4 && (
                      <div className="text-xs text-center text-primary font-semibold">Custom</div>
                    )}
                  </div>
                ))}
              </div>
              {/* Copy buttons for each color and format */}
              <div className="grid grid-cols-5 gap-4 mt-6">
                {colors.map((color, index) => (
                  <div key={index} className="flex flex-col gap-2 items-center">
                    <Button
                      variant={copiedIndex?.idx === index && copiedIndex.type === "hex" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopy(color, index, "hex")}
                    >
                      <Clipboard className="h-4 w-4 mr-1" />
                      {copiedIndex?.idx === index && copiedIndex.type === "hex" ? "Copied!" : "Copy HEX"}
                    </Button>
                    <Button
                      variant={copiedIndex?.idx === index && copiedIndex.type === "hsl" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopy(toHsl(color), index, "hsl")}
                    >
                      <Clipboard className="h-4 w-4 mr-1" />
                      {copiedIndex?.idx === index && copiedIndex.type === "hsl" ? "Copied!" : "Copy HSL"}
                    </Button>
                    <Button
                      variant={copiedIndex?.idx === index && copiedIndex.type === "rgb" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopy(toRgb(color), index, "rgb")}
                    >
                      <Clipboard className="h-4 w-4 mr-1" />
                      {copiedIndex?.idx === index && copiedIndex.type === "rgb" ? "Copied!" : "Copy RGB"}
                    </Button>
                    <Button
                      variant={copiedIndex?.idx === index && copiedIndex.type === "tailwind" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopy(toTailwind(color), index, "tailwind")}
                    >
                      <Clipboard className="h-4 w-4 mr-1" />
                      {copiedIndex?.idx === index && copiedIndex.type === "tailwind" ? "Copied!" : "Copy Tailwind"}
                    </Button>
                    <Button
                      variant={copiedIndex?.idx === index && copiedIndex.type === "css" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopy(toCss(color), index, "css")}
                    >
                      <Clipboard className="h-4 w-4 mr-1" />
                      {copiedIndex?.idx === index && copiedIndex.type === "css" ? "Copied!" : "Copy CSS"}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button onClick={generateRandomColor}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>
        
        <div>
          <ToolWrapper title="Color Adjustments">
            <div className="space-y-6">
              {/* HSL Sliders */}
              <div className="space-y-2">
                <label className="text-sm font-medium">HSL Slider<br/></label>
                <label className="text-sm font-medium">Hue: {hue[0]}°</label>
                <Slider
                  value={hue}
                  onValueChange={val => handleSliderChange("hue", val)}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Saturation: {saturation[0]}%</label>
                <Slider
                  value={saturation}
                  onValueChange={val => handleSliderChange("saturation", val)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lightness: {lightness[0]}%</label>
                <Slider
                  value={lightness}
                  onValueChange={val => handleSliderChange("lightness", val)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              {/* RGB Sliders */}
              <div className="space-y-2">
                <label className="text-sm font-medium">RGB Sliders<br/></label>
                <label className="text-sm font-medium">Red: {rgb[0]}</label>
                <Slider
                  value={[rgb[0]]}
                  onValueChange={val => handleSliderChange("r", val)}
                  min={0}
                  max={255}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Green: {rgb[1]}</label>
                <Slider
                  value={[rgb[1]]}
                  onValueChange={val => handleSliderChange("g", val)}
                  min={0}
                  max={255}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Blue: {rgb[2]}</label>
                <Slider
                  value={[rgb[2]]}
                  onValueChange={val => handleSliderChange("b", val)}
                  min={0}
                  max={255}
                  step={1}
                />
              </div>
              {/* HEX Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hex Color</label>
                <Input
                  placeholder="#000000"
                  value={customHex}
                  onChange={e => handleHexInput(e.target.value)}
                  maxLength={7}
                />
              </div>
            </div>
          </ToolWrapper>
        </div>
      </div>
    </div>
  );
}