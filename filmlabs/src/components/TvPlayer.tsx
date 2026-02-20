"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { markEpisodeWatched, getSeasonDetails } from "@/app/actions";
import { toast } from "sonner";
import { PlayCircle, Loader2 } from "lucide-react";

export default function TvPlayer({ tvShow, watchedEpisodes }: { tvShow: any, watchedEpisodes: any[] }) {
  // Filter out Season 0 (usually behind-the-scenes/specials)
  const availableSeasons = tvShow.seasons.filter((s: any) => s.season_number > 0);
  
  const [selectedSeason, setSelectedSeason] = useState(availableSeasons[0]?.season_number || 1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Video Player State
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);

  // Fetch episodes whenever the season changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      const data = await getSeasonDetails(tvShow.id, selectedSeason);
      if (data && data.episodes) {
        setEpisodes(data.episodes);
      }
      setLoading(false);
    };
    fetchEpisodes();
  }, [selectedSeason, tvShow.id]);

  const handlePlayEpisode = async (episodeNumber: number) => {
    setActiveEpisode(episodeNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll up to the video player
    
    try {
      await markEpisodeWatched(tvShow, selectedSeason, episodeNumber);
      toast.success(`S${selectedSeason} E${episodeNumber} logged to Watch History!`);
    } catch (error) {
      console.error("Failed to log episode", error);
    }
  };

  return (
    <div className="w-full space-y-8">
        {/* Video Player or Poster */}
        {activeEpisode ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black border border-slate-800 mt-6">
            <iframe
              src={`https://vidsrc.net/embed/tv?tmdb=${tvShow.id}&season=${selectedSeason}&episode=${activeEpisode}`}
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="relative w-full md:w-1/3 aspect-[2/3] rounded-lg overflow-hidden shadow-xl mt-6">
            <Image
              src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
              alt={tvShow.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Episodes</h2>
            <select 
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[180px] cursor-pointer hover:bg-slate-750 transition-colors"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
            >
              {availableSeasons.map((season: any) => (
                <option key={season.id} value={season.season_number}>
                  {/* Use the actual season name from TMDB (e.g., "Murder House" or "Season 1") */}
                  {season.name || `Season ${season.season_number}`} 
                  {season.episode_count ? ` (${season.episode_count} Episodes)` : ''}
                </option>
              ))}
            </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500 h-8 w-8" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {episodes.map((ep) => {
              // Check if they've watched this specific episode
              const isWatched = watchedEpisodes.some(
                w => w.seasonNumber === selectedSeason && w.episodeNumber === ep.episode_number
              );
              const isPlayingNow = activeEpisode === ep.episode_number;

              return (
                <div 
                  key={ep.id} 
                  onClick={() => handlePlayEpisode(ep.episode_number)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all bg-slate-800
                    ${isPlayingNow ? "border-blue-500" : "border-slate-700 hover:border-slate-500"}
                  `}
                >
                  <div className="relative aspect-video w-full bg-slate-900">
                    {ep.still_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} fill className="object-cover opacity-70 group-hover:opacity-40 transition-opacity" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600">No Image</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-semibold text-sm line-clamp-1">{ep.episode_number}. {ep.name}</h4>
                      {isWatched && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded ml-2 shrink-0">Watched</span>}
                    </div>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{ep.overview || "No description available."}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}