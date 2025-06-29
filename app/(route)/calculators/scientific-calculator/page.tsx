"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, RefreshCw } from "lucide-react";
import * as math from "mathjs";
import { toast } from "sonner";

function ScientificCalc() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    if (!expression.trim()) {
      toast.error("Please enter an expression");
      return;
    }

    setIsCalculating(true);
    try {
      const calculatedResult = math.evaluate(expression);
      setResult(calculatedResult.toString());
      toast.success("Calculation complete!");
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
      toast.error("Invalid expression");
    } finally {
      setIsCalculating(false);
    }
  };

  const examples = [
    { expr: "2 inch to cm", solution: "5.08 cm" },
    { expr: "sin(30 deg)", solution: "0.5" },
    { expr: "log(100, 10)", solution: "2" },
    { expr: "sqrt(16) + 2", solution: "6" },
  ];

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Calculator className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scientific Calculator
        </h2>
        <p className="text-muted-foreground mt-2">
          Solve various mathematical expressions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Expression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Expression</label>
                <Input
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="Enter mathematical expression..."
                  className="font-mono"
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isCalculating || !expression.trim()}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>

              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.startsWith("Error")
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200"
                  }`}
                >
                  <p className="font-mono text-lg">
                    {result.startsWith("Error") ? result : `Result: ${result}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="font-mono text-sm">{example.expr}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Result: {example.solution}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded-md">Basic: +, -, *, /</div>
                <div className="p-2 bg-muted rounded-md">Powers: ^</div>
                <div className="p-2 bg-muted rounded-md">Trig: sin(), cos()</div>
                <div className="p-2 bg-muted rounded-md">Log: log(), ln()</div>
                <div className="p-2 bg-muted rounded-md">Sqrt: sqrt()</div>
                <div className="p-2 bg-muted rounded-md">Abs: abs()</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
          Usage Tips
        </h3>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <li>• Use parentheses to group expressions: (2 + 3) * 4</li>
          <li>• Trigonometric functions use radians by default</li>
          <li>• Use 'deg' for degrees: sin(30 deg)</li>
          <li>• Scientific notation: 2.5e3 = 2500</li>
          <li>• Variables are supported: let x = 5</li>
        </ul>
      </div>
    </div>
  );
}

export default ScientificCalc;
