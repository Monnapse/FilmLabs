"use client";

import { useState } from "react";
import Image from "next/image";
import { addToWatchHistory } from "@/app/actions";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";

export default function MoviePlayer({ movie, posterPath }: { movie: any, posterPath: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    setIsPlaying(true);
    
    // Auto-assign watch history when they click play!
    try {
      await addToWatchHistory(movie);
      toast.success("Added to Watch History", { description: "Hope you enjoy the movie!" });
    } catch (error) {
      console.error("Failed to update history", error);
    }
  };

  if (isPlaying) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black border border-slate-800">
        <iframe
          // Using a common embed format. Swap 'vidsrc.net' if you use a different provider!
          src={`https://vidsrc.net/embed/movie?tmdb=${movie.id}`}
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full md:w-1/3 aspect-[2/3] md:aspect-auto md:h-[600px] rounded-lg overflow-hidden shadow-xl cursor-pointer group"
      onClick={handlePlay}
    >
      <Image
        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        alt={movie.title}
        fill
        className="object-cover group-hover:scale-105 group-hover:blur-sm transition-all duration-500"
      />
      {/* Play Button Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <PlayCircle className="w-20 h-20 text-white shadow-2xl drop-shadow-2xl" />
      </div>
    </div>
  );
}