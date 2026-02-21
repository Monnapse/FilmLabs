"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Clock, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturedHero({ films }: { films: any[] }) {
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // High-Performance Drag State (Bypasses React Re-renders)
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragOffset = useRef<number>(0);

  // Auto-play logic
  useEffect(() => {
    if (!films || films.length === 0 || isHovered || isDragging) return;

    const timer = setInterval(() => {
      setVirtualIndex((current) => current + 1);
    }, 8000); 

    return () => clearInterval(timer);
  }, [films, isHovered, isDragging]);

  const nextSlide = useCallback(() => setVirtualIndex((current) => current + 1), []);
  const prevSlide = useCallback(() => setVirtualIndex((current) => current - 1), []);

  // --- High Performance Drag Event Handlers ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragOffset.current = 0;
    setIsDragging(true); // Triggers 1 render to disable CSS transitions
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || dragStartX.current === null || !trackRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - dragStartX.current;
    dragOffset.current = diff;
    
    // DIRECT DOM MANIPULATION: 60fps dragging without triggering React re-renders!
    trackRef.current.style.transform = `translateX(calc(${-virtualIndex * 100}% + ${diff}px))`;
  };

  const handleDragEnd = () => {
    if (!isDragging || dragStartX.current === null) return;
    
    const diff = dragOffset.current;
    setIsDragging(false); // Triggers 1 render to re-enable CSS transitions
    
    // Trigger slide if dragged past a 75px threshold
    if (diff > 75) {
      prevSlide();
    } else if (diff < -75) {
      nextSlide();
    } else if (trackRef.current) {
      // Snap back if they didn't drag far enough
      trackRef.current.style.transform = `translateX(-${virtualIndex * 100}%)`;
    }
    
    dragStartX.current = null;
    dragOffset.current = 0;
  };

  if (!films || films.length === 0) {
    return <div className="h-[75vh] md:h-[90vh] w-full bg-[#0d0d0d] animate-pulse" />;
  }

  const renderWindow = [-2, -1, 0, 1, 2];

  return (
    <div 
      className="relative w-full h-[75vh] md:h-[90vh] bg-[#0d0d0d] overflow-hidden group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleDragEnd(); 
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* 1. The Sliding Track (Uses trackRef for direct manipulation) */}
      <div 
        ref={trackRef}
        className={`absolute inset-0 w-full h-full will-change-transform ${isDragging ? 'transition-none' : 'transition-transform duration-700 ease-in-out'}`}
        style={{ transform: `translateX(${-virtualIndex * 100}%)` }}
      >
        {renderWindow.map((offset) => {
          const vIndex = virtualIndex + offset;
          const filmIndex = ((vIndex % films.length) + films.length) % films.length;
          const film = films[filmIndex];

          const isTv = film.name !== undefined;
          const displayTitle = film.title || film.name;
          const releaseDate = film.release_date || film.first_air_date || "";
          const year = releaseDate.split("-")[0];
          const linkBase = isTv ? "tv" : "movie";

          return (
            <div 
              key={vIndex} 
              className="absolute top-0 h-full w-full overflow-hidden bg-[#0d0d0d]"
              style={{ left: `${vIndex * 100}%` }}
            >
              {/* Background Image Layer with CSS Mask for perfect bottom fade */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' 
                }}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w1280${film.backdrop_path}`}
                  alt={displayTitle}
                  fill
                  className="object-cover opacity-60"
                  priority={offset === 0}
                  sizes="100vw"
                  unoptimized
                  draggable={false} 
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent w-full lg:w-[60%] pointer-events-none" />

              {/* Content Layer */}
              <div className="absolute inset-0 max-w-[1600px] w-full px-6 md:px-12 mx-auto flex flex-col justify-center pointer-events-none">
                <div className="max-w-2xl space-y-5">
                  
                  <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-[0.2em] uppercase">
                    <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                      # {filmIndex + 1} Spotlight
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl tracking-tighter line-clamp-2">
                    {displayTitle}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-[13px] md:text-sm font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> {isTv ? "TV" : "Movie"}
                      </span>
                      <span className="bg-white text-black px-2 py-0.5 rounded text-xs">HD</span>
                      {film.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-primary drop-shadow-md">
                          <Star className="w-4 h-4 fill-current" />
                          {film.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-white/70 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {year}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {isTv ? "24m" : "120m"}</span>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm md:text-lg line-clamp-3 md:line-clamp-4 max-w-xl leading-relaxed font-medium drop-shadow-md">
                    {film.overview}
                  </p>

                  <div className="flex items-center gap-4 pt-4 pointer-events-auto">
                    <Link href={`/${linkBase}/${film.id}?play=true`}>
                      <Button 
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-7 font-bold text-lg shadow-[0_0_30px_rgba(255,193,25,0.4)] transition-all hover:scale-105"
                      >
                        <Play className="w-6 h-6 mr-2 fill-current" />
                        Watch Now
                      </Button>
                    </Link>
                    <Link href={`/${linkBase}/${film.id}`}>
                      <Button 
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        variant="secondary" 
                        className="bg-white/10 hover:bg-white/20 text-white border-none rounded-full px-8 py-7 font-bold text-lg backdrop-blur-md transition-all"
                      >
                        Details <ChevronRight className="w-6 h-6 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Navigation Arrows (Hidden on mobile, swipe enabled) */}
      <div className="absolute hidden md:flex bottom-32 right-12 z-20 gap-3">
        <Button 
          variant="secondary" 
          size="icon" 
          onMouseDown={(e) => { e.stopPropagation(); prevSlide(); }}
          onTouchStart={(e) => { e.stopPropagation(); prevSlide(); }}
          className="bg-[#14151a]/80 hover:bg-primary hover:text-[#14151a] border border-white/10 rounded-xl w-14 h-14 backdrop-blur-xl transition-all shadow-2xl"
        >
          <ChevronLeft className="w-8 h-8 pointer-events-none" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onMouseDown={(e) => { e.stopPropagation(); nextSlide(); }}
          onTouchStart={(e) => { e.stopPropagation(); nextSlide(); }}
          className="bg-[#14151a]/80 hover:bg-primary hover:text-[#14151a] border border-white/10 rounded-xl w-14 h-14 backdrop-blur-xl transition-all shadow-2xl"
        >
          <ChevronRight className="w-8 h-8 pointer-events-none" />
        </Button>
      </div>
    </div>
  );
}