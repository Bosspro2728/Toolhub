"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Eye, EyeOff, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "None", percent: 0, feedback: [] }

  let score = 0
  const feedback = []

  // Length check
  if (password.length < 8) {
    feedback.push("Password is too short (minimum 8 characters)")
  } else if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    feedback.push("Add lowercase letters")
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Add uppercase letters")
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push("Add numbers")
  } else {
    score += 1
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push("Add special characters (!@#$%^&*)")
  } else {
    score += 1
  }

  // Common patterns check
  if (/^[a-zA-Z]+$/.test(password)) {
    feedback.push("Password contains only letters")
    score -= 1
  }

  if (/^[0-9]+$/.test(password)) {
    feedback.push("Password contains only numbers")
    score -= 1
  }

  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeated characters (e.g., 'aaa')")
    score -= 1
  }

  // Sequential characters check
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "01234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"]
  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const fragment = seq.substring(i, i + 3)
      if (password.toLowerCase().includes(fragment)) {
        feedback.push("Avoid sequential characters (e.g., 'abc', '123')")
        score -= 1
        break
      }
    }
  }

  // Common passwords check (simplified)
  const commonPasswords = ["password", "123456", "qwerty", "admin", "welcome", "letmein"]
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push("This is a commonly used password")
    score -= 3
  }

  // Ensure score is within bounds
  score = Math.max(0, score)
  score = Math.min(7, score)

  const labels = ["None", "Very Weak", "Weak", "Fair", "Moderate", "Good", "Strong", "Very Strong"]
  const percent = (score / 7) * 100

  // Calculate approximate time to crack
  let timeToCrack = "Unknown"
  const entropyBits = calculateEntropyBits(password)

  if (entropyBits > 0) {
    if (entropyBits < 28) {
      timeToCrack = "Instantly"
    } else if (entropyBits < 36) {
      timeToCrack = "Minutes"
    } else if (entropyBits < 60) {
      timeToCrack = "Hours"
    } else if (entropyBits < 80) {
      timeToCrack = "Days"
    } else if (entropyBits < 100) {
      timeToCrack = "Years"
    } else {
      timeToCrack = "Centuries"
    }
  }

  return {
    label: labels[score],
    score,
    percent,
    feedback: feedback.slice(0, 3), // Limit to top 3 feedback items
    entropy: entropyBits.toFixed(1),
    timeToCrack,
  }
}

// Calculate password entropy in bits
function calculateEntropyBits(password) {
  if (!password) return 0

  let poolSize = 0
  if (/[a-z]/.test(password)) poolSize += 26
  if (/[A-Z]/.test(password)) poolSize += 26
  if (/[0-9]/.test(password)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33

  if (poolSize === 0) return 0
  return Math.log2(Math.pow(poolSize, password.length))
}

const getColorClass = (score) => {
  const colors = [
    "bg-gray-300 dark:bg-gray-600",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-yellow-400",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-600",
  ]
  return colors[score]
}

const PasswordTester = () => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [result, setResult] = useState({
    label: "None",
    score: 0,
    percent: 0,
    feedback: [],
    entropy: "0",
    timeToCrack: "Unknown",
  })

  useEffect(() => {
    setResult(getPasswordStrength(password))
  }, [password])

  const barColor = getColorClass(result.score)

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center justify-center">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mr-4">
          <ShieldAlert className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password Strength Tester</h2>
      </div>

      <div className="w-full max-w-xl">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Test Your Password Strength</CardTitle>
              <Badge className={`${barColor} text-white`} variant="secondary">
                {result.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                Enter a password to test
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Type your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Strength</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-help">
                        <span className="mr-1">Entropy: {result.entropy} bits</span>
                        <Info className="h-3.5 w-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Entropy measures password randomness. Higher is better.
                        <br />
                        80+ bits is considered strong.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Progress value={result.percent} className={`h-2 ${barColor}`} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated time to crack:</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{result.timeToCrack}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Based on a brute-force attack with modern hardware
              </div>
            </div>

            {result.feedback.length > 0 && (
              <div className="space-y-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Suggestions to improve:</h3>
                <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-200">
                  {result.feedback.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Password Security Tips</h3>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Use at least 12 characters, ideally 16 or more</li>
            <li>• Mix uppercase, lowercase, numbers, and special characters</li>
            <li>• Avoid common words, phrases, or personal information</li>
            <li>• Don't reuse passwords across different accounts</li>
            <li>• Consider using a password manager to generate and store passwords</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PasswordTester
