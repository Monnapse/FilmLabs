"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, CheckCircle } from "lucide-react"; // Added CheckCircle
import { getMediaRating } from "@/app/actions";

export default function MediaCard({ item }: { item: any }) {
  const [ageRating, setAgeRating] = useState<string>("...");
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!item.poster_path) return null;

  const isTv = item.name !== undefined;
  const linkBase = isTv ? "tv" : "movie";
  const displayTitle = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const yearLabel = date ? date.split('-')[0] : "";
  const typeLabel = isTv ? "TV Series" : "Movie";
  const badgeLabel = isTv ? "TV" : "MOV";
  
  // Check if the item has been marked as watched (supports both property names depending on how your parent component passes it)
  const isWatched = item.isWatched || item.watched;

  useEffect(() => {
    if (hasBeenFetched) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenFetched) {
            setHasBeenFetched(true);
            
            getMediaRating(item.id, isTv ? "tv" : "movie")
              .then((realRating) => {
                setAgeRating(realRating || (item.adult ? "18+" : "NR"));
              })
              .catch(() => setAgeRating(item.adult ? "18+" : "NR"));

            observer.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: "200px", 
        threshold: 0.01 
      }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [item.id, isTv, item.adult, hasBeenFetched]);

  return (
    <div ref={cardRef} className="flex flex-col gap-2.5 group w-full h-full relative z-0">
      <Link href={`/${linkBase}/${item.id}`} className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#14151a] block shadow-lg">
        <Image
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt={displayTitle}
          fill
          className="object-cover group-hover:scale-105 group-hover:opacity-40 transition-all duration-500 ease-out"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        
        {/* Top Left: Star Rating */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-primary/90 backdrop-blur-md text-primary-foreground text-[11px] font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-[0_0_10px_rgba(255,193,25,0.3)]">
              <Star className="w-3 h-3 fill-current" />
              {(item.vote_average).toFixed(1)}
            </div>
          </div>
        )}

        {/* Top Right: Glassy Watched Indicator */}
        {isWatched && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-[#14151a]/80 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-[0_0_15px_rgba(255,193,25,0.2)] tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              WATCHED
            </div>
          </div>
        )}

        {/* Bottom Left: Info Badges (HiAnime Style) */}
        <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap items-center gap-1.5">
          <div className="bg-[#14151a]/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xl tracking-wider min-w-[28px] text-center whitespace-nowrap">
            {ageRating}
          </div>
          <div className="bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-black px-2 py-1 rounded-md shadow-xl uppercase tracking-wider whitespace-nowrap">
            HD
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold px-2 py-1 rounded-md shadow-xl uppercase tracking-wider whitespace-nowrap">
            {badgeLabel}
          </div>
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-primary text-primary-foreground rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_30px_rgba(255,193,25,0.5)]">
            <Play className="w-8 h-8 ml-1 fill-current" />
          </div>
        </div>
      </Link>
      
      {/* Title & Metadata Below Poster */}
      <div className="flex flex-col px-1 mt-1">
        <Link href={`/${linkBase}/${item.id}`} className="text-white font-bold text-sm md:text-base line-clamp-2 hover:text-primary transition-colors leading-snug">
          {displayTitle}
        </Link>
        <div className="flex items-center gap-2 text-[11px] md:text-xs text-white/50 mt-1.5 font-semibold">
          <span>{typeLabel}</span>
          {yearLabel && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/30"></span>
              <span>{yearLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}