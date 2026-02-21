"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { addToWatchHistory, markEpisodeWatched, getSeasonDetails } from "@/app/actions";
import { toast } from "sonner";
import { PlayCircle, Loader2 } from "lucide-react";
import ServerSelector from "./ServerSelector";
import { videoServices } from "@/lib/videoServices";
import { useSearchParams, useRouter } from "next/navigation";

export default function MediaPlayer({ 
  media, mediaType, watchedHistory = [], episodeHistory = [], children
}: { 
  media: any, mediaType: string, watchedHistory?: any[], episodeHistory?: any[], children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [isMoviePlaying, setIsMoviePlaying] = useState(searchParams.get("play") === "true");
  
  const availableSeasons = mediaType === "tv" ? media.seasons.filter((s: any) => s.season_number > 0) : [];
  const [selectedSeason, setSelectedSeason] = useState(Number(searchParams.get("s")) || availableSeasons[0]?.season_number || 1);
  const [activeEpisode, setActiveEpisode] = useState<number | null>(Number(searchParams.get("e")) || null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const [movieWatched, setMovieWatched] = useState(mediaType === "movie" && watchedHistory.length > 0);
  const [watchedEps, setWatchedEps] = useState(episodeHistory);
  const playerRef = useRef<HTMLDivElement>(null);

  // 1. Sync State with URL Params & Handle Database Logging
  useEffect(() => {
    const playParam = searchParams.get("play");
    const sParam = searchParams.get("s");
    const eParam = searchParams.get("e");

    if (mediaType === "movie" && playParam === "true") {
      setIsMoviePlaying(true);
      if (!movieWatched) {
        addToWatchHistory(media).then(() => {
          setMovieWatched(true);
          toast.success("Added to Watch History", { description: "Hope you enjoy the movie!" });
        }).catch(console.error);
      }
      if (playerRef.current) playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } 
    else if (mediaType === "tv" && sParam && eParam) {
      const sNum = Number(sParam);
      const eNum = Number(eParam);
      setSelectedSeason(sNum);
      setActiveEpisode(eNum);

      const isEpisodeWatched = watchedEps.some((w: any) => w.seasonNumber === sNum && w.episodeNumber === eNum);
      if (!isEpisodeWatched) {
        markEpisodeWatched(media, sNum, eNum).then(() => {
          setWatchedEps((prev) => [...prev, { seasonNumber: sNum, episodeNumber: eNum }]);
          toast.success(`S${sNum} E${eNum} logged to Watch History!`);
        }).catch(console.error);
      }
      if (playerRef.current) playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams, mediaType, media, movieWatched, watchedEps]);

  // 2. Fetch TV Episodes
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

  const handlePlayEpisode = (episodeNumber: number) => {
    router.push(`?s=${selectedSeason}&e=${episodeNumber}`, { scroll: false });
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
    <div className="w-full flex flex-col gap-8">
      
      {/* THE PLAYER (Only visible if URL says so) */}
      {isPlaying && (
        <div ref={playerRef} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col mt-4 md:mt-8 shadow-2xl">
          
          {/* Video Container */}
          <div className="relative w-full aspect-video bg-[#000000] overflow-hidden rounded-t-lg">
            <iframe src={iframeSrc} allowFullScreen className="absolute inset-0 w-full h-full border-0" />
          </div>
          
          {/* Attached Control Bar (Servers) */}
          <div className="w-full rounded-b-lg overflow-hidden">
             <ServerSelector selectedIndex={selectedServiceIndex} setSelectedIndex={setSelectedServiceIndex} />
          </div>
          
        </div>
      )}

      {/* THE DETAILS HERO (Injected from page.tsx) */}
      <div className={isPlaying ? "border-b border-border/50 pb-8" : ""}>
         {children}
      </div>

      {/* TV EPISODES GRID */}
      {mediaType === "tv" && (
        <div className="w-full pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-l-4 border-primary pl-4">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm">Episodes</h2>
            
            <div className="relative">
              <select 
                className="appearance-none bg-secondary/80 border border-border/50 text-white font-bold text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 pr-10 min-w-[200px] cursor-pointer hover:bg-secondary transition-colors outline-none shadow-sm"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {availableSeasons.map((season: any) => (
                  <option key={season.id} value={season.season_number} className="bg-[#14151a]">
                    {season.name || `Season ${season.season_number}`} 
                    {season.episode_count ? ` (${season.episode_count} Episodes)` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>

          {loadingEpisodes ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {episodes.map((ep) => {
                const isWatched = watchedEps.some((w: any) => w.seasonNumber === selectedSeason && w.episodeNumber === ep.episode_number);
                const isPlayingNow = activeEpisode === ep.episode_number;

                return (
                  <div 
                    key={ep.id} 
                    onClick={() => handlePlayEpisode(ep.episode_number)}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 bg-card
                      ${isPlayingNow ? "border-primary shadow-[0_0_15px_rgba(255,193,25,0.3)]" : "border-transparent hover:border-border/80 shadow-md hover:shadow-xl"}
                    `}
                  >
                    <div className="relative aspect-video w-full bg-secondary">
                      {ep.still_path ? (
                        <Image src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} fill className="object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-300" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-bold text-sm">No Image</div>
                      )}
                      
                      {/* Hover Play Glow */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                           <PlayCircle className="w-8 h-8 fill-current" />
                        </div>
                      </div>

                      {isWatched && (
                        <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                          ✓ Watched
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h4 className={`font-bold text-sm line-clamp-1 mb-1 ${isPlayingNow ? "text-primary" : "text-white group-hover:text-primary transition-colors"}`}>
                        {ep.episode_number}. {ep.name}
                      </h4>
                      <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">{ep.overview || "No description available."}</p>
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