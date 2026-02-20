import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MediaPlayer from "@/components/MediaPlayer";
import MediaButtons from "@/components/MediaButtons";
import CastRow from "@/components/CastRow";
import MediaRow from "@/components/MediaRow";

// Unified Fetcher: Grabs movie data OR tv data based on the URL parameter
async function getMediaDetails(type: string, id: string) {
  // Movies use release_dates for age ratings, TV uses content_ratings
  const ratingEndpoint = type === "movie" ? "release_dates" : "content_ratings";

  const res = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=credits,recommendations,${ratingEndpoint}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  // Security Check: If someone manually types /podcast/123, throw a 404!
  if (type !== "movie" && type !== "tv") return notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = parseInt(session.user.id, 10);

  const media = await getMediaDetails(type, id);
  if (!media) return notFound();

  // 1. Database Checks
  // 1. Database Checks
  const tmdbId = parseInt(id, 10);
  const favoriteRecord = await prisma.accountFavorites.findFirst({
    where: { userId, film: { tmdbId, mediaType: type } },
  });

  const watchedHistory = await prisma.accountWatchHistory.findMany({
    where: {
      userId,
      film: { tmdbId, mediaType: type },
    },
    // Include the related episode history rows right here
    include: {
      episodeHistory: true, // Note: Check your AccountWatchHistory model. This might be lowercase 'episodeHistory' depending on how you named the relation array.
    },
  });

  // Since findMany returns an array, let's safely grab the episodes from the matched show
  const showHistoryRecord = watchedHistory[0];
  const episodeHistoryData = showHistoryRecord?.episodeHistory || [];

  // 2. Normalize Display Data (so we don't write ternary operators in the HTML)
  const title = type === "movie" ? media.title : media.name;
  const releaseYear = (
    type === "movie" ? media.release_date : media.first_air_date
  )?.split("-")[0];
  const rating = media.vote_average.toFixed(1);

  // Extract US Age Rating safely
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

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4">
        {/* The Player */}
        <MediaPlayer
          media={media}
          mediaType={type}
          watchedHistory={watchedHistory}
          episodeHistory={episodeHistoryData}
        />

        <div className="flex flex-col gap-2 text-white">
          <h1 className="text-3xl font-bold">
            {type === "tv" ? media.name : media.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            {/* 1. Release Year */}
            <span>
              {type === "tv"
                ? media.first_air_date?.substring(0, 4)
                : media.release_date?.substring(0, 4)}
            </span>

            {/* 2. Age Rating Box (Change 'ageRating' if your prop is named differently) */}
            {certification && (
              <span className="border border-gray-500 text-gray-300 px-1.5 py-0.5 rounded text-xs font-semibold uppercase">
                {certification}
              </span>
            )}

            {/* 3. Star Rating */}
            {media.vote_average && (
              <span>⭐ {media.vote_average.toFixed(1)}/10</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <MediaButtons media={media} mediaType={type} isFavorited={!!favoriteRecord} />
          </div>

          <p className="mt-2 text-gray-300 leading-relaxed max-w-3xl">
            {media.overview || "No description available for this title."}
          </p>
        </div>
      </div>

      {/* Full-width Bottom Content */}
      <div className="max-w-6xl mx-auto mt-12 space-y-12">
        <CastRow cast={media.credits?.cast || []} />

        {media.recommendations?.results?.length > 0 && (
          <div className="pt-8 border-t border-slate-800">
            <MediaRow
              title={`Similar ${type === "movie" ? "Movies" : "Shows"}`}
              items={media.recommendations.results}
            />
          </div>
        )}
      </div>
    </div>
  );
}
