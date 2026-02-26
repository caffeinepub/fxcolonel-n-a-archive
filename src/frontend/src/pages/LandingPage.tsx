import React, { useState } from "react";
import {
  useGetPublishedArticles,
  useSearchArticles,
  useGetHeroImage,
} from "../hooks/useQueries";
import ArticleCard from "../components/ArticleCard";
import ArticleDetailModal from "../components/ArticleDetailModal";
import { Article } from "../backend";
import { Search, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 9;

export default function LandingPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { data: articles = [], isLoading } = useGetPublishedArticles(page, PAGE_SIZE);
  const { data: searchResults = [], isLoading: isSearching } =
    useSearchArticles(debouncedSearch);
  const { data: heroImageUrl } = useGetHeroImage();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => setDebouncedSearch(val), 400);
    setSearchTimeout(t);
  };

  const displayArticles = debouncedSearch ? searchResults : articles;
  const isLoadingDisplay = debouncedSearch ? isSearching : isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background image layer */}
        {heroImageUrl && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Blurred mid-layer: blurs the background image */}
        <div className="absolute inset-0 backdrop-blur-sm" />

        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Decorative blurred glow orbs for depth when no image */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-gold/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {/* Mobile: left-aligned; Desktop: centered */}
          <div className="flex flex-col items-start md:items-center text-left md:text-center max-w-3xl md:mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gold" />
              <span className="text-gold text-sm font-medium uppercase tracking-widest">
                Forex Intelligence
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
              FX Colonel
            </h1>
            <p className="mt-4 text-base sm:text-lg text-foreground/80 max-w-xl leading-relaxed">
              Premium forex analysis, market insights, and trading strategies from
              seasoned professionals.
            </p>
            <div className="mt-8 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search articles…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy/90 text-foreground border border-[oklch(0.38_0.05_255)] placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {debouncedSearch && (
          <p className="text-sm text-muted-foreground mb-6">
            {isSearching
              ? "Searching…"
              : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${debouncedSearch}"`}
          </p>
        )}

        {isLoadingDisplay ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {debouncedSearch ? "No articles found." : "No articles published yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => (
              <ArticleCard
                key={String(article.id)}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!debouncedSearch && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded border border-border text-foreground hover:border-gold hover:text-gold transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={articles.length < PAGE_SIZE}
              className="p-2 rounded border border-border text-foreground hover:border-gold hover:text-gold transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Article Detail Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
