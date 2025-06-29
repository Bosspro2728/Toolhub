"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChartBar, Plus, Minus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as math from "mathjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function GraphPlotter() {
  const [values, setValues] = useState("5,10,8,12,6");
  const [equation, setEquation] = useState("y = 3*x + 1");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [activeTab, setActiveTab] = useState<"both" | "values" | "equation">("both");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // 1) Build the X‐range as an inclusive array of integers
  const length = xMax - xMin + 1;
  const xRange = length > 0 ? Array.from({ length }, (_, i) => xMin + i) : [];

  // 2) Compute the equation’s Y‐values, preserving array length
  let equationValues: (number | null)[] = [];
  try {
    // Assume format "y = <expression>"
    const expr = equation.includes("=") ? equation.split("=")[1].trim() : equation.trim();
    equationValues = xRange.map((x) => {
      try {
        const result = math.evaluate(expr, { x });
        // If math.evaluate returns something invalid, treat as null
        return typeof result === "number" && !Number.isNaN(result) ? result : null;
      } catch {
        return null;
      }
    });
  } catch {
    // In case splitting or evaluation fails entirely
    equationValues = xRange.map(() => null);
  }

  // 3) Parse the comma‐separated "values" string into numeric array
  const parsedValues = values
    .split(",")
    .map((v) => parseFloat(v.trim()))
    .map((num) => (isNaN(num) ? null : num));

  // Build user‐defined data points: x = index, y = parsedValues[index]
  const userDefinedData = parsedValues
    .map((y, i) => (y !== null ? { x: i, y } : null))
    .filter((pt): pt is { x: number; y: number } => pt !== null);

  // 4) Prepare the Chart.js data object
  const data = {
    datasets: [
      // “My Values” dataset
      (activeTab === "values" || activeTab === "both") && userDefinedData.length > 0
        ? {
            label: "My Values",
            data: userDefinedData,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f6",
            tension: 0.3,
            showLine: true,
            pointRadius: 4,
          }
        : null,
      // “Equation Graph” dataset
      (activeTab === "equation" || activeTab === "both") &&
      equationValues.some((y) => y !== null)
        ? {
            label: `Graph of ${equation}`,
            data: xRange.map((x, idx) => ({
              x,
              y: equationValues[idx] !== null ? equationValues[idx] as number : NaN,
            })),
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderDash: [5, 5],
            tension: 0.3,
            showLine: true,
            pointRadius: 0,
          }
        : null,
    ].filter(Boolean),
  };

  // 5) Chart options that respect dark/light theme
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
      title: {
        display: true,
        text: "Dynamic Graph Plotter",
        color: isDark ? "#e5e7eb" : "#374151",
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        title: {
          display: true,
          text: "x",
          color: isDark ? "#e5e7eb" : "#374151",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
      y: {
        title: {
          display: true,
          text: "y",
          color: isDark ? "#e5e7eb" : "#374151",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
    },
  };

  // 6) Zoom and reset handlers
  const handleZoomIn = () => {
    if (xMax - xMin <= 4) return;
    setXMin((prev) => prev + 2);
    setXMax((prev) => prev - 2);
    toast.success("Zoomed in");
  };

  const handleZoomOut = () => {
    setXMin((prev) => prev - 2);
    setXMax((prev) => prev + 2);
    toast.success("Zoomed out");
  };

  const handleReset = () => {
    setXMin(-10);
    setXMax(10);
    toast.success("View reset");
  };

  return (
    <div className="container py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <ChartBar className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Graph Plotter</h2>
        <p className="text-muted-foreground mt-2">Plot and visualize mathematical functions and data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Chart and inputs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plot Data</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={xMax - xMin <= 4}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inputs for values and equation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Values (comma-separated)</label>
                  <Input value={values} onChange={(e) => setValues(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Equation (e.g. y = 3*x + 1)</label>
                  <Input value={equation} onChange={(e) => setEquation(e.target.value)} />
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <Line data={data} options={options} className="max-h-[400px]" />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">My Values</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0 border-t-2 border-dashed border-green-500"></div>
                  <span className="text-muted-foreground">Equation Graph</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Settings and tips */}
        <div className="space-y-6">
          {/* Graph Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Graph Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">X-Axis Range</label>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{xMin}</span>
                  <span>{xMax}</span>
                </div>
                <div className="px-2">
                  <Slider
                    value={[xMin, xMax]}
                    min={-20}
                    max={20}
                    step={1}
                    onValueChange={([min, max]) => {
                      setXMin(min);
                      setXMax(max);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Mode</label>
                <Select value={activeTab} onValueChange={(val: string) => setActiveTab(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="values">Values Only</SelectItem>
                    <SelectItem value="equation">Equation Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Enter comma-separated values to plot points</li>
                <li>• Use standard mathematical notation for equations</li>
                <li>• Use <code>*</code> for multiplication (e.g., <code>3*x</code>)</li>
                <li>• Supported functions: <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>sqrt</code>, etc.</li>
                <li>• Zoom in/out to adjust the view</li>
                <li>• Switch between different display modes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
