import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { 
  fetchTmdbCategory, 
  getUserFavorites, 
  getUserWatchHistory, 
  getPersonalRecommendations 
} from "@/app/actions";
import MediaRow from "@/components/MediaRow";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = parseInt(session.user.id as string, 10);

  // Fetch both Personal Data and TMDB Data in parallel!
  const [
    personalFavorites,
    personalWatchHistory,
    recommendations,
    trendingMovies,
    trendingTv,
    actionMovies,
    sciFiTv
  ] = await Promise.all([
    getUserFavorites(userId),
    getUserWatchHistory(userId),
    fetchTmdbCategory("recommendations", 1),
    fetchTmdbCategory("trending-movies"),
    fetchTmdbCategory("trending-tv"),
    fetchTmdbCategory("action-movies"),
    fetchTmdbCategory("sci-fi-tv"),
  ]);

  return (
    <div className="min-h-screen bg-slate-900 pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        <header className="pb-4 border-b border-slate-800">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Discover</h1>
          <p className="text-slate-400 mt-2 text-lg">What to watch next, {session.user?.name}.</p>
        </header>

        <div className="space-y-10">
          {/* Personalized User Rows */}
          <MediaRow title="Continue Watching" items={personalWatchHistory} linkHref="/category/history" />
          <MediaRow title="Your Favorites" items={personalFavorites} linkHref="/category/favorites" />
          <MediaRow title="Recommended For You" items={recommendations} linkHref="/category/recommendations" />
          
          {/* Generic TMDB Rows */}
          <MediaRow title="Trending Movies" items={trendingMovies} linkHref="/category/trending-movies" />
          <MediaRow title="Trending TV Shows" items={trendingTv} linkHref="/category/trending-tv" />
          <MediaRow title="Action Packed" items={actionMovies} linkHref="/category/action-movies" />
          <MediaRow title="Sci-Fi & Fantasy TV" items={sciFiTv} linkHref="/category/sci-fi-tv" />
        </div>

      </div>
    </div>
  );
}