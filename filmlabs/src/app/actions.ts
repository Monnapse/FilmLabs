"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

// Helper function to ensure the film exists in the database
async function ensureFilmExists(movieData: any) {
  await prisma.film.upsert({
    where: { tmdbId: movieData.id },
    update: {}, // Do nothing if it already exists
    create: {
      tmdbId: movieData.id,
      mediaType: "movie",
      name: movieData.title,
      releaseDate: movieData.release_date || "Unknown",
      rating: movieData.vote_average || 0,
      poster: movieData.poster_path || "",
    },
  });
}

export async function toggleFavorite(movieData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = parseInt(session.user.id);

  await ensureFilmExists(movieData);

  // Check if it's already a favorite
  const existingFavorite = await prisma.accountFavorites.findUnique({
    where: {
      tmdbId_userId: { tmdbId: movieData.id, userId },
    },
  });

  if (existingFavorite) {
    await prisma.accountFavorites.delete({
      where: { tmdbId_userId: { tmdbId: movieData.id, userId } },
    });
  } else {
    await prisma.accountFavorites.create({
      data: { tmdbId: movieData.id, userId },
    });
  }

  revalidatePath(`/movie/${movieData.id}`); // Refresh the page UI automatically
}

export async function addToWatchHistory(movieData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = parseInt(session.user.id);

  await ensureFilmExists(movieData);

  // 1. Check if this movie is already in the user's watch history
  const existingRecord = await prisma.accountWatchHistory.findFirst({
    where: {
      tmdbId: movieData.id,
      userId: userId,
    },
  });

  // 2. Only create a new record if one doesn't already exist
  if (!existingRecord) {
    await prisma.accountWatchHistory.create({
      data: {
        tmdbId: movieData.id,
        userId: userId,
      },
    });
  }

  revalidatePath('/', 'layout');
}

// Ensure a TV Show exists in the database
async function ensureTvExists(tvData: any) {
  await prisma.film.upsert({
    where: { tmdbId: tvData.id },
    update: {}, 
    create: {
      tmdbId: tvData.id,
      mediaType: "tv",
      name: tvData.name, // TMDB uses 'name' for TV shows instead of 'title'
      releaseDate: tvData.first_air_date || "Unknown",
      rating: tvData.vote_average || 0,
      poster: tvData.poster_path || "",
    },
  });
}

// Mark a specific episode as watched
export async function markEpisodeWatched(tvData: any, seasonNumber: number, episodeNumber: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = parseInt(session.user.id, 10);

  await ensureTvExists(tvData);

  // 1. Get or create the overarching Watch History record for this TV Show
  let watchHistory = await prisma.accountWatchHistory.findFirst({
    where: { tmdbId: tvData.id, userId: userId },
  });

  if (!watchHistory) {
    watchHistory = await prisma.accountWatchHistory.create({
      data: { tmdbId: tvData.id, userId: userId },
    });
  }

  // 2. Add or update the specific episode in the EpisodeHistory table
  await prisma.episodeHistory.upsert({
    where: {
      accountHistoryId_seasonNumber_episodeNumber: {
        accountHistoryId: watchHistory.accountHistoryId,
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber,
      }
    },
    update: { progress: "watched" }, // If they click it again, ensure it's marked watched
    create: {
      accountHistoryId: watchHistory.accountHistoryId,
      seasonNumber: seasonNumber,
      episodeNumber: episodeNumber,
      progress: "watched",
    },
  });

  revalidatePath('/', 'layout');
}

