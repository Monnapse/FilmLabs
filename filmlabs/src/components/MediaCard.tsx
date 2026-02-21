"use client"; // Required because we are using useEffect and useState now

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { getMediaRating } from "@/app/actions";

export default function MediaCard({ item }: { item: any }) {
  const [ageRating, setAgeRating] = useState<string>("...");

  if (!item.poster_path) return null;

  const isTv = item.name !== undefined;
  const linkBase = isTv ? "tv" : "movie";
  const displayTitle = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const yearLabel = date ? date.split('-')[0] : "";
  const typeLabel = isTv ? "TV Series" : "Movie";
  const badgeLabel = isTv ? "TV" : "MOV";

  // Fetch the real age rating on component mount
  useEffect(() => {
    let isMounted = true;
    
    getMediaRating(item.id, isTv ? "tv" : "movie").then((realRating) => {
      if (isMounted) {
        // Use real rating, fallback to TMDB's adult flag, or "NR" (Not Rated)
        setAgeRating(realRating || (item.adult ? "18+" : "NR"));
      }
    });

    return () => { isMounted = false; };
  }, [item.id, isTv, item.adult]);

  return (
    <div className="flex flex-col gap-2.5 group w-full h-full relative z-0">
      {/* Poster Image Container */}
      <Link href={`/${linkBase}/${item.id}`} className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary/50 block shadow-md">
        <Image
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt={displayTitle}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        
        {/* Top Badges (Rating) */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-primary text-primary-foreground text-[11px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-current" />
              {(item.vote_average).toFixed(1)}
            </div>
          </div>
        )}

        {/* Bottom Badges (Age Rating / HD / Type) */}
        <div className="absolute bottom-2 left-2 z-10 flex gap-1">
          {/* Real Age Rating Badge */}
          <div className="bg-white/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-wider min-w-[28px] text-center">
            {ageRating}
          </div>
          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm uppercase tracking-wider">
            HD
          </div>
          <div className="bg-secondary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm uppercase tracking-wider backdrop-blur-sm">
            {badgeLabel}
          </div>
        </div>

        {/* Hover Play Button & Dark Overlay */}
        <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 backdrop-blur-[1px]">
          <div className="bg-primary text-primary-foreground rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_30px_rgba(255,193,25,0.4)]">
            <Play className="w-8 h-8 ml-1 fill-current" />
          </div>
        </div>
      </Link>
      
      {/* Title and Meta Below Poster */}
      <div className="flex flex-col px-0.5">
        <Link href={`/${linkBase}/${item.id}`} className="text-white font-bold text-sm md:text-base line-clamp-2 hover:text-primary transition-colors leading-snug">
          {displayTitle}
        </Link>
        <div className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground mt-1.5 font-semibold">
          <span>{typeLabel}</span>
          {yearLabel && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/60"></span>
              <span>{yearLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}