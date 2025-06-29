"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unitCategories, convertUnit } from "@/utils/unitConverter";
import { RulerIcon } from 'lucide-react';

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [input, setInput] = useState("1");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("kilometers");

  const converted = convertUnit(parseFloat(input || "0"), fromUnit, toUnit);
  const units = unitCategories[category];

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <RulerIcon className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unit Converter</h2>
        <p className="text-muted-foreground mt-2">Convert between different units of measurement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Convert Units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => {
                  setCategory(v);
                  setFromUnit(unitCategories[v][0]);
                  setToUnit(unitCategories[v][1]);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(unitCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label>From</Label>
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>To</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isNaN(converted) ? "Invalid conversion" : `${converted.toFixed(6)} ${toUnit}`}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {input} {fromUnit} = {isNaN(converted) ? "?" : converted.toFixed(6)} {toUnit}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="p-3 bg-muted rounded-md text-gray-700 dark:text-gray-300">
                  1 meter = 3.28084 feet
                </div>
                <div className="p-3 bg-muted rounded-md text-gray-700 dark:text-gray-300">
                  1 kilogram = 2.20462 pounds
                </div>
                <div className="p-3 bg-muted rounded-md text-gray-700 dark:text-gray-300">
                  1 liter = 0.264172 gallons
                </div>
                <div className="p-3 bg-muted rounded-md text-gray-700 dark:text-gray-300">
                  1 kilometer = 0.621371 miles
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.keys(unitCategories).map((cat) => (
                  <div key={cat} className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{cat.charAt(0).toUpperCase() + cat.slice(1)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {unitCategories[cat].join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}