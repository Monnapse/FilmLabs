import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";

export default function FeaturedHero({ film }) {
  // Fallback if no film is passed yet
  if (!film) return <div className="h-[70vh] w-full bg-zinc-900 animate-pulse" />;

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] flex flex-col justify-end pb-16 md:pb-32 px-4 md:px-12">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={`https://image.tmdb.org/t/p/original${film.backdrop_path}`}
          alt={film.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md">
          {film.title}
        </h1>
        
        <p className="text-zinc-300 text-sm md:text-lg line-clamp-3 drop-shadow">
          {film.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button size="lg" className="bg-white text-black hover:bg-zinc-200 font-semibold px-8">
            <Play className="w-5 h-5 mr-2 fill-current" />
            Play
          </Button>
          <Button size="lg" variant="secondary" className="bg-zinc-500/50 hover:bg-zinc-500/70 text-white backdrop-blur-md px-8">
            <Info className="w-5 h-5 mr-2" />
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
}