export async function fetchTmdbCategory(category: string, page: number = 1): Promise<any[]> {
  // 1. Intercept personal categories and handle them with the database
  if (["favorites", "history", "recommendations"].includes(category)) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    
    const userId = parseInt(session.user.id, 10);
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    if (category === "favorites") {
      const favs = await prisma.accountFavorites.findMany({
        where: { userId },
        include: { film: true },
        orderBy: { tmdbId: 'desc' },
        skip: skip,
        take: pageSize
      });
      return favs.map(f => mapFilmToTmdb(f.film))
    }

    if (category === "history") {
      const history = await prisma.accountWatchHistory.findMany({
        where: { userId },
        include: { film: true },
        orderBy: { accountHistoryId: 'desc' }
      });
      // Filter out duplicates so a user doesn't see a show 5 times
      const uniqueHistory = history.filter((item, index, self) =>
        index === self.findIndex((t) => t.tmdbId === item.tmdbId)
      );
      // Manually paginate the filtered results
      return uniqueHistory.slice(skip, skip + pageSize).map(h => mapFilmToTmdb(h.film));
    }

    if (category === "recommendations") {
      // 1. Get their recent favorites
      const favs = await prisma.accountFavorites.findMany({ 
        where: { userId }, 
        include: { film: true },
        orderBy: { tmdbId: 'desc' },
        take: 20 // Grab enough to hopefully find both a movie and a TV show
      });
      
      if (favs.length === 0) return fetchTmdbCategory("trending-movies", page);

      // 2. Find the most recent Movie AND the most recent TV Show
      const recentMovie = favs.find(f => f.film.mediaType === "movie")?.film;
      const recentTv = favs.find(f => f.film.mediaType === "tv")?.film;

      const apiKey = process.env.TMDB_API_KEY;
      let movieRecs: any[] = [];
      let tvRecs: any[] = [];

      // 3. Fetch Movie Recommendations
      if (recentMovie) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${recentMovie.tmdbId}/recommendations?api_key=${apiKey}&language=en-US&page=${page}`);
        if (res.ok) {
          const data = await res.json();
          // Explicitly tag them as movies
          movieRecs = data.results.map((m: any) => ({ ...m, media_type: "movie" })); 
        }
      }

      // 4. Fetch TV Recommendations
      if (recentTv) {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${recentTv.tmdbId}/recommendations?api_key=${apiKey}&language=en-US&page=${page}`);
        if (res.ok) {
          const data = await res.json();
          // Explicitly tag them as TV shows
          tvRecs = data.results.map((t: any) => ({ ...t, media_type: "tv" }));
        }
      }

      // 5. Interleave them together (Movie, TV, Movie, TV...)
      const combined = [];
      const maxLength = Math.max(movieRecs.length, tvRecs.length);
      for (let i = 0; i < maxLength; i++) {
        if (tvRecs[i]) combined.push(tvRecs[i]);
        if (movieRecs[i]) combined.push(movieRecs[i]);
      }

      if (combined.length > 0) return combined;

      // Fallback: If TMDB had zero recommendations for their specific items, return general trending
      const fallbackRes = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US&page=${page}`);
      const fallbackData = await fallbackRes.json();
      return fallbackData.results;
    }
  }

  // 2. Standard TMDB API Categories (if it's not a personal category)
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB API Key missing");

  let endpoint = "";
  switch (category) {
    case "trending-movies": endpoint = "/trending/movie/week"; break;
    case "trending-tv": endpoint = "/trending/tv/week"; break;
    case "top-rated-movies": endpoint = "/movie/top_rated"; break;
    case "action-movies": endpoint = "/discover/movie?with_genres=28"; break;
    case "sci-fi-tv": endpoint = "/discover/tv?with_genres=10765"; break;
    default: endpoint = "/movie/popular";
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `https://api.themoviedb.org/3${endpoint}${separator}api_key=${apiKey}&language=en-US&page=${page}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  
  const data = await res.json();
  return data.results;
}

// Helper to map Prisma Database fields to TMDB API fields
const mapFilmToTmdb = (film: any) => ({
  id: film.tmdbId,
  poster_path: film.poster,
  title: film.mediaType === "movie" ? film.name : undefined,
  name: film.mediaType === "tv" ? film.name : undefined,
  media_type: film.mediaType,
});

export async function getUserFavorites(userId: number) {
  const favs = await prisma.accountFavorites.findMany({
    where: { userId },
    include: { film: true },
    orderBy: { tmdbId: 'desc' }, // Get newest first
    take: 15 // Limit to 15 for the scrolling row
  });
  return favs.map(f => mapFilmToTmdb(f.film));
}

export async function getUserWatchHistory(userId: number) {
  const history = await prisma.accountWatchHistory.findMany({
    where: { userId },
    include: { film: true },
    orderBy: { accountHistoryId: 'desc' },
    take: 25 // Fetch a bit more so we can filter duplicates
  });
  
  // Filter duplicates
  const uniqueHistory = history.filter((item, index, self) =>
    index === self.findIndex((t) => t.tmdbId === item.tmdbId)
  );
  
  return uniqueHistory.slice(0, 15).map(h => mapFilmToTmdb(h.film));
}

// Fetch episodes for a specific TV Season
export async function getSeasonDetails(tvId: number, seasonNumber: number) {
  const apiKey = process.env.TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}&language=en-US`);
  if (!res.ok) return null;
  return res.json();
}