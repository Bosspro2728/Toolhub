"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ArrowDownUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [rates, setRates] = useState();
  const [converted, setConverted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "MXN"];

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        const data = await res.json();
        console.log(data)
        setRates(data.rates);
        toast.success("Exchange rates updated");
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        toast.error("Failed to fetch exchange rates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [fromCurrency]);

  useEffect(() => {
    if (rates && rates[toCurrency]) {
      setConverted(amount * rates[toCurrency]);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <DollarSign className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Currency Converter</h2>
        <p className="text-muted-foreground mt-2">Convert between different currencies with live exchange rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Convert Currency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Amount</Label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <div>
                  <Label className="mb-2">From</Label>
                  <Select value={fromCurrency} onValueChange={(e) => setFromCurrency(e)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((cur) => (
                        <SelectItem key={cur} value={cur}>
                          {cur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSwapCurrencies}
                  variant="outline"
                  size="icon"
                  className="mt-6"
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>

                <div>
                  <Label className="mb-2">To</Label>
                  <Select value={toCurrency} onValueChange={(e) => setToCurrency(e)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((cur) => (
                        <SelectItem key={cur} value={cur}>
                          {cur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                ) : converted !== null ? (
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">
                      {amount} {fromCurrency} equals
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {converted.toFixed(2)} {toCurrency}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      1 {fromCurrency} = {rates?.[toCurrency]?.toFixed(4)} {toCurrency}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">Enter an amount to convert</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currencies.slice(0, 5).map((currency) => (
                  <div key={currency} className="p-3 bg-muted rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{currency}</span>
                      {rates && (
                        <span className="text-sm text-muted-foreground">
                          1 {fromCurrency} = {rates[currency]?.toFixed(4)} {currency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Info</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time exchange rates</li>
                <li>• Data provided by exchangerate.host</li>
                <li>• Updated every hour</li>
                <li>• Support for major currencies</li>
                <li>• Market rates for reference only</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}