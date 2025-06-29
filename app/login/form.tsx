'use client'

import { createClient } from '@/utils/supabase/client'
import Link from "next/link";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Github, ToggleLeft as Google } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function AuthForm({
  isSignUp,
  toggleSignUp,
}: {
  isSignUp: boolean;
  toggleSignUp: () => void;
}) {
  const handleGitHubSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">
          {isSignUp ? "Sign up" : "Sign in"}
        </CardTitle>
        <CardDescription>
          Choose your preferred {isSignUp ? "sign up" : "sign in"} method
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" disabled>
            <Google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={handleGitHubSignIn}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form action={isSignUp ? signup : login} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {!isSignUp && (
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <Input id="password" name="password" type="password" required />
            {isSignUp && (
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            )}
          </div>

          {!isSignUp && (
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
          )}

          <Button className="w-full" type="submit">
            {isSignUp ? "Create account" : "Sign In"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        {isSignUp && (
          <p className="text-xs text-muted-foreground text-center">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        )}
        <div className="text-sm text-center text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleSignUp}
            className="text-primary underline-offset-4 hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}