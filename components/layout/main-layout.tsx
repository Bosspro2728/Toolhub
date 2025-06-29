"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Search,
  Settings,
  LayoutGrid,
  FileText,
  Calculator,
  Terminal,
  Palette,
  Brain,
  Cloud,
  Package,
  Home,
  Menu,
  X,
  MoonStar,
  Sun,
  ChevronDown,
  Bell,
  BarChart
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/layout/logo';
import { UserButton } from '@/components/layout/user-button';
import { SubscriptionStatus } from '@/components/shared/subscription-status';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { tools } from "@/constant/tools"; // Make sure this path is correct
// import { AIChatWidget } from '@/components/shared/ai-chat-widget';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'All Services', icon: LayoutGrid },
    {
      href: '/documents',
      label: 'Documents',
      icon: FileText,
      submenu: [
        { href: '/documents/pdf-editor', label: 'PDF Editor' },
        { href: '/documents/excel-editor', label: 'Excel Editor' },
        { href: '/documents/doc-viewer', label: 'Document Viewer' },
        { href: '/documents/doc-creator', label: 'Document Creator' },
        { href: '/documents/image-editor', label: 'Image Editor' },
        { href: '/documents/video-editor', label: 'Video Editor', isPro: true },
        { href: '/documents/converters/document-types-converter', label: 'Document Converter' },
        { href: '/documents/converters/image-video-types-converter', label: 'Media Converter' }
      ]
    },
    {
      href: '/calculators',
      label: 'Calculators',
      icon: Calculator,
      submenu: [
        { href: '/calculators/scientific-calculator', label: 'Scientific Calculator' },
        { href: '/calculators/equations-calculator', label: 'Equations Calculator' },
        { href: '/calculators/graph-plotter', label: 'Graph Plotter', isPro: true },
        { href: '/calculators/unit-converter', label: 'Unit Converter' },
        { href: '/calculators/currency-converter', label: 'Currency Converter' },
        { href: '/calculators/collatz-conjecture', label: 'Collatz Conjecture' }
      ]
    },
    {
      href: '/code',
      label: 'Code Tools',
      icon: Terminal,
      submenu: [
        { href: '/code/code-editor', label: 'Code Editor' },
        { href: '/code/code-formatter', label: 'Code Formatter' },
        { href: '/code/code-snap', label: 'Code Snap', isPro: true },
        { href: '/code/json-validator', label: 'JSON Validator' },
        { href: '/code/code-compare', label: 'Code Compare' },
        { href: '/code/seo-analyzer', label: 'SEO Analyzer', isPro: true }
      ]
    },
    {
      href: '/ai',
      label: 'AI Tools',
      icon: Brain,
      submenu: [
        { href: '/ai/ai-chat', label: 'AI Chat' },
        { href: '/ai/translation', label: 'Translation' },
        { href: '/ai/text-humanizer', label: 'Text Humanizer', isPro: true },
        { href: '/ai/text-to-speech', label: 'Text to Speech' },
        { href: '/ai/ai-detection', label: 'AI Detection' }
      ]
    },
    {
      href: '/extra-tools',
      label: 'Extra Tools',
      icon: Package,
      submenu: [
        { href: '/extra-tools/password/password-generator', label: 'Password Generator' },
        { href: '/extra-tools/password/password-tester', label: 'Password Tester' },
        { href: '/extra-tools/url-shortners', label: 'URL Shortener' },
        { href: '/extra-tools/textCase-converter', label: 'Text Case Converter' },
        { href: '/extra-tools/timeZone-converter', label: 'Time Zone Converter' },
        { href: '/extra-tools/mind-maps', label: 'Mind Maps', isPro: true },
        { href: '/extra-tools/whiteboard', label: 'Whiteboard', isPro: false},
        { href: '/extra-tools/cv-maker', label: 'CV Maker', isPro: false},
      ]
    }
  ];

  const secondaryNavItems = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/usage', label: 'Usage', icon: BarChart },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Get all tools marked as new
  const newTools = tools.filter((tool) => tool.isNew);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <SheetHeader className="mb-6">
                  <SheetTitle className="sr-only">Main Navigation</SheetTitle>
                  <Logo />
                </SheetHeader>
                <div className="flex flex-col space-y-4 py-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
                  {mainNavItems.map((item) => (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                      {item.submenu && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.href}
                              href={subitem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-primary"
                            >
                              {subitem.label}
                              {subitem.isPro && (
                                <Badge variant="secondary" className="ml-2">PRO</Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    {secondaryNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <div key={item.href} className="relative group">
                {item.submenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.submenu.map((subitem) => (
                        <DropdownMenuItem key={subitem.href} asChild>
                          <Link
                            href={subitem.href}
                            className="flex items-center justify-between"
                          >
                            {subitem.label}
                            {subitem.isPro && (
                              <Badge variant="secondary">PRO</Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 font-semibold text-sm">Notifications and New Tools</div>
                <DropdownMenuSeparator />
                {newTools.length > 0 ? (
                  newTools.map((tool) => (
                    <DropdownMenuItem key={tool.title} asChild>
                      <a href={tool.path} className="block w-full"><b className='contents text-emerald-600'>{tool.title}</b> - {tool.description}</a>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-4 text-muted-foreground text-center text-sm">
                    No new tools
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <MoonStar className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>
            
            {userEmail ? (
              <div className="flex items-center gap-2">
                <Link href="/usage">
                  <Button variant="ghost" size="icon" title="Usage Dashboard">
                    <BarChart className="h-5 w-5" />
                    <span className="sr-only">Usage</span>
                  </Button>
                </Link>
                <SubscriptionStatus />
                <UserButton userEmail={userEmail} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login" className="hidden sm:block">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">{children}</main>
      
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col sm:flex-row py-8 items-start sm:items-center justify-between">
          <div className="flex flex-col space-y-2">
            <Logo />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ToolHub. All rights reserved.
            </p>
          </div>
          <div className="flex mt-4 sm:mt-0 gap-4 sm:gap-6">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Bolt Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="https://bolt.new" target="_blank" rel="noopener noreferrer">
          <Image 
            src="/black_circle_360x360.png" 
            alt="Powered by Bolt" 
            width={60} 
            height={60}
            className="hover:scale-110 transition-transform duration-200"
          />
        </Link>
      </div>
      
      {/* AI Chat Widget */}
      {/* <AIChatWidget /> */} 
    </div>
  );
};

export default MainLayout;