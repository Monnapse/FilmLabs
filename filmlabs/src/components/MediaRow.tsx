"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaCard from "./MediaCard";

export default function MediaRow({ title, items, linkHref }: { title: string, items: any[], linkHref?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track if we can scroll in either direction
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide buttons
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Give a 1px buffer for rounding errors in browsers
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  // Check on mount and window resize
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  if (!items || items.length === 0) return null;

  const scroll = (e: React.MouseEvent, direction: "left" | "right") => {
    e.preventDefault(); // Prevent accidental link clicks on the cards underneath
    e.stopPropagation();

    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 relative group/row">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-black text-white tracking-tight border-l-4 border-primary pl-3">{title}</h2>
        
        {linkHref && (
          <Link 
            href={linkHref} 
            className="text-sm font-bold text-primary hover:text-primary/80 flex items-center group transition-colors uppercase tracking-wider"
          >
            View More <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Left Scroll Button - Only visible if canScrollLeft is true */}
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-[45%] -translate-y-1/2 -translate-x-4 z-50 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/80 hover:bg-primary text-white hover:text-primary-foreground border-2 border-border/50 hover:border-primary opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-md shadow-xl"
          onClick={(e) => scroll(e, "left")}
        >
          <ChevronLeft className="h-7 w-7 pr-0.5" />
        </Button>
      )}

      {/* Right Scroll Button - Only visible if canScrollRight is true */}
      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-[45%] -translate-y-1/2 translate-x-4 z-50 hidden md:group-hover/row:flex h-12 w-12 rounded-full bg-black/80 hover:bg-primary text-white hover:text-primary-foreground border-2 border-border/50 hover:border-primary opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-md shadow-xl"
          onClick={(e) => scroll(e, "right")}
        >
          <ChevronRight className="h-7 w-7 pl-0.5" />
        </Button>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 relative z-10"
      >
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="snap-start shrink-0 w-[140px] md:w-[180px] lg:w-[200px]">
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}