"use client";

import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Trash2, Save, X, Plus, Info, Settings, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';


type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  lastMessage: Date;
};

export default function AIChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'New conversation',
      lastMessage: new Date(),
    },
  ]);
  const [conversationMessages, setConversationMessages] = useState<{ [id: string]: Message[] }>({
    '1': [
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date(),
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeConv, setActiveConv] = useState('1');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('ai_chat', {
    redirectToPricing: true,
    showToast: true
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    loadUserConversations();
  }, []);
  const loadUserConversations = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    toast.error("Please sign in to view your conversations.");
    return;
  }

  try {
    const res = await fetch(`/api/ai-chat-save?user_id=${user.id}`, {
        method: 'GET',
      });

    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();

    if (data.conversations) {
      setConversations(data.conversations.map((c: any) => ({
        id: c.id,
        title: c.title,
        lastMessage: new Date(c.timestamp),
      })));

      const msgMap = data.conversations.reduce((acc: any, c: any) => {
        acc[c.id] = c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        return acc;
      }, {});
      setConversationMessages(prev => ({...prev, ...msgMap,}));

      if (data.conversations.length > 0) {
        const first = data.conversations[0];
        setActiveConv(first.id);
        setMessages(msgMap[first.id] || []);
        setConversationMessages(prev => ({...prev}));
      }
    }
  } catch (err) {
    console.error(err);
    toast.error("Error loading conversations");
  }
};


  // Save current messages before switching, then load new conversation's messages
  const switchConversation = (id: string) => {
    setConversationMessages(prev => ({
      ...prev,
      [activeConv]: messages, // save current
    }));
    setActiveConv(id);
    setMessages(conversationMessages[id] || [
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for AI chat. Please upgrade your plan for more usage.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, model: selectedModel }),
      });
      const data = await res.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || "No response from AI.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Increment usage after successful API call
      await incrementUsage();
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Sorry, there was an error generating a response.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // const clearConversation = () => {
  //   setMessages([
  //     {
  //       id: Date.now().toString(),
  //       role: 'assistant',
  //       content: 'Hello! How can I help you today?',
  //       timestamp: new Date(),
  //     },
  //   ]);
  // };

  const createNewConversation = () => {
    // Save current conversation before creating new one
    setConversationMessages(prev => ({
      ...prev,
      [activeConv]: messages,
    }));

    const id = Date.now().toString();
    const newConversation: Conversation = {
      id: id,
      title: 'New conversation',
      lastMessage: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setActiveConv(id);
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  const renameConversation = (id: string) => {
    const newTitle = prompt('Enter new title:');
    if (newTitle) {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    }
  };
  

  const deleteConversation = async (id: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!confirm('Delete this conversation?')) return;
    try {
      const res = await fetch(`/api/ai-chat-save?user_id=${user?.id}&conversation_id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Delete failed');

      setConversations(prev => {
        const updated = prev.filter(c => c.id !== id);
        // If the deleted conversation was active, switch to the next one or create new
        if (activeConv === id) {
          if (updated.length > 0) {
            switchConversation(updated[0].id);
          } else {
            createNewConversation();
          }
        }
        return updated;
      });
      setConversationMessages(prev => {
        const c = { ...prev };
        delete c[id];
        return c;
      });
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete.');
    }
  };


  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    const pageHeight = doc.internal.pageSize.height || 297;
    const lineHeight = 8;
    const margin = 10;
    const maxLineWidth = 180; // Adjust as needed for your layout

    messages.forEach(m => {
      const prefix = m.role === 'user' ? 'You: ' : 'AI: ';
      const lines = doc.splitTextToSize(prefix + m.content, maxLineWidth);

      lines.forEach((line:any) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      // Add extra space between messages
      y += 2;
    });

    doc.save('chat.pdf');
  };

const saveConversationToCloud = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be logged in to save your conversation.");
    return;
  }

  const conversation = {
    id: activeConv,
    title: conversations.find((c) => c.id === activeConv)?.title || "Untitled",
    messages: messages,
    timestamp: new Date().toISOString(),
  };
  console.log("saving conversation", conversation);
  try {
    const res = await fetch("/api/ai-chat-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        user_email: user.email,
        conversation,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Conversation saved successfully!");
    } else {
      console.error(data.error);
      alert("Failed to save conversation.");
    }
  } catch (err) {
    console.error(err);
    alert("Error saving conversation.");
  }
};
  return(
    <div className="container py-6 md:py-8">
      <PageHeader
        title="AI Chat"
        description="Chat with our AI assistant to get help with various tasks"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="ai_chat" />
      
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label htmlFor="model-select" className="font-medium">Model:</label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="llama-3.3-70b-versatile">Llama-3.3-70B Versatile (128K)</SelectItem>
            <SelectItem value="llama-3.1-8b-instant">Llama-3.1-8B Instant (128K)</SelectItem>
            <SelectItem value="llama3-70b-8192">Llama3-70B (8K)</SelectItem>
            <SelectItem value="llama3-8b-8192">Llama3-8B (8K)</SelectItem>
            <SelectItem value="gemma2-9b-it">Gemma2-9B-IT (8K)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ToolWrapper title="Chat" className="h-[70vh] flex flex-col overflow-y-scroll">
            <div className="flex-1 min-h-0 overflow-y-auto mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim() || !canUse}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </ToolWrapper>
        </div>
        
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Conversations</h3>
              <Button variant="ghost" size="sm" onClick={createNewConversation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                >
                  <div className="truncate" onClick={() => switchConversation(conversation.id)}>
                    <p className="text-sm font-medium">{conversation.title}</p>
                    {/* <p className="text-xs text-muted-foreground">
                      {conversation.lastMessage.toLocaleDateString()}
                    </p> */}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => renameConversation(conversation.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportJSON}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteConversation(conversation.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Actions</h3>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {/* <Button variant="outline" className="w-full justify-start" onClick={clearConversation}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear conversation
              </Button> */}
              <Button variant="outline" className="w-full justify-start" onClick={saveConversationToCloud}>
                <Save className="h-4 w-4 mr-2" />
                Save conversation
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={exportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}