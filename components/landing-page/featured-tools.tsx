import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Calculator, Terminal, Palette, 
  Brain, CloudLightning, Sparkles, FileImage 
} from 'lucide-react';

const FeaturedTools = () => {
  const tools = [
    {
      title: 'PDF Editor',
      description: 'Edit, merge, split, and annotate PDF files with ease',
      icon: FileText,
      path: '/documents/pdf-editor',
      category: 'Documents',
      isNew: false,
    },
    {
      title: 'AI Text Generator',
      description: 'Generate human-like text for various purposes',
      icon: Brain,
      path: '/ai/text-humanizer',
      category: 'AI',
      isNew: true,
    },
    {
      title: 'Scientific Calculator',
      description: 'Perform complex mathematical calculations',
      icon: Calculator,
      path: '/calculators/scientific-calculator',
      category: 'Calculators',
      isNew: false,
    },
    {
      title: 'Code Formatter',
      description: 'Format and beautify your code in various languages',
      icon: Terminal,
      path: '/code/code-formatter',
      category: 'Code',
      isNew: false,
    },
    {
      title: 'Gradient Generator',
      description: 'Create beautiful color gradients for your projects',
      icon: Palette,
      path: '/color/gradient-generator',
      category: 'Color',
      isNew: false,
    },
    {
      title: 'Cloud Storage',
      description: 'Store and access your files from anywhere',
      icon: CloudLightning,
      path: '/cloud-storage',
      category: 'Storage',
      isNew: false,
    },
    {
      title: 'Image Editor',
      description: 'Edit and enhance your images with powerful tools',
      icon: FileImage,
      path: '/documents/image-editor',
      category: 'Documents',
      isNew: false,
    },
    {
      title: 'AI Chat',
      description: 'Automatically generate long texts with AI',
      icon: Sparkles,
      path: '/ai/ai-chat',
      category: 'AI',
      isNew: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tools.map((tool, index) => (
        <Link key={index} href={tool.path} className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <tool.icon className="h-5 w-5" />
                </div>
                {tool.isNew && (
                  <Badge variant="default" className="bg-primary">New</Badge>
                )}
              </div>
              <CardTitle className="mt-3 text-lg group-hover:text-primary transition-colors">
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Badge variant="outline">{tool.category}</Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedTools;