import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MediaPlayer from "@/components/MediaPlayer";
import MediaButtons from "@/components/MediaButtons";
import CastRow from "@/components/CastRow";
import MediaRow from "@/components/MediaRow";
import Image from "next/image";
import { Star, CheckCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ type: string, id: string }> }) {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;

  try {
    // Fetch data from TMDB (using your existing environment variables)
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}`
    );
    
    const data = await res.json();

    // Movies use 'title', TV Shows use 'name'
    const name = data.title || data.name;

    if (!name) throw new Error("Name not found");

    return {
      title: name,
    };
  } catch (error) {
    // Fallback if the fetch fails or API key is missing
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return {
      title: `${typeLabel} Details`,
    };
  }
}

async function getMediaDetails(type: string, id: string) {
  const ratingEndpoint = type === "movie" ? "release_dates" : "content_ratings";
  const res = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=credits,recommendations,${ratingEndpoint}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: Promise<{ type: string, id: string }> }) {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;

  if (type !== "movie" && type !== "tv") return notFound();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  const media = await getMediaDetails(type, id);
  if (!media) return notFound();

  const tmdbId = parseInt(id, 10);
  
  // Conditionally fetch user-specific database records
  let favoriteRecord = null;
  let watchedHistory: any[] = [];

  if (userId) {
    favoriteRecord = await prisma.accountFavorites.findFirst({
      where: { userId, tmdbId, mediaType: type },
    });

    watchedHistory = await prisma.accountWatchHistory.findMany({
      where: { userId, tmdbId, mediaType: type },
      include: { episodeHistory: true },
    });
  }

  const showHistoryRecord = watchedHistory[0];
  const episodeHistoryData = showHistoryRecord?.episodeHistory || [];

  const title = type === "movie" ? media.title : media.name;
  const releaseYear = (
    type === "movie" ? media.release_date : media.first_air_date
  )?.split("-")[0];
  const rating = media.vote_average.toFixed(1);
  const isTv = type === "tv";
  const hasWatched = watchedHistory.length > 0;

  let certification = "NR";
  if (type === "movie") {
    const usRelease = media.release_dates?.results?.find(
      (r: any) => r.iso_3166_1 === "US",
    );
    certification =
      usRelease?.release_dates?.find((r: any) => r.certification)
        ?.certification || "NR";
  } else {
    const usRating = media.content_ratings?.results?.find(
      (r: any) => r.iso_3166_1 === "US",
    );
    certification = usRating?.rating || "NR";
  }

  const genres = media.genres?.map((g: any) => g.name).join(", ") || "";

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-20">
      {/* Background Hero Layer */}
      {media.backdrop_path && (
        <div className="absolute top-0 left-0 w-full h-[60vh] md:h-[75vh] z-0 overflow-hidden pointer-events-none">
          <Image
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
            alt="Backdrop"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      {/* Main Content Layer */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-6 md:pt-12">
        <MediaPlayer
          media={media}
          mediaType={type}
          watchedHistory={watchedHistory}
          episodeHistory={episodeHistoryData}
        >
          {/* Details Section */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-4 pb-12">
            {/* Poster */}
            <div className="hidden md:block shrink-0 w-[240px] lg:w-[300px]">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-border/50 bg-secondary/30">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info Container */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-6 max-w-4xl pt-4 md:pt-0">
              
              {/* Meta Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-bold tracking-wider">
                
                {hasWatched && (
                  <span className="bg-[#14151a]/80 backdrop-blur-md border border-primary/30 text-primary px-2 py-1 rounded-sm shadow-[0_0_15px_rgba(255,193,25,0.2)] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    WATCHED
                  </span>
                )}

                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-sm uppercase shadow-sm">
                  HD
                </span>
                <span className="bg-white/90 text-black px-2 py-1 rounded-sm shadow-sm">
                  {certification}
                </span>
                {media.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {rating}
                  </span>
                )}
                <span className="text-muted-foreground bg-secondary/50 px-2 py-1 rounded-sm uppercase tracking-widest">
                  {isTv ? "TV" : "MOV"}
                </span>
                {releaseYear && (
                  <span className="text-white/80 px-1">{releaseYear}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md leading-[1.1]">
                {title}
              </h1>

              {/* Action Buttons */}
              <MediaButtons
                media={media}
                mediaType={type}
                isFavorited={!!favoriteRecord}
                isLoggedIn={!!userId}
              />

              {/* Synopsis & Stats */}
              <div className="space-y-4 pt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                <p className="max-w-3xl drop-shadow-sm">
                  {media.overview || "No description available for this title."}
                </p>
                <div className="flex flex-col sm:flex-row sm:gap-12 pt-4 border-t border-border/50">
                  <div>
                    <span className="font-bold text-white mr-2">Genre:</span>{" "}
                    {genres || "Unknown"}
                  </div>
                  {media.status && (
                    <div>
                      <span className="font-bold text-white mr-2">Status:</span>{" "}
                      {media.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </MediaPlayer>

        {/* Cast & Recommendations */}
        <div className="mt-10 space-y-12">
          <CastRow cast={media.credits?.cast || []} />
          {media.recommendations?.results?.length > 0 && (
            <div className="pt-8 border-t border-border/50">
              <MediaRow
                title={`Similar ${isTv ? "Shows" : "Movies"}`}
                items={media.recommendations.results}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}