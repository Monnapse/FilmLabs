"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { searchMediaAction } from "@/app/actions";
import MediaCard from "@/components/MediaCard";

export const metadata = {
  title: "Search Movies & TV",
};

function SearchResults() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "multi";
  const year = searchParams.get("year") || "";
  const genres = searchParams.get("genres") || "";
  const statusParam = searchParams.get("status") || "all";
  const rating = searchParams.get("rating") || "all";
  const score = searchParams.get("score") || "0";
  const sort = searchParams.get("sort") || "popularity";

  const isBrowsing = !query.trim();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    setInitialLoad(true);
    setMediaItems([]);
    loadMoreItems(1, true);
  }, [query, type, year, genres, statusParam, rating, score, sort]);

  const loadMoreItems = async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const newItems = await searchMediaAction({
        query, type, year, genres, status: statusParam, rating, score, sort, page: pageNum
      });

      if (reset) {
        setMediaItems(newItems);
        setInitialLoad(false);
      } else {
        setMediaItems((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
      }
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    }
    setLoading(false);
  };

  if (status === "loading" || initialLoad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="pb-4 border-b border-border/50">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm border-l-4 border-primary pl-4">
            {isBrowsing ? "Browsing Catalog" : `Results for "${query}"`}
          </h1>
        </header>

        {mediaItems.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-border/50">
            <p className="text-xl text-muted-foreground font-medium">We couldn't find any results matching your filters.</p>
            <Link href="/dashboard" className="text-primary hover:text-primary/80 mt-6 inline-block font-bold text-lg transition-colors">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {mediaItems.map((media: any, index: number) => (
                 <MediaCard key={`${media.id}-${media.media_type}-${index}`} item={media} />
              ))}
            </div>

            <div className="flex justify-center pt-10 pb-16">
              <Button 
                size="lg" 
                onClick={() => loadMoreItems(page + 1)} 
                disabled={loading}
                className="w-full md:w-auto px-12 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-xl shadow-[0_0_15px_rgba(255,193,25,0.2)] transition-all"
              >
                {loading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}