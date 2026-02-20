"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MediaRow({ title, items, linkHref }: { title: string, items: any[], linkHref?: string }) {
  // 1. Create a reference to target the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  // 2. Function to handle smooth scrolling left or right
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // Scroll by exactly the width of the visible container
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 relative group/row">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        
        {/* 2. Only render the View More link if a linkHref was provided! */}
        {linkHref && (
          <Link 
            href={linkHref} 
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center group transition-colors"
          >
            View More <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Left Scroll Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-0 top-[55%] -translate-y-1/2 -translate-x-4 z-10 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white border-2 border-slate-700 opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-sm"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-8 w-8 pr-1" />
      </Button>

      {/* Right Scroll Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-0 top-[55%] -translate-y-1/2 translate-x-4 z-10 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white border-2 border-slate-700 opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-sm"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-8 w-8 pl-1" />
      </Button>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((item) => {
          if (!item.poster_path) return null;
          const isTv = item.name !== undefined; 
          const linkBase = isTv ? "tv" : "movie";
          const displayTitle = item.title || item.name;

          return (
            <Link href={`/${linkBase}/${item.id}`} key={item.id} className="snap-start shrink-0 w-[160px] md:w-[200px]">
              <Card className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all bg-slate-800">
                <CardContent className="p-0 relative aspect-[2/3]">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={displayTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 160px, 200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
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
    </div>
  );
}