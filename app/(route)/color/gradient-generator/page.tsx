"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from "sonner"; // Add this if you use sonner for toasts


export default function GradientGeneratorPage() {
  const [color1, setColor1] = useState('#3B82F6');
  const [color2, setColor2] = useState('#EC4899');
  const [direction, setDirection] = useState('to right');
  const [type, setType] = useState('linear');
  const [copied, setCopied] = useState<"css" | "tailwind" | null>(null);

  const directions = [
    { value: 'to right', label: 'Left to Right' },
    { value: 'to left', label: 'Right to Left' },
    { value: 'to bottom', label: 'Top to Bottom' },
    { value: 'to top', label: 'Bottom to Top' },
    { value: 'to bottom right', label: 'Top Left to Bottom Right' },
    { value: 'to bottom left', label: 'Top Right to Bottom Left' },
  ];

  const types = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' },
    { value: 'conic', label: 'Conic' },
  ];

  const getGradientStyle = () => {
    if (type === 'linear') {
      return `linear-gradient(${direction}, ${color1}, ${color2})`;
    } else if (type === 'radial') {
      return `radial-gradient(circle, ${color1}, ${color2})`;
    } else {
      return `conic-gradient(from 0deg, ${color1}, ${color2})`;
    }
  };

  const handleCopy = (typeToCopy: "css" | "tailwind") => {
    let text = "";
    if (typeToCopy === "css") {
      text = `background: ${getGradientStyle()};`;
    } else {
      // Example: bg-gradient-to-r from-[#3B82F6] to-[#EC4899]
      if (type === "linear") {
        const dirMap: Record<string, string> = {
          "to right": "to-r",
          "to left": "to-l",
          "to bottom": "to-b",
          "to top": "to-t",
          "to bottom right": "to-br",
          "to bottom left": "to-bl",
        };
        text = `bg-gradient-${dirMap[direction] || "to-r"} from-[${color1}] to-[${color2}]`;
      } else if (type === "radial") {
        text = `bg-radial from-[${color1}] to-[${color2}]`;
      } else {
        text = `bg-conic from-[${color1}] to-[${color2}]`;
      }
    }
    navigator.clipboard.writeText(text);
    setCopied(typeToCopy);
    toast.success(`Copied ${typeToCopy === "css" ? "CSS" : "Tailwind"}!`);
    setTimeout(() => setCopied(null), 1200);
  };

  const generateRandomGradient = () => {
    // Generate two random hex colors
    const randomHex = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();
    setColor1(randomHex());
    setColor2(randomHex());
    // Optionally randomize direction/type as well
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Gradient Generator"
        description="Create beautiful color gradients for your projects"
      />
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Gradient Preview">
            <div className="space-y-6">
              <div
                className="aspect-video rounded-lg"
                style={{ background: getGradientStyle() }}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color 1</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color 2</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button onClick={() => handleCopy("css")}
                  variant={copied === "css" ? "default" : "outline"}
                  className={copied === "css" ? "ring-2 ring-primary" : ""}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied === "css" ? "Copied!" : "Copy CSS"}
                </Button>
                <Button onClick={() => handleCopy("tailwind")} 
                  variant={copied === "tailwind" ? "default" : "outline"}
                  className={copied === "tailwind" ? "ring-2 ring-primary" : ""}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied === "tailwind" ? "Copied!" : "Copy Tailwind"}
                </Button>
                <Button onClick={generateRandomGradient} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Gradient
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>
        
        <div>
          <ToolWrapper title="Gradient Settings">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gradient Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {type === 'linear' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Direction</label>
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {directions.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </ToolWrapper>
        </div>
      </div>
    </div>
  );
}