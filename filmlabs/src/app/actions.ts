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
const GENRE_MAP: Record<string, number[]> = {
  Action: [28, 10759], Adventure: [12, 10759], Animation: [16],
  Comedy: [35], Crime: [80], Documentary: [99], Drama: [18],
  Family: [10751], Fantasy: [14, 10765], History: [36],
  Horror: [27], Music: [10402], Mystery: [9648], Romance: [10749],
  SciFi: [878, 10765], Thriller: [53], War: [10752], Western: [37]
};

const RATING_EQUIVALENTS: Record<string, string[]> = {
  'G': ['G', 'TV-Y', 'TV-G'],
  'PG': ['PG', 'TV-Y7', 'TV-PG'],
  'PG-13': ['PG-13', 'TV-14'],
  'R': ['R', 'TV-MA'],
  'NC-17': ['NC-17', 'TV-MA'],
  'TV-Y': ['TV-Y', 'G'],
  'TV-Y7': ['TV-Y7', 'PG'],
  'TV-G': ['TV-G', 'G'],
  'TV-PG': ['TV-PG', 'PG'],
  'TV-14': ['TV-14', 'PG-13'],
  'TV-MA': ['TV-MA', 'R', 'NC-17']
};

function getGenreIds(selectedGenres: string[]): number[] {
  const ids = new Set<number>();
  selectedGenres.forEach(g => {
    if (GENRE_MAP[g]) GENRE_MAP[g].forEach(id => ids.add(id));
  });
  return Array.from(ids);
}

