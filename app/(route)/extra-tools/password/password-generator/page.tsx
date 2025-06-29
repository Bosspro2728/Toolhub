"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { KeyRound, Copy, Check, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const generatePassword = ({ length, useUpper, useLower, useNumber, useSymbol }) => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const number = "0123456789"
  const symbol = "!@#$%^&*()_+~`|}{[]:;?><,./-="

  let chars = ""
  if (useUpper) chars += upper
  if (useLower) chars += lower
  if (useNumber) chars += number
  if (useSymbol) chars += symbol

  if (!chars) return ""

  // Ensure at least one character from each selected type
  let password = ""
  if (useUpper) password += upper[Math.floor(Math.random() * upper.length)]
  if (useLower) password += lower[Math.floor(Math.random() * lower.length)]
  if (useNumber) password += number[Math.floor(Math.random() * number.length)]
  if (useSymbol) password += symbol[Math.floor(Math.random() * symbol.length)]

  // Fill the rest randomly
  const remainingLength = length - password.length
  for (let i = 0; i < remainingLength; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

const calculatePasswordStrength = (password, options) => {
  if (!password) return { score: 0, label: "None" }

  let score = 0
  const { useUpper, useLower, useNumber, useSymbol } = options

  // Length contribution (up to 5 points)
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (password.length >= 20) score += 2

  // Character variety contribution
  if (useUpper && /[A-Z]/.test(password)) score += 1
  if (useLower && /[a-z]/.test(password)) score += 1
  if (useNumber && /\d/.test(password)) score += 1
  if (useSymbol && /[^A-Za-z0-9]/.test(password)) score += 2

  // Calculate approximate entropy
  let possibleChars = 0
  if (useUpper) possibleChars += 26
  if (useLower) possibleChars += 26
  if (useNumber) possibleChars += 10
  if (useSymbol) possibleChars += 33

  // Entropy bonus (up to 2 points)
  const entropy = Math.log2(Math.pow(possibleChars, password.length))
  if (entropy > 64) score += 1
  if (entropy > 128) score += 1

  // Cap at 10
  score = Math.min(10, score)

  const labels = [
    "None",
    "Very Weak",
    "Weak",
    "Fair",
    "Moderate",
    "Good",
    "Strong",
    "Very Strong",
    "Excellent",
    "Unbreakable",
    "Fort Knox",
  ]

  return {
    score,
    label: labels[score],
    entropy: entropy.toFixed(0),
  }
}

const getStrengthColor = (score) => {
  const colors = [
    "bg-gray-200 dark:bg-gray-700", // None
    "bg-red-500", // Very Weak
    "bg-orange-500", // Weak
    "bg-yellow-500", // Fair
    "bg-yellow-400", // Moderate
    "bg-lime-500", // Good
    "bg-green-500", // Strong
    "bg-emerald-500", // Very Strong
    "bg-cyan-500", // Excellent
    "bg-blue-500", // Unbreakable
    "bg-violet-500", // Fort Knox
  ]
  return colors[score]
}

const PasswordGenerator = () => {
  const [length, setLength] = useState(16)
  const [useUpper, setUseUpper] = useState(true)
  const [useLower, setUseLower] = useState(true)
  const [useNumber, setUseNumber] = useState(true)
  const [useSymbol, setUseSymbol] = useState(true)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [strength, setStrength] = useState({ score: 0, label: "None", entropy: "0" })

  useEffect(() => {
    // Generate a password on initial load
    handleGenerate()
  }, [])

  useEffect(() => {
    // Update strength when password or options change
    if (password) {
      setStrength(calculatePasswordStrength(password, { useUpper, useLower, useNumber, useSymbol }))
    }
  }, [password, useUpper, useLower, useNumber, useSymbol])

  const handleGenerate = () => {
    const newPassword = generatePassword({ length, useUpper, useLower, useNumber, useSymbol })
    setPassword(newPassword)
  }

  const handleCopy = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast("Password copied to clipboard!", {
      description: "Your generated password has been copied to your clipboard.",
    })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center justify-center">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mr-4">
          <KeyRound className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password Generator</h2>
      </div>

      <div className="w-full max-w-xl">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Generate Secure Password</CardTitle>
              <Badge className={`${getStrengthColor(strength.score)} text-white`} variant="secondary">
                {strength.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Password Output */}
            <div className="relative">
              <Input
                readOnly
                value={password || "Your secure password will appear here..."}
                className="pr-10 font-mono text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                disabled={!password}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Password Strength Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
                <span className="text-gray-600 dark:text-gray-400">Entropy: ~{strength.entropy} bits</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor(strength.score)} transition-all duration-300`}
                  style={{ width: `${(strength.score / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Length */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="length" className="text-gray-700 dark:text-gray-300">
                  Password Length
                </Label>
                <span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {length} characters
                </span>
              </div>
              <div className="px-1">
                <Slider
                  id="length"
                  min={8}
                  max={64}
                  step={1}
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                <span>8</span>
                <span>16</span>
                <span>32</span>
                <span>48</span>
                <span>64</span>
              </div>
            </div>

            {/* Character Options */}
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">Character Types</Label>
              <div className="grid grid-cols-2 gap-3">
                <Label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 text-gray-500 dark:text-gray-400">
                      <span className="text-lg font-mono">A</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Uppercase</span>
                  </div>
                  <Switch checked={useUpper} onCheckedChange={setUseUpper} />
                </Label>
                <Label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 text-gray-500 dark:text-gray-400">
                      <span className="text-lg font-mono">a</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Lowercase</span>
                  </div>
                  <Switch checked={useLower} onCheckedChange={setUseLower} />
                </Label>
                <Label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 text-gray-500 dark:text-gray-400">
                      <span className="text-lg font-mono">0</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Numbers</span>
                  </div>
                  <Switch checked={useNumber} onCheckedChange={setUseNumber} />
                </Label>
                <Label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 text-gray-500 dark:text-gray-400">
                      <span className="text-lg font-mono">!</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Symbols</span>
                  </div>
                  <Switch checked={useSymbol} onCheckedChange={setUseSymbol} />
                </Label>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Password
            </Button>
          </CardContent>
        </Card>

        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Password Tips</h3>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Use a password length of at least 12 characters for better security</li>
            <li>• Include a mix of uppercase, lowercase, numbers, and symbols</li>
            <li>• Avoid using personal information in your passwords</li>
            <li>• Use a different password for each of your accounts</li>
            <li>• Consider using a password manager to store your passwords securely</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PasswordGenerator
