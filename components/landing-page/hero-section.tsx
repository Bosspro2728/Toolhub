"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const supabase = createClient();
const HeroSection = ({isUserLoggedIn}: {isUserLoggedIn: boolean}) => {
  
  return (
    <section className="relative overflow-hidden border-b">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.02]" />
      
      <div className="container relative pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            <span className="block">All the tools you need</span>
            <span className="block mt-1 text-primary">in one place</span>
          </h1>
          
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Access a comprehensive suite of powerful online tools and services designed 
            to boost your productivity and streamline your workflow.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="gap-2">
                Explore Tools
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {!isUserLoggedIn ? (
              <Link href="/login">
                <Button size="lg" variant="outline">Create Free Account</Button>
              </Link>
            ) : null}
          </div>
          
          <div className="mt-12 text-sm text-muted-foreground">
            <p>No credit card required. 100+ tools available.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;