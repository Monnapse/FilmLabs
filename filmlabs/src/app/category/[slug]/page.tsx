"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchTmdbCategory } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Formatting the slug for the title (e.g. "trending-movies" -> "Trending Movies")
  const pageTitle = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    // Next.js 15 requires awaiting the params promise
    params.then((resolved) => {
      setSlug(resolved.slug);
      loadMoreItems(resolved.slug, 1);
    });
  }, [params]);

  const loadMoreItems = async (currentSlug: string, pageNum: number) => {
    setLoading(true);
    try {
      const newItems = await fetchTmdbCategory(currentSlug, pageNum);
      
      if (pageNum === 1) {
        setItems(newItems);
        setInitialLoad(false);
      } else {
        // Append new items to the existing array for the infinite scroll effect
        setItems((prev) => [...prev, ...newItems]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch category:", error);
    }
    setLoading(false);
  };

  if (status === "loading" || initialLoad) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 h-10 w-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
        </header>

        {/* Full Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item, index) => {
            if (!item.poster_path) return null;
            const isTv = item.name !== undefined;
            const linkBase = isTv ? "tv" : "movie";
            const displayTitle = item.title || item.name;

            return (
              <Link href={`/${linkBase}/${item.id}`} key={`${item.id}-${index}`}>
                <Card className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all bg-slate-800">
                  <CardContent className="p-0 relative aspect-[2/3]">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={displayTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                       <span className="text-blue-400 text-xs font-bold uppercase mb-1">
                          {isTv ? "TV Series" : "Movie"}
                        </span>
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {displayTitle}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center pt-8 pb-12">
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => loadMoreItems(slug, page + 1)} 
            disabled={loading}
            className="w-full md:w-auto px-12"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>

      </div>
    </div>
  );
}