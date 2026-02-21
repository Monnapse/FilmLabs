"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  addToWatchHistory,
  markEpisodeWatched,
  getSeasonDetails,
  extractRawStream,
} from "@/app/actions";
import { toast } from "sonner";
import { Play, Loader2, CheckCircle } from "lucide-react"; 
import ServerSelector from "./ServerSelector";
import { videoServices } from "@/lib/videoServices";
import { useSearchParams, useRouter } from "next/navigation";
import NativePlayer from "./NativePlayer";

export default function MediaPlayer({
  media,
  mediaType,
  watchedHistory = [],
  episodeHistory = [],
  children,
}: {
  media: any;
  mediaType: string;
  watchedHistory?: any[];
  episodeHistory?: any[];
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [isMoviePlaying, setIsMoviePlaying] = useState(
    searchParams.get("play") === "true",
  );

  const [rawStreamUrl, setRawStreamUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(false);

  const availableSeasons =
    mediaType === "tv"
      ? media.seasons.filter((s: any) => s.season_number > 0)
      : [];
  const [selectedSeason, setSelectedSeason] = useState(
    Number(searchParams.get("s")) || availableSeasons[0]?.season_number || 1,
  );
  const [activeEpisode, setActiveEpisode] = useState<number | null>(
    Number(searchParams.get("e")) || null,
  );
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const [movieWatched, setMovieWatched] = useState(
    mediaType === "movie" && watchedHistory.length > 0,
  );
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
        addToWatchHistory(media)
          .then((res) => {
            if (res && res.error) return; 
            setMovieWatched(true);
            toast.success("Added to Watch History", {
              description: "Hope you enjoy the movie!",
            });
          })
          .catch(console.error);
      }
      if (playerRef.current)
        playerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    } else if (mediaType === "tv" && sParam && eParam) {
      const sNum = Number(sParam);
      const eNum = Number(eParam);
      setSelectedSeason(sNum);
      setActiveEpisode(eNum);

      const isEpisodeWatched = watchedEps.some(
        (w: any) => w.seasonNumber === sNum && w.episodeNumber === eNum,
      );
      if (!isEpisodeWatched) {
        markEpisodeWatched(media, sNum, eNum)
          .then((res) => {
            if (res && res.error) return; 
            setWatchedEps((prev) => [
              ...prev,
              { seasonNumber: sNum, episodeNumber: eNum },
            ]);
            toast.success(`S${sNum} E${eNum} logged to Watch History!`);
          })
          .catch(console.error);
      }
      if (playerRef.current)
        playerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
  
  // 3. Set iframe URL ONLY if it's not the native extractor
  let iframeSrc = "";
  if (!activeService.isNative) {
    if (mediaType === "movie" && isMoviePlaying) {
      iframeSrc = activeService.movieUrl.replace("{tmdbId}", media.id.toString());
    } else if (mediaType === "tv" && activeEpisode) {
      iframeSrc = activeService.tvUrl
        .replace("{tmdbId}", media.id.toString())
        .replace("{season}", selectedSeason.toString())
        .replace("{episode}", activeEpisode.toString());
    }
  }

  const isPlaying =
    (mediaType === "movie" && isMoviePlaying) ||
    (mediaType === "tv" && activeEpisode !== null);

  // 4. Handle Native Stream Extraction
  useEffect(() => {
    const fetchStream = async () => {
      // ONLY run extraction if the active service is marked as native
      if (isPlaying && activeService.isNative) {
        setIsExtracting(true);
        setRawStreamUrl(null); 
        setExtractionError(false);

        // Get the correct title whether it's a movie or tv show
        const mediaTitle = media.title || media.name;

        // Pass the title to the updated action
        const res = await extractRawStream(
          mediaTitle,
          mediaType,
          selectedSeason,
          activeEpisode || undefined,
        );

        if (res.success && res.url) {
          setRawStreamUrl(res.url);
        } else {
          setExtractionError(true);
          toast.error("Direct Stream Unavailable", {
            description: "Please select a different server from the dropdown.",
          });
        }
        setIsExtracting(false);
      } else {
        // Reset states if standard iframe server is selected
        setRawStreamUrl(null);
        setIsExtracting(false);
        setExtractionError(false);
      }
    };

    fetchStream();
  }, [isMoviePlaying, activeEpisode, media.id, mediaType, selectedSeason, activeService]);

  return (
    <div className="w-full flex flex-col gap-8">
      {isPlaying && (
        <div
          ref={playerRef}
          className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col mt-4 md:mt-8 shadow-2xl"
        >
          <div className="relative w-full aspect-video bg-[#000000] overflow-hidden rounded-t-lg flex items-center justify-center">
            
            {activeService.isNative ? (
              // NATIVE EXTRACTOR UI
              isExtracting ? (
                <div className="flex flex-col items-center gap-4 text-primary">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="font-bold tracking-wider animate-pulse">
                    EXTRACTING RAW STREAM...
                  </p>
                </div>
              ) : rawStreamUrl ? (
                // BINGO! 100% Ad-Free Native Video Player
                <NativePlayer
                  streamUrl={rawStreamUrl}
                  poster={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
                />
              ) : extractionError ? (
                <div className="flex flex-col items-center gap-2 text-white/50">
                  <p className="font-bold text-red-400">Direct Stream Not Found</p>
                  <p className="text-sm">Please select a fallback server below.</p>
                </div>
              ) : null
            ) : (
              // STANDARD IFRAME UI
              <iframe
                src={iframeSrc}
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            )}
          </div>

          <div className="w-full rounded-b-lg overflow-hidden bg-secondary">
            {activeService.isNative && rawStreamUrl ? (
              <div className="p-4 text-center text-sm font-bold text-green-400 bg-green-400/10 border-t border-green-400/20">
                FilmLabs Direct Stream Active (Ad-Free)
              </div>
            ) : (
              <ServerSelector
                selectedIndex={selectedServiceIndex}
                setSelectedIndex={setSelectedServiceIndex}
              />
            )}
          </div>
        </div>
      )}

      <div className={isPlaying ? "border-b border-border/50 pb-8" : ""}>
        {children}
      </div>

      {mediaType === "tv" && (
        <div className="w-full pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-l-4 border-primary pl-4">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm">
              Episodes
            </h2>

            <div className="relative">
              <select
                className="appearance-none bg-secondary/80 border border-border/50 text-white font-bold text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 pr-10 min-w-[200px] cursor-pointer hover:bg-secondary transition-colors outline-none shadow-sm"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {availableSeasons.map((season: any) => (
                  <option
                    key={season.id}
                    value={season.season_number}
                    className="bg-[#14151a]"
                  >
                    {season.name || `Season ${season.season_number}`}
                    {season.episode_count
                      ? ` (${season.episode_count} Episodes)`
                      : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {loadingEpisodes ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary h-12 w-12" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {episodes.map((ep) => {
                const isWatched = watchedEps.some(
                  (w: any) =>
                    w.seasonNumber === selectedSeason &&
                    w.episodeNumber === ep.episode_number,
                );
                const isPlayingNow = activeEpisode === ep.episode_number;

                return (
                  <div
                    key={ep.id}
                    onClick={() => handlePlayEpisode(ep.episode_number)}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 bg-[#14151a]
                      ${isPlayingNow ? "border-primary shadow-[0_0_15px_rgba(255,193,25,0.3)] scale-[1.02]" : "border-white/5 hover:border-primary/50 shadow-md hover:shadow-xl"}
                    `}
                  >
                    <div className="relative aspect-video w-full bg-[#0d0d0d]">
                      {ep.still_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                          alt={ep.name}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-bold text-sm">
                          No Image
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-primary text-primary-foreground rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_30px_rgba(255,193,25,0.5)]">
                          <Play className="w-6 h-6 ml-0.5 fill-current" />
                        </div>
                      </div>

                      {isWatched && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-[#14151a]/80 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-[0_0_15px_rgba(255,193,25,0.2)] tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" />
                            WATCHED
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-white/5">
                      <h4
                        className={`font-bold text-sm line-clamp-1 mb-1 ${isPlayingNow ? "text-primary" : "text-white group-hover:text-primary transition-colors"}`}
                      >
                        {ep.episode_number}. {ep.name}
                      </h4>
                      <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">
                        {ep.overview || "No description available."}
                      </p>
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