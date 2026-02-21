"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { searchMediaAction } from "@/app/actions";

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

  // Fetch initial data anytime URL params change
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
        // Append new items preventing duplicates
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            {isBrowsing ? "Browsing Catalog" : `Search Results for "${query}"`}
          </h1>
        </header>

        {mediaItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-500">We couldn't find any results matching your search and filters.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block font-medium">
              Return to Discover
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {mediaItems.map((media: any) => {
                if (!media.poster_path) return null; 

                const linkBase = media.media_type === "tv" ? "tv" : "movie";
                const title = media.title || media.name; 
                const date = media.release_date || media.first_air_date;
                const yearLabel = date ? date.split('-')[0] : "";

                return (
                  <Link href={`/${linkBase}/${media.id}`} key={`${media.id}-${media.media_type}`}>
                    <Card className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-0 relative aspect-[2/3]">
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-blue-400 text-xs font-bold uppercase">
                              {media.media_type} {yearLabel && `• ${yearLabel}`}
                            </span>
                            {media.vote_average > 0 && (
                              <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                {(media.vote_average).toFixed(1)}
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-sm line-clamp-2">
                            {title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="flex justify-center pt-8 pb-12">
              <Button 
                size="lg" 
                variant="default"
                onClick={() => loadMoreItems(page + 1)} 
                disabled={loading}
                className="w-full md:w-auto px-12"
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

// Wrap search params reliant component in Suspense boundary for Next.js build compliance
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}