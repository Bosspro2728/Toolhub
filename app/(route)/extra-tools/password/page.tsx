"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function PasswordPage() {
  const tools = [
    {
      title: "Password Generator",
      description: "Generate strong, secure passwords",
      icon: KeyRound,
      path: "/extra-tools/password/password-generator",
    },
    {
      title: "Password Strength Tester",
      description: "Test the strength of your passwords",
      icon: ShieldAlert,
      path: "/extra-tools/password/password-tester",
    },
  ];

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mr-4">
            <KeyRound className="text-blue-600 dark:text-blue-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password Tools</h2>
        </div>
        <p className="text-muted-foreground text-center max-w-2xl">
          Generate secure passwords and test password strength with our comprehensive password tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link key={tool.title} href={tool.path} className="block">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Click to access tool →</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}