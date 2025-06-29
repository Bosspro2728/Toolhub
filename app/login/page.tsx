'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/layout/logo";
import { AuthForm } from "./form";
import { toast } from "sonner";
export const dynamic = 'force-dynamic';
export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error) {
      toast.error(error);
    }
    
    if (message) {
      toast.success(message);
    }
  }, [searchParams]);

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Panel */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "ToolHub has completely transformed my workflow. The comprehensive suite of tools saves me hours each week!"
            </p>
            <footer className="text-sm">Sarah Johnson, Marketing Director</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Sign up to access all our tools and services"
                : "Enter your email to sign in to your account"}
            </p>
          </div>

          <AuthForm isSignUp={isSignUp} toggleSignUp={() => setIsSignUp(!isSignUp)} />
        </div>
      </div>
    </div>
  );
}