export async function searchMediaAction(params: {
  query: string; type: string; year: string; 
  genres: string; status: string; rating: string; 
  score: string; sort: string; page: number;
}) {
  const { query, type, year, genres, status, rating, score, sort, page } = params;
  const minScore = parseFloat(score || "0");
  const selectedGenresList = genres ? genres.split(',').filter(Boolean) : [];
  const genreIds = getGenreIds(selectedGenresList);
  const genreQueryParam = genreIds.join('|'); 
  
  const sortMap: Record<string, string> = {
    popularity: 'popularity.desc',
    rating: 'vote_average.desc',
    newest: 'primary_release_date.desc',
    oldest: 'primary_release_date.asc'
  };

  let urls: { url: string; media_type: string | null }[] = [];

  const allowedRatings = RATING_EQUIVALENTS[rating] || [rating];
  
  // FIX: Join with pipe '|' to tell TMDB "OR" (e.g., "TV-Y|TV-G")
  const movieRating = rating !== 'all' ? allowedRatings.filter(r => !r.startsWith('TV-')).join('|') : 'all';
  const tvRating = rating !== 'all' ? allowedRatings.filter(r => r.startsWith('TV-')).join('|') : 'all';

  if (!query.trim()) {
    // DISCOVER MODE
    if (type === 'movie' || type === 'multi') {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${page}`;
      if (rating !== 'all') url += `&certification_country=US&certification=${movieRating}`;
      if (year) url += `&primary_release_year=${year}`;
      if (genreQueryParam) url += `&with_genres=${genreQueryParam}`;
      if (minScore > 0) url += `&vote_average.gte=${minScore}&vote_count.gte=10`;
      url += `&sort_by=${sortMap[sort] || 'popularity.desc'}`;
      urls.push({ url, media_type: 'movie' });
    }

    if (type === 'tv' || type === 'multi') {
      let url = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${page}`;
      if (rating !== 'all') url += `&watch_region=US&with_content_rating=${tvRating}`;
      if (year) url += `&first_air_date_year=${year}`;
      if (genreQueryParam) url += `&with_genres=${genreQueryParam}`;
      if (minScore > 0) url += `&vote_average.gte=${minScore}&vote_count.gte=10`;
      
      let tvSort = sortMap[sort] || 'popularity.desc';
      if (tvSort.includes('primary_release_date')) tvSort = tvSort.replace('primary_release_date', 'first_air_date');
      url += `&sort_by=${tvSort}`;
      urls.push({ url, media_type: 'tv' });
    }
  } else {
    // SEARCH MODE
    let endpoint = type === "movie" ? "search/movie" : type === "tv" ? "search/tv" : "search/multi";
    let url = `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&language=en-US&page=${page}`;
    if (year) {
      if (type === "movie") url += `&primary_release_year=${year}`;
      if (type === "tv") url += `&first_air_date_year=${year}`;
    }
    urls.push({ url, media_type: type === 'multi' ? null : type });
  }

  let results: any[] = [];
  for (const item of urls) {
    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const data = await res.json();
        let fetchedResults = data.results || [];
        if (item.media_type) fetchedResults = fetchedResults.map((r: any) => ({ ...r, media_type: item.media_type }));
        results = [...results, ...fetchedResults];
      }
    } catch (e) {
      console.error("Fetch failed", item.url, e);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  results = results.filter((item: any) => {
    if (item.media_type === "person") return false;
    if (minScore > 0 && (item.vote_average || 0) < minScore) return false;
    
    if (query.trim() && genreIds.length > 0) {
      const itemGenres = item.genre_ids || [];
      const hasGenre = itemGenres.some((id: number) => genreIds.includes(id));
      if (!hasGenre) return false;
    }

    if (status !== 'all') {
      const date = item.release_date || item.first_air_date || "";
      if (!date) return false;
      if (status === 'released' && date > today) return false;
      if (status === 'upcoming' && date <= today) return false;
    }

    if (query.trim() && type === 'multi' && year) {
      const date = item.release_date || item.first_air_date || "";
      if (!date.startsWith(year)) return false;
    }

    return true;
  });

  // FIX: Removed the `query.trim()` restriction so this local rigorous check evaluates everything.
  // This physically blocks any TV show (like The Simpsons) that leaked through TMDB's sloppy TV discover endpoints
  if (rating !== 'all' && results.length > 0) {
    const detailedResults = await Promise.all(results.map(async (item) => {
      try {
        if (item.media_type === 'movie' || (!item.media_type && item.title)) {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${item.id}/release_dates?api_key=${process.env.TMDB_API_KEY}`);
          const data = await res.json();
          const usRelease = data.results?.find((r: any) => r.iso_3166_1 === 'US');
          const validCert = usRelease?.release_dates?.find((r: any) => r.certification !== '')?.certification;
          return { ...item, certification: validCert || '' };
        } else if (item.media_type === 'tv' || (!item.media_type && item.name)) {
          const res = await fetch(`https://api.themoviedb.org/3/tv/${item.id}/content_ratings?api_key=${process.env.TMDB_API_KEY}`);
          const data = await res.json();
          const usRating = data.results?.find((r: any) => r.iso_3166_1 === 'US');
          return { ...item, certification: usRating?.rating || '' };
        }
      } catch (e) {
        return { ...item, certification: '' };
      }
      return { ...item, certification: '' };
    }));
    
    // Strict comparison guarantees only exact matches make it to the front-end
    results = detailedResults.filter(item => allowedRatings.includes(item.certification));
  }

  if (sort === 'rating') results.sort((a,b) => (b.vote_average||0) - (a.vote_average||0));
  else if (sort === 'newest') results.sort((a,b) => new Date(b.release_date || b.first_air_date || 0).getTime() - new Date(a.release_date || a.first_air_date || 0).getTime());
  else if (sort === 'oldest') results.sort((a,b) => new Date(a.release_date || a.first_air_date || 0).getTime() - new Date(b.release_date || b.first_air_date || 0).getTime());
  else if (sort === 'popularity') results.sort((a,b) => (b.popularity||0) - (a.popularity||0));
  
  const uniqueIds = new Set();
  results = results.filter(item => {
    if (uniqueIds.has(item.id)) return false;
    uniqueIds.add(item.id);
    return true;
  });

  return results;
}

// Add this at the bottom of filmlabs/src/app/actions.ts

export async function getMediaRating(id: number, type: "movie" | "tv"): Promise<string> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return "";

  try {
    if (type === "movie") {
      // Fetch Movie Release Dates & Certifications
      // Cache for 604800 seconds (7 days) to save API calls
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=${apiKey}`, { next: { revalidate: 604800 } });
      if (!res.ok) return "";
      const data = await res.json();
      
      const usRelease = data.results?.find((r: any) => r.iso_3166_1 === 'US');
      const validCert = usRelease?.release_dates?.find((r: any) => r.certification !== '')?.certification;
      return validCert || "";
      
    } else {
      // Fetch TV Content Ratings
      const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/content_ratings?api_key=${apiKey}`, { next: { revalidate: 604800 } });
      if (!res.ok) return "";
      const data = await res.json();
      
      const usRating = data.results?.find((r: any) => r.iso_3166_1 === 'US');
      return usRating?.rating || "";
    }
  } catch (error) {
    console.error("Failed to fetch rating for", id, error);
    return "";
  }
}

// 1. Define your secure server-side fetch functions
export async function getTrendingFilms() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return "";

  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results;
}