"use client";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { tools, categories } from "@/constant/tools";

// Add filter options
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pro", value: "pro" },
  { label: "New", value: "new" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [search, setSearch] = useState(initialQuery);
  const [filter, setFilter] = useState<"all" | "pro" | "new">("all");

  // Real search logic: filter tools and categories
  const query = search.trim().toLowerCase();
  let toolResults = query
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query)
      )
    : [];

  // Apply filter
  if (filter === "pro") {
    toolResults = toolResults.filter((t) => t.hasPro);
  } else if (filter === "new") {
    toolResults = toolResults.filter((t) => t.isNew);
  }

  const categoryResults = query
    ? categories.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <div className="container py-12 md:py-16 lg:py-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Search</h1>
      <form
        className="flex w-full max-w-md items-center space-x-2 mx-auto mb-4"
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
      {/* Filter Buttons */}
      <div className="flex justify-center gap-2 mb-8">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value as "all" | "pro" | "new")}
          >
            {f.label}
          </Button>
        ))}
      </div>
      <div className="max-w-2xl mx-auto">
        {query && (
          <>
            <h2 className="text-xl font-semibold mb-4">Results for "{search}"</h2>
            {toolResults.length === 0 && categoryResults.length === 0 && (
              <p className="text-muted-foreground text-center">No results found.</p>
            )}
            {toolResults.length > 0 && (
              <>
                <h3 className="text-lg font-medium mb-2">Tools</h3>
                <ul className="space-y-4 mb-6">
                  {toolResults.map((t, i) => (
                    <li key={i} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                      <span className="p-2 rounded-lg bg-primary/10 text-primary">
                        <t.icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <Link href={t.path} className="font-semibold hover:underline">
                          {t.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{t.category}</span>
                      {t.hasPro && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Pro
                        </span>
                      )}
                      {t.isNew && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {categoryResults.length > 0 && (
              <>
                <h3 className="text-lg font-medium mb-2">Categories</h3>
                <ul className="space-y-4">
                  {categoryResults.map((c, i) => (
                    <li key={i} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                      <span className="p-2 rounded-lg bg-primary/10 text-primary">
                        <c.icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <Link href={c.path} className="font-semibold hover:underline">
                          {c.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">{c.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        {!query && (
          <p className="text-muted-foreground text-center">Enter a search term to see results.</p>
        )}
      </div>
    </div>
  );
}
