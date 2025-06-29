"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Play, Trash2, Users, UserPlus, LogOut, Code, Lock } from "lucide-react";
import getCodeOutput from "@/helper/getCodeOutput";
import { PageHeader } from '@/components/shared/page-header';
import { Separator } from "@/components/ui/separator";
import ToolWrapper from '@/components/shared/tool-wrapper';
import useSocket from '@/hooks/useSocket';
import { useFeatureLimit } from '@/hooks/use-feature-limit';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';

interface CodeEditorProps {
  collab: boolean;
  collabAvailable: boolean;
}

function MeetingDialog({ isOpen, onClose, tittle, className, buttonText, handleClick, children }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{tittle}</DialogTitle>
        </DialogHeader>
        <div className={className}>{children}</div>
        <DialogFooter>
          <Button
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LanguagePicker({
  onLanguageChange,
  color,
  langChange,
  style,
}:any) {
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
  ];

  return (
    <div className="mb-4">
      <Select defaultValue="javascript" value={langChange || undefined} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ThemePicker({
  onThemeChange,
  color,
  style,
}:any) {
  return (
    <div className="mb-4">
      <Tabs defaultValue="light" onValueChange={(value) => onThemeChange(value === "dark" ? "vs-dark" : "light")}>
        <TabsList className="grid w-[180px] grid-cols-2">
          <TabsTrigger value="light">Light</TabsTrigger>
          <TabsTrigger value="dark">Dark</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default function CodeEditor({ collab, collabAvailable}: CodeEditorProps) {
  const [code, setCode] = useState("// Write your code here");
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("javascript");
  const [theme, setTheme] = useState("light");
  const [output, setOutput] = useState();
  const [time, setTime] = useState();
  const [wallTime, setWallTime] = useState();
  const [color, setColor] = useState("#FFFFFF");
  const oppColor = color === "#FFFFFF" ? "#1E1E1E" : "#FFFFFF";
  const router = useRouter();
  const pathname = usePathname();
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`;
  const [isJoineing, setIsJoineing] = useState(false);
  const [values, setValues] = useState({
    link: "",
  });
  const socket = useSocket(collab);
  
  // Use the feature limit hook for code snippets
  const { canUse, incrementUsage } = useFeatureLimit('code_snippets', {
    redirectToPricing: true,
    showToast: true
  });

  useEffect(() => {
    if(collab){
      console.log(collab)
      socket?.on('code-change', (newCode) => {
        setCode(newCode);
      });
    };

    return () => {
      socket?.off('code-change');
    };
  }, [socket]);

  useEffect(() => {
    if(collab){
      console.log(collab)
      socket?.on('lang-change', (currentLang) => {
        setLang(currentLang);
      });
    };

    return () => {
      socket?.off('lang-change');
    };
  }, [socket]);

  function handleInputChange(e:any) {
    setInput(e.target.value);
  }

  function handleEditorChange(value:any, event:any) {
    const newCode = value;
    setCode(newCode);
    if(collab){
      socket?.emit('code-change', newCode);
    }
  }

  function handleLanguageChange(language:any) {
    setLang(language);
    if(collab){
      socket?.emit('lang-change', language);
    }
  }

  function handleThemeChange(theme:any) {
    setTheme(theme);
    if (theme === "light") {
      setColor("#FFFFFF");
    } else if (theme === "vs-dark") {
      setColor("#1E1E1E");
    }
  }

  async function handleRunCode() {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for code snippets. Please upgrade your plan for more usage.");
      return;
    }
    
    toast("Code running", {
      description: `Running ${lang} code`,
    });
    
    try {
      const result = await getCodeOutput(code, input, lang);
      handleOutputValue(result);
      
      // Increment usage after successful run
      await incrementUsage();
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Failed to run code");
    }
  }

  function handleOutputValue(ResponseOutput:any) {
    setOutput(ResponseOutput[0]);
    setTime(ResponseOutput[1]);
    setWallTime(ResponseOutput[2]);
  }

  function handleCopyText() {
    navigator.clipboard.writeText(meetingLink);
    toast("Link Copied");
  }

  function handleCreateEditor() {
    if (!collabAvailable) {
      toast.error("Collaborative editing is only available on Pro and Master plans");
      return;
    }
    
    const id = crypto.randomUUID();
    router.push(`/code/code-editor/${id}`);
    toast("Collaborative Editor Created", {
      description: "Editor that can be added it by multi users created!",
    });
  }

  function handleLeaveEditor() {
    socket?.disconnect();
    router.push(`/code/code-editor`);
    toast("Disconnected successfully from the editor");
  }

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Code Editor"
        description="Write, edit, and run code in multiple programming languages"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert for code snippets */}
      <UsageLimitAlert featureType="code_snippets" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Code Editor">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LanguagePicker
                    style={{ background: color, color: oppColor }}
                    onLanguageChange={handleLanguageChange}
                    color={color}
                    langChange={collab ? lang : ""}
                  />
                  <ThemePicker
                    style={{ background: color, color: oppColor }}
                    onThemeChange={handleThemeChange}
                    color={color}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {collab ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyText}
                        className="border-gray-200 dark:border-gray-700"
                        title="Copy link for collaborative editing"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLeaveEditor}
                        className="border-gray-200 dark:border-gray-700 text-red-500 hover:text-red-600"
                        title="Leave collaborative session"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateEditor}
                        className="border-gray-200 dark:border-gray-700"
                        title="Create collaborative editor session"
                        disabled={!collabAvailable}
                      >
                        {collabAvailable ? (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Collab
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Pro Feature
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsJoineing(true)}
                        className="border-gray-200 dark:border-gray-700"
                        title="Join collaborative editor session"
                        disabled={!collabAvailable}
                      >
                        {collabAvailable ? (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Join Collab
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Pro Feature
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Editor
                  height="60vh"
                  language={lang}
                  onChange={handleEditorChange}
                  theme={theme}
                  value={code}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRunCode}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  disabled={!canUse}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setCode("");
                    toast("Cleared", {
                      description: "The code in the editor has just been cleared",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div className="space-y-6">
          <ToolWrapper title="Input/Output">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</h3>
                <Textarea
                  placeholder="Enter input for your code here..."
                  onChange={handleInputChange}
                  className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 resize-none"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output</h3>
                <Textarea
                  className="min-h-[200px] font-mono text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 resize-none"
                  readOnly
                  value={`Input:\n${input.split("").join("") === "" ? "none" : input}\n\nOutput:\n${
                    output ? output : "Run code to see output"
                  }\n\nWallTime:\n${wallTime ? wallTime : "Run code to see wallTime"} \n\nTime:\n${
                    time ? time : "Run code to see Time"
                  }`}
                />
              </div>
            </div>
          </ToolWrapper>

          <ToolWrapper title="Pro Features">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Advanced Code Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Get insights and suggestions for your code
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Multiple Files</p>
                <p className="text-sm text-muted-foreground">
                  Work with multiple files simultaneously
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Git Integration</p>
                <p className="text-sm text-muted-foreground">
                  Version control your code
                </p>
              </div>
              <div className="mt-4 text-center">
                <Button>Upgrade to Pro</Button>
              </div>
            </div>
          </ToolWrapper>
        </div>
      </div>

      <MeetingDialog
        isOpen={isJoineing}
        onClose={() => setIsJoineing(false)}
        tittle="Join Collaborative Session"
        className="mt-4"
        buttonText="Join Session"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Paste collaborative editor link here"
          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mt-2"
          onChange={(e) => setValues({ link: e.target.value })}
        />
      </MeetingDialog>
    </div>
  );
}