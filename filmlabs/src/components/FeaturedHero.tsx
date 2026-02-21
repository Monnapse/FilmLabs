"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Clock, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export default function FeaturedHero({ films }: { films: any[] }) {
  // 1. Optimized Embla Config: 'duration' smooths the curve, 'skipSnaps' prevents hitching
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      duration: 25, 
      skipSnaps: false,
      watchSlides: true
    }, 
    [Autoplay({ delay: 8000, stopOnInteraction: false })]
  );

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (!films || films.length === 0) {
    return <div className="h-[65vh] md:h-[85vh] w-full bg-[#14151a] animate-pulse" />;
  }

  return (
    <div className="relative group/hero w-full overflow-hidden bg-[#0d0d0d]">
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Added 'will-change-transform' to offload the animation to the GPU */}
        <div className="flex will-change-transform translate-z-0">
          {films.map((film, index) => {
            const isTv = film.name !== undefined;
            const displayTitle = film.title || film.name;
            const releaseDate = film.release_date || film.first_air_date || "";
            const year = releaseDate.split("-")[0];
            const linkBase = isTv ? "tv" : "movie";

            return (
              <div key={film.id} className="relative flex-[0_0_100%] min-w-0 h-[65vh] md:h-[85vh] flex items-center">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <Image
                    src={`https://image.tmdb.org/t/p/original${film.backdrop_path}`}
                    alt={displayTitle}
                    fill
                    className="object-cover opacity-60"
                    // Increase priority to the first 3 items to prevent "pop-in" lag during initial scrolls
                    priority={index < 3}
                    sizes="100vw"
                    quality={85}
                  />
                  {/* Optimized Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent w-full lg:w-[60%] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14151a] via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="max-w-[1600px] w-full px-6 md:px-12 z-10 mx-auto">
                  {/* Removed heavy 'animate-in' classes to reduce re-paint costs during slide transitions */}
                  <div className="max-w-2xl space-y-5">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-[0.2em] uppercase">
                      <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                        # {index + 1} Spotlight
                      </span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl tracking-tighter">
                      {displayTitle}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-[13px] md:text-sm font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current" /> {isTv ? "TV" : "Movie"}
                        </span>
                        <span className="bg-white text-black px-2 py-0.5 rounded text-xs">HD</span>
                        {film.vote_average > 0 && (
                          <span className="flex items-center gap-1 text-primary">
                            <Star className="w-4 h-4 fill-current" />
                            {film.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-white/60 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {year}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {isTv ? "24m" : "120m"}</span>
                      </div>
                    </div>

                    <p className="text-white/80 text-sm md:text-lg line-clamp-3 md:line-clamp-4 max-w-xl leading-relaxed font-medium">
                      {film.overview}
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                      <Link href={`/${linkBase}/${film.id}?play=true`}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-7 font-bold text-lg shadow-[0_8px_30px_rgb(255,193,25,0.3)] transition-all">
                          <Play className="w-6 h-6 mr-2 fill-current" />
                          Watch Now
                        </Button>
                      </Link>
                      <Link href={`/${linkBase}/${film.id}`}>
                        <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none rounded-full px-8 py-7 font-bold text-lg backdrop-blur-md transition-all">
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
      </div>

      <div className="absolute bottom-20 right-8 md:right-16 z-20 flex gap-3">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={scrollPrev}
          className="bg-[#242428]/80 hover:bg-primary hover:text-primary-foreground border-none rounded-xl w-14 h-14 backdrop-blur-xl transition-all shadow-2xl"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={scrollNext}
          className="bg-[#242428]/80 hover:bg-primary hover:text-primary-foreground border-none rounded-xl w-14 h-14 backdrop-blur-xl transition-all shadow-2xl"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}