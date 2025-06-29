"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Check, Copy } from "lucide-react";
import { toast } from "sonner";

const timezones = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export default function TimezoneConverter() {
  const [sourceTZ, setSourceTZ] = useState("UTC");
  const [targetTZ, setTargetTZ] = useState("America/New_York");
  const [dateTime, setDateTime] = useState("");
  const [convertedTime, setConvertedTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = () => {
    if (!dateTime.trim()) {
      toast.error("Please enter a date/time value");
      return;
    }

    setIsLoading(true);
    try {
      const inputDate = new Date(dateTime);

      const sourceDate = new Date(
        inputDate.toLocaleString("en-US", { timeZone: sourceTZ })
      );

      const targetDate = new Date(
        sourceDate.toLocaleString("en-US", { timeZone: targetTZ })
      );

      const formatted = targetDate.toLocaleString("en-US", {
        timeZone: targetTZ,
        dateStyle: "full",
        timeStyle: "long",
      });

      setConvertedTime(formatted);
      toast.success("Time converted successfully!");
    } catch (error) {
      toast.error("Invalid date/time input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!convertedTime) return;
    navigator.clipboard.writeText(convertedTime);
    setCopied(true);
    toast.success("Converted time copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Clock className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Timezone Converter</h2>
        <p className="text-muted-foreground mt-2">Convert date and time between timezones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">From</label>
                  <Select value={sourceTZ} onValueChange={setSourceTZ}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Source Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">To</label>
                  <Select value={targetTZ} onValueChange={setTargetTZ}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Target Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="datetime" className="text-sm font-medium">
                    Input Date/Time
                  </label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Converted Output</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!convertedTime}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={convertedTime}
                    readOnly
                    className="font-mono text-sm min-h-[100px] bg-muted"
                    placeholder="Converted time will appear here..."
                  />
                </div>
              </div>

              <Button
                onClick={handleConvert}
                disabled={isLoading || !dateTime.trim()}
                className="w-full"
              >
                {isLoading ? "Converting..." : "Convert Time"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Timezones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-muted-foreground">
                {timezones.map((tz) => (
                  <li key={tz}>• {tz}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Format</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Format: <code>YYYY-MM-DDTHH:mm</code></li>
                <li>• Example: <code>2025-06-06T15:30</code></li>
                <li>• Uses your local timezone for entry</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
