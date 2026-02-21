import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { 
  fetchTmdbCategory, 
  getUserFavorites, 
  getUserWatchHistory, 
  getTrendingFilms
} from "@/app/actions";
import MediaRow from "@/components/MediaRow";
import FeaturedHero from "@/components/FeaturedHero";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = parseInt(session.user.id as string, 10);

  // Fetch both Personal Data and TMDB Data in parallel!
  const [
    trending,
    personalFavorites,
    personalWatchHistory,
    recommendations,
    trendingMovies,
    trendingTv,
    actionMovies,
    sciFiTv
  ] = await Promise.all([
    getTrendingFilms(),
    getUserFavorites(userId),
    getUserWatchHistory(userId),
    fetchTmdbCategory("recommendations", 1),
    fetchTmdbCategory("trending-movies"),
    fetchTmdbCategory("trending-tv"),
    fetchTmdbCategory("action-movies"),
    fetchTmdbCategory("sci-fi-tv"),
  ]);

  const displayedIds = new Set([
    ...personalWatchHistory.map((item: any) => item.id)
  ]);

  const filterItems = (items: any[]) => 
    items.filter(item => !displayedIds.has(item.id)).slice(0, 15);

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* 1. Hero spans full width, outside the padding! */}
      <FeaturedHero films={filterItems(trending)} />

      {/* 2. Content is pulled up slightly over the hero for a seamless blend */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-12 -mt-20 md:-mt-32 relative z-20">
        <div className="space-y-10 pt-8">
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