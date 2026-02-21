"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchTmdbCategory } from "@/app/actions";
import { Loader2 } from "lucide-react";
import MediaCard from "@/components/MediaCard";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const pageTitle = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
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
        setItems((prev) => [...prev, ...newItems]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch category:", error);
    }
    setLoading(false);
  };

  if (status === "loading" || initialLoad) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="pb-4 border-b border-border/50">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm border-l-4 border-primary pl-4">
            {pageTitle}
          </h1>
        </header>

        {/* Full Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {items.map((item: any, index: number) => (
             <MediaCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center pt-10 pb-16">
          <Button 
            size="lg" 
            onClick={() => loadMoreItems(slug, page + 1)} 
            disabled={loading}
            className="w-full md:w-auto px-12 h-14 bg-secondary hover:bg-secondary/80 text-white font-bold text-lg rounded-xl border border-border/50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>

      </div>
    </div>
  );
}