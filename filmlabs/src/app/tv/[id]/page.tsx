import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import TvButtons from "@/components/TvButtons";
import TvPlayer from "@/components/TvPlayer";

async function getTvDetails(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function TvPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedParams = await params;
  const tvId = resolvedParams.id;
  const tvShow = await getTvDetails(tvId);
  
  if (!tvShow) return <div className="p-8 text-center text-red-500">TV Show not found</div>;

  const userId = parseInt(session.user.id as string, 10);
  let favoriteRecord = null;
  let watchedEpisodes: any[] = [];

  if (!isNaN(userId)) {
    favoriteRecord = await prisma.accountFavorites.findUnique({
      where: { tmdbId_userId: { tmdbId: tvShow.id, userId } },
    });

    const history = await prisma.accountWatchHistory.findFirst({
      where: { tmdbId: tvShow.id, userId },
      include: { episodeHistory: true }
    });
    
    if (history) {
      watchedEpisodes = history.episodeHistory;
    }
  }

  // Figure out the next episode to watch for the button
  // For simplicity, we just grab the last aired episode from TMDB, 
  // but you can expand this to calculate based on their watchedEpisodes array!
  const nextEpisodeToWatch = tvShow.last_episode_to_air || tvShow.next_episode_to_air;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-10">
        
        {/* Left Column: Player & Episode Selector */}
        <div className="w-full md:w-2/3">
           <TvPlayer tvShow={tvShow} watchedEpisodes={watchedEpisodes} />
        </div>

        {/* Right Column: Show Details & Actions */}
        <div className="md:w-1/3 space-y-4 mt-6 md:mt-0">
          <h1 className="text-4xl font-bold">{tvShow.name}</h1>
          <p className="text-slate-400 text-lg">
            {tvShow.first_air_date?.split("-")[0]} • {tvShow.number_of_seasons} Seasons
          </p>
          
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded font-bold text-sm">
              TV Series
            </span>
            <span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm">
              ★ {tvShow.vote_average.toFixed(1)}
            </span>
          </div>

          <p className="text-base leading-relaxed mt-4 text-slate-300">{tvShow.overview}</p>

          <TvButtons tvShow={tvShow} isFavorited={!!favoriteRecord} nextEpisode={nextEpisodeToWatch} />
        </div>

      </div>
    </div>
  );
}