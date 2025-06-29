"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitBranch, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import collatzSequence from "@/utils/collatz";

export default function CollatzConjecture() {
  const [number, setNumber] = useState("47");
  const [aValue, setAValue] = useState("3");
  const [bValue, setBValue] = useState("1");
  const [divider, setDivider] = useState("2");
  const [expectedValue, setExpectedValue] = useState("1");
  const [result, setResult] = useState<{
    sequence: number[];
    numLoop: number;
    print_sequence: string;
    message: string;
  } | null>(null);

  const handleCalculate = () => {
    const n = parseInt(number);
    const a = parseInt(aValue);
    const b = parseInt(bValue);
    const d = parseInt(divider);
    const e = parseInt(expectedValue);

    if (isNaN(n) || isNaN(a) || isNaN(b) || isNaN(d) || isNaN(e)) {
      toast.error("Please enter valid numbers");
      return;
    }

    const { sequence, numLoop } = collatzSequence(n, a, b, e, d);
    const print_sequence = sequence.join(" → ");
    const message = sequence[sequence.length - 1] === e
      ? `It took ${sequence.length - 1} steps to reach ${e}.`
      : `It took ${numLoop} steps to finish.`;

    setResult({ sequence, numLoop, print_sequence, message });
    toast.success("Sequence calculated!");
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <GitBranch className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Collatz Conjecture Calculator</h2>
        <p className="text-muted-foreground mt-2">Explore the famous Collatz Conjecture with custom parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Sequence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Starting Number</label>
                  <Input
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter starting number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Value</label>
                  <Input
                    type="number"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    placeholder="Enter expected value"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Coefficient (a)</label>
                  <Input
                    type="number"
                    value={aValue}
                    onChange={(e) => setAValue(e.target.value)}
                    placeholder="Enter coefficient a"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Constant (b)</label>
                  <Input
                    type="number"
                    value={bValue}
                    onChange={(e) => setBValue(e.target.value)}
                    placeholder="Enter constant b"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Divider</label>
                  <Input
                    type="number"
                    value={divider}
                    onChange={(e) => setDivider(e.target.value)}
                    placeholder="Enter divider"
                  />
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full">Calculate Sequence</Button>

              {result && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Sequence</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.sequence.map((num, index) => (
                        <div key={index} className="flex items-center">
                          <span className="font-mono">{num}</span>
                          {index < result.sequence.length - 1 && (
                            <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.message}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Conjecture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The Collatz conjecture is a famous unsolved problem in mathematics. For a given positive integer,
                if it's even, divide it by the divider; if it's odd, multiply by coefficient a and add constant b.
                Repeat this process until reaching the expected value.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Standard Parameters</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Coefficient (a) = 3</li>
                    <li>• Constant (b) = 1</li>
                    <li>• Divider = 2</li>
                    <li>• Expected Value = 1</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Sequences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Starting with 6:</p>
                  <p className="text-sm text-muted-foreground">6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Starting with 7:</p>
                  <p className="text-sm text-muted-foreground">7 → 22 → 11 → 34 → 17 → 52 → 26 → 13 → 40 → 20 → 10 → 5 → 16 → 8 → 4 → 2 → 1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}