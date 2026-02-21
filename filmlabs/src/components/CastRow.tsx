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
      <h2 className="text-2xl font-black text-white tracking-tight border-l-4 border-primary pl-3">Cast & Characters</h2>

      <Button
        variant="secondary"
        size="icon"
        className="absolute left-0 top-[60%] -translate-y-1/2 -translate-x-4 z-10 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/80 hover:bg-primary text-white hover:text-primary-foreground border-2 border-border/50 hover:border-primary opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-md shadow-xl"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-7 w-7 pr-0.5" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-0 top-[60%] -translate-y-1/2 translate-x-4 z-10 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/80 hover:bg-primary text-white hover:text-primary-foreground border-2 border-border/50 hover:border-primary opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-md shadow-xl"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-7 w-7 pl-0.5" />
      </Button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1"
      >
        {cast.slice(0, 30).map((actor) => (
          <div key={actor.id} className="snap-start shrink-0 w-[140px] bg-card rounded-xl overflow-hidden shadow-lg border-2 border-border/50 hover:border-primary/50 transition-all">
            <div className="relative aspect-[2/3] bg-secondary flex items-center justify-center">
              {actor.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-3 bg-[#14151a]">
              <h4 className="text-white font-bold text-sm line-clamp-1" title={actor.name}>
                {actor.name}
              </h4>
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2 font-medium" title={actor.character}>
                {actor.character}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}