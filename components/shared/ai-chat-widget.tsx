import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the chat data structure
interface ChatQuestion {
  id: string;
  question: string; 
  answer: string;
  followUp?: string[];
}

// Predefined questions and answers about the project
const chatData: ChatQuestion[] = [
  {
    id: '1',
    question: 'What tools does ToolHub offer?',
    answer: 'ToolHub offers a wide range of tools across multiple categories: AI Tools (AI Chat, Translation, Text Humanizer, Text to Speech, AI Detection), Calculators (Scientific, Equations, Graph Plotter, Unit Converter, Currency Converter, Collatz Conjecture), Code Tools (Code Editor, Code Snap, JSON Validator, Code Formatter, SEO Analyzer, Code Compare), Color Tools (Color Generator, Gradient Generator), Document Tools (PDF Editor, Excel Editor, Document Viewer, Document Creator, Image Editor, Video Editor, Document Types Converter, Image & Video Converter), Cloud Storage, and Extra Tools (Mind Map, Password Tools, Text Case Converter, URL Shortener, Time Zone Converter, Online Whiteboard, CV Maker).',
    followUp: ['2', '3', '4']
  },
  {
    id: '2',
    question: 'What are the pricing plans?',
    answer: 'ToolHub offers three pricing tiers: Free, Pro ($30/month), and Master ($50/month). The Free plan includes basic access with limited daily usage (e.g., 3 AI chat messages/day, 300MB storage). The Pro plan offers increased limits (e.g., 10 AI chat messages/day, 1GB storage) and collaborative code editor. The Master plan provides maximum limits (e.g., 50 AI chat messages/day, 5GB storage) and all premium features.',
    followUp: ['1', '5', '6']
  },
  {
    id: '3',
    question: 'How is ToolHub built?',
    answer: 'ToolHub is built with Next.js for the frontend and uses Supabase for authentication and database. It integrates with Uploadthing for file uploads and Stripe for payment processing. The AI features are powered by Groq, and collaborative editing uses Socket.IO. The UI is built with Tailwind CSS and shadcn/ui components.',
    followUp: ['7', '8', '9']
  },
  {
    id: '4',
    question: 'What AI features are available?',
    answer: 'ToolHub offers several AI-powered features: AI Chat (powered by Groq with models like Llama-3.3-70B), Text Humanizer (makes AI-generated text sound more natural), AI Detection (detects whether text was written by AI or human), Translation (supports multiple languages), and Text to Speech (converts text to natural-sounding speech).',
    followUp: ['2', '10']
  },
  {
    id: '5',
    question: 'How do usage limits work?',
    answer: 'Each feature has daily usage limits based on your plan tier. For example, on the Free plan, you get 3 AI chat messages per day, while Pro gives you 10 and Master gives you 50. Usage limits reset daily at midnight UTC. You can view your current usage and remaining limits on the Usage Dashboard.',
    followUp: ['2', '11']
  },
  {
    id: '6',
    question: 'How do I upgrade my plan?',
    answer: 'You can upgrade your plan by visiting the Pricing page and selecting either the Pro or Master plan. Payment is processed securely through Stripe. Your new limits will be available immediately after successful payment processing.',
    followUp: ['2', '5']
  },
  {
    id: '7',
    question: 'Is my data secure?',
    answer: 'Yes, ToolHub takes data security seriously. User authentication is handled by Supabase with secure JWT tokens. Files are stored securely with Uploadthing, and payment processing is handled by Stripe, which is PCI compliant. Your data is not shared with third parties except as necessary to provide the service.',
    followUp: ['12', '3']
  },
  {
    id: '8',
    question: 'Can I collaborate with others?',
    answer: 'Yes, ToolHub offers collaborative features on Pro and Master plans. The collaborative code editor allows multiple users to work on code simultaneously. This feature is not available on the Free plan.',
    followUp: ['2', '3']
  },
  {
    id: '9',
    question: 'What technologies power the document tools?',
    answer: 'The document tools use various technologies: PDF editing uses SimplePDF, Excel editing uses SheetJS, document creation uses Quill, image editing uses Photopea, and video editing uses FFmpeg WASM. File conversions are handled by a dedicated conversion service.',
    followUp: ['3', '13']
  },
  {
    id: '10',
    question: 'What AI models are used?',
    answer: 'ToolHub uses Groq to power the AI Chat feature with models like Llama-3.3-70B, Llama-3.1-8B, and Gemma2-9B. The Text to Speech feature uses ElevenLabs voices. Other AI features use specialized APIs for their specific functions.',
    followUp: ['4', '3']
  },
  {
    id: '11',
    question: 'Where can I see my usage?',
    answer: 'You can view your current usage and remaining limits on the Usage Dashboard. This page shows your daily usage for each feature, how many uses you have remaining, and when your limits will reset. You can access it from the navigation menu or by clicking on the chart icon in the header.',
    followUp: ['5', '2']
  },
  {
    id: '12',
    question: 'How is my payment information handled?',
    answer: 'All payment processing is handled securely by Stripe, a PCI-compliant payment processor. ToolHub does not store your credit card information. Subscription management is also handled through Stripe.',
    followUp: ['6', '7']
  },
  {
    id: '13',
    question: 'What file formats are supported?',
    answer: 'ToolHub supports a wide range of file formats. The document converter supports PDF, DOCX, DOC, TXT, RTF, HTML, XLSX, XLS, CSV, JSON, PPTX, and PPT. The media converter supports image formats (JPG, PNG, GIF, WEBP, SVG) and video formats (MP4, WEBM, MOV, AVI, MKV) as well as audio formats (MP3, WAV, M4A).',
    followUp: ['9', '3']
  }
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{id: string, type: 'question' | 'answer'}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset chat when opening
      setActiveQuestionId(null);
      setChatHistory([]);
    }
  };

  const handleQuestionClick = (id: string) => {
    setActiveQuestionId(id);
    setChatHistory(prev => [...prev, {id, type: 'question'}, {id, type: 'answer'}]);
  };

  const getQuestion = (id: string) => {
    return chatData.find(q => q.id === id);
  };

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <div className="fixed bottom-28 right-4 z-50">
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg",
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-xl">
          <CardHeader className="bg-primary text-primary-foreground py-3">
            <CardTitle className="text-base">ToolHub Assistant</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <ScrollArea className="h-80 p-4">
                <div className="space-y-3">
                  {chatHistory.map((item, index) => {
                    const chatItem = getQuestion(item.id);
                    if (!chatItem) return null;
                    
                    return (
                      <div 
                        key={`${item.id}-${index}`} 
                        className={cn(
                          "p-3 rounded-lg max-w-[85%]",
                          item.type === 'question' 
                            ? "bg-primary text-primary-foreground ml-auto" 
                            : "bg-muted mr-auto"
                        )}
                      >
                        {item.type === 'question' 
                          ? chatItem.question
                          : chatItem.answer
                        }
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
            )}
            
            {/* Questions List */}
            <div className={cn(
              "p-4 space-y-2",
              chatHistory.length > 0 && "border-t"
            )}>
              <p className="text-sm font-medium">
                {chatHistory.length === 0 
                  ? "How can I help you today?" 
                  : "More questions:"}
              </p>
              
              <div className="space-y-2">
                {chatHistory.length === 0 
                  ? chatData.slice(0, 5).map(item => (
                      <Button 
                        key={item.id}
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => handleQuestionClick(item.id)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{item.question}</span>
                      </Button>
                    ))
                  : activeQuestionId && getQuestion(activeQuestionId)?.followUp?.map(id => {
                      const followUpQuestion = getQuestion(id);
                      if (!followUpQuestion) return null;
                      
                      return (
                        <Button 
                          key={id}
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleQuestionClick(id)}
                        >
                          <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{followUpQuestion.question}</span>
                        </Button>
                      );
                    })
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}