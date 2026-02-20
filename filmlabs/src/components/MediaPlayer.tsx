"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { addToWatchHistory, markEpisodeWatched, getSeasonDetails } from "@/app/actions";
import { toast } from "sonner";
import { PlayCircle, Loader2 } from "lucide-react";
import ServerSelector from "./ServerSelector";
import { videoServices } from "@/lib/videoServices";

export default function MediaPlayer({ 
  media, 
  mediaType, 
  watchedHistory = [],
  episodeHistory = []
}: { 
  media: any, 
  mediaType: string, 
  watchedHistory?: any[],
  episodeHistory?: any[]
}) {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  
  const availableSeasons = mediaType === "tv" ? media.seasons.filter((s: any) => s.season_number > 0) : [];
  const [selectedSeason, setSelectedSeason] = useState(availableSeasons[0]?.season_number || 1);
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // NEW: Local state to instantly update the UI when a user clicks play
  const [movieWatched, setMovieWatched] = useState(mediaType === "movie" && watchedHistory.length > 0);
  const [watchedEps, setWatchedEps] = useState(episodeHistory);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (mediaType === "movie" && params.get("play") === "true") {
      setIsMoviePlaying(true);
    } else if (mediaType === "tv") {
      const s = params.get("s");
      const e = params.get("e");
      if (s) setSelectedSeason(Number(s));
      if (e) setActiveEpisode(Number(e));
    }
  }, [mediaType]);

  useEffect(() => {
    if (mediaType !== "tv") return;
    const fetchEpisodes = async () => {
      setLoadingEpisodes(true);
      const data = await getSeasonDetails(media.id, selectedSeason);
      if (data && data.episodes) setEpisodes(data.episodes);
      setLoadingEpisodes(false);
    };
    fetchEpisodes();
  }, [selectedSeason, media.id, mediaType]);

  const handlePlayMovie = async () => {
    setIsMoviePlaying(true);
    window.history.replaceState(null, '', '?play=true');
    
    // Only fire database update if not already watched
    if (!movieWatched) {
      try {
        await addToWatchHistory(media);
        setMovieWatched(true); // Instantly trigger the ✓ Watched badge!
        toast.success("Added to Watch History", { description: "Hope you enjoy the movie!" });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePlayEpisode = async (episodeNumber: number) => {
    setActiveEpisode(episodeNumber);
    window.history.replaceState(null, '', `?s=${selectedSeason}&e=${episodeNumber}`);
    window.scrollTo({ top: 0, behavior: "smooth" }); 
    
    // Check local state array instead of the static server array
    const isEpisodeWatched = watchedEps.some(
      (w: any) => w.seasonNumber === selectedSeason && w.episodeNumber === episodeNumber
    );

    if (!isEpisodeWatched) {
      try {
        await markEpisodeWatched(media, selectedSeason, episodeNumber);
        // Instantly add it to the local state so the checkmark appears!
        setWatchedEps((prev) => [...prev, { seasonNumber: selectedSeason, episodeNumber }]);
        toast.success(`S${selectedSeason} E${episodeNumber} logged to Watch History!`);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const activeService = videoServices[selectedServiceIndex];
  let iframeSrc = "";
  if (mediaType === "movie" && isMoviePlaying) {
    iframeSrc = activeService.movieUrl.replace("{tmdbId}", media.id.toString());
  } else if (mediaType === "tv" && activeEpisode) {
    iframeSrc = activeService.tvUrl
      .replace("{tmdbId}", media.id.toString())
      .replace("{season}", selectedSeason.toString())
      .replace("{episode}", activeEpisode.toString());
  }

  const isPlaying = (mediaType === "movie" && isMoviePlaying) || (mediaType === "tv" && activeEpisode !== null);

  return (
    <div className="w-full space-y-8">
      
      {isPlaying ? (
        <div className="w-full space-y-3 mt-6">
          <ServerSelector selectedIndex={selectedServiceIndex} setSelectedIndex={setSelectedServiceIndex} />
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black border border-slate-800">
            <iframe src={iframeSrc} allowFullScreen className="absolute inset-0 w-full h-full border-0" />
          </div>
        </div>
      ) : (
        <div 
          className={`relative w-full md:w-1/3 aspect-[2/3] md:aspect-auto md:h-[600px] rounded-lg overflow-hidden shadow-xl mt-6 ${mediaType === "movie" ? "cursor-pointer group" : ""}`}
          onClick={mediaType === "movie" ? handlePlayMovie : undefined}
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={media.title || media.name}
            fill
            className={`object-cover ${mediaType === "movie" ? "group-hover:scale-105 group-hover:blur-sm transition-all duration-500" : ""}`}
          />
          
          {/* Use the new local state variable here */}
          {movieWatched && (
            <div className="absolute top-4 left-4 z-10 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg uppercase tracking-wider flex items-center">
              ✓ Watched
            </div>
          )}

          {mediaType === "movie" && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayCircle className="w-20 h-20 text-white shadow-2xl drop-shadow-2xl" />
            </div>
          )}
        </div>
      )}

      {mediaType === "tv" && (
        <div className="pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Episodes</h2>
            <select 
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[180px] cursor-pointer hover:bg-slate-750 transition-colors"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
            >
              {availableSeasons.map((season: any) => (
                <option key={season.id} value={season.season_number}>
                  {season.name || `Season ${season.season_number}`} 
                  {season.episode_count ? ` (${season.episode_count} Episodes)` : ''}
                </option>
              ))}
            </select>
          </div>

          {loadingEpisodes ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500 h-8 w-8" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {episodes.map((ep) => {
                // Check the local state array instead of the server array
                const isWatched = watchedEps.some((w: any) => w.seasonNumber === selectedSeason && w.episodeNumber === ep.episode_number);
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
                        {isWatched && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded ml-2 shrink-0 uppercase tracking-wide">✓ Watched</span>}
                      </div>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{ep.overview || "No description available."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}