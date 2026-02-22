import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  fetchTmdbCategory, 
  getUserFavorites, 
  getUserWatchHistory, 
  getTrendingFilms
} from "@/app/actions";
import MediaRow from "@/components/MediaRow";
import FeaturedHero from "@/components/FeaturedHero";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Set userId to null if the user is not signed in
  const userId = session?.user?.id ? parseInt(session.user.id as string, 10) : null;

  // Fetch TMDB Data, and conditionally fetch Personal Data if userId exists
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
    userId ? getUserFavorites(userId) : Promise.resolve([]),
    userId ? getUserWatchHistory(userId) : Promise.resolve([]),
    fetchTmdbCategory("recommendations", 1),
    fetchTmdbCategory("trending-movies"),
    fetchTmdbCategory("trending-tv"),
    fetchTmdbCategory("action-movies"),
    fetchTmdbCategory("sci-fi-tv"),
  ]);

  const displayedIds = new Set([
    ...(personalWatchHistory?.map((item: any) => item.id) || [])
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
          {/* Personalized User Rows (Only show if logged in) */}
          {userId && personalWatchHistory.length > 0 && (
            <MediaRow title="Continue Watching" items={personalWatchHistory} linkHref="/category/history" />
          )}
          {userId && personalFavorites.length > 0 && (
            <MediaRow title="Your Favorites" items={personalFavorites} linkHref="/category/favorites" />
          )}
          
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