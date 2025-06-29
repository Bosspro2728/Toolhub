"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import HeroSection from '@/components/landing-page/hero-section';
import FeaturedTools from '@/components/landing-page/featured-tools';
import CategoryGrid from '@/components/landing-page/category-grid';
import TestimonialSection from '@/components/landing-page/testimonial-section';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const supabase = createClient();

export default function Home() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection isUserLoggedIn={!!user} />
      
      <section className="container py-12 md:py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Tools</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Discover our most popular tools that help thousands of users every day
          </p>
        </div>
        <FeaturedTools />
        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" className="gap-2">
              View all tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Find the perfect tool for your specific needs
            </p>
          </div>
          <CategoryGrid />
        </div>
      </section>
      
      <section className="container py-12 md:py-16 lg:py-20" id="search">
        <div className="bg-card border rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Looking for something specific?
          </h2>
          <div className="max-w-md mx-auto">
            <form
              className="flex w-full max-w-sm items-center space-x-2 mx-auto"
              onSubmit={handleSearch}
            >
              <Input
                type="text"
                placeholder="Search for tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>
      
      <TestimonialSection />
      
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-primary-foreground/80 max-w-3xl mx-auto mb-8">
            Join thousands of users who trust our platform for their daily tasks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <Link href="/login">
                <Button size="lg" variant="secondary">Get Started — It's Free</Button>
              </Link>
            ) : null}
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}