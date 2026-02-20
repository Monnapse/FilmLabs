"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CastRow({ cast }: { cast: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!cast || cast.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 relative group/row mt-12">
      <h2 className="text-2xl font-bold text-white tracking-tight">Cast & Characters</h2>

      <Button
        variant="secondary"
        size="icon"
        className="absolute left-0 top-[60%] -translate-y-1/2 -translate-x-4 z-10 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white border-2 border-slate-700 opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-sm"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-8 w-8 pr-1" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-0 top-[60%] -translate-y-1/2 translate-x-4 z-10 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white border-2 border-slate-700 opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-sm"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-8 w-8 pl-1" />
      </Button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* We slice to 30 so we don't render hundreds of background extras */}
        {cast.slice(0, 30).map((actor) => (
          <div key={actor.id} className="snap-start shrink-0 w-[140px] bg-slate-800 rounded-lg overflow-hidden shadow-sm border border-slate-700">
            <div className="relative aspect-[2/3] bg-slate-900 flex items-center justify-center">
              {actor.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              ) : (
                <User className="w-12 h-12 text-slate-600" />
              )}
            </div>
            <div className="p-3">
              <h4 className="text-white font-semibold text-sm line-clamp-1" title={actor.name}>
                {actor.name}
              </h4>
              <p className="text-slate-400 text-xs mt-1 line-clamp-2" title={actor.character}>
                {actor.character}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}