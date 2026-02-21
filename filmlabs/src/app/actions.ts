"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const fetchTmdbDetails = async (tmdbId: number, mediaType: string) => {
  const apiKey = process.env.TMDB_API_KEY;
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { 
      ...data, 
      media_type: mediaType,
      vote_average: data.vote_average || 0 // Ensures the score is always passed to the MediaCard
    };
  } catch (error) {
    return null;
  }
};

export async function toggleFavorite(mediaData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = parseInt(session.user.id);

  const isTv = mediaData.name !== undefined || mediaData.mediaType === "tv";
  const mediaType = isTv ? "tv" : "movie";

  const existingFavorite = await prisma.accountFavorites.findFirst({
    where: { tmdbId: mediaData.id, mediaType, userId },
  });

  if (existingFavorite) {
    await prisma.accountFavorites.deleteMany({
      where: { tmdbId: mediaData.id, mediaType, userId },
    });
  } else {
    await prisma.accountFavorites.create({
      data: { tmdbId: mediaData.id, mediaType, userId },
    });
  }

  revalidatePath(`/${mediaType}/${mediaData.id}`);
  revalidatePath('/dashboard');
}

export async function addToWatchHistory(mediaData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = parseInt(session.user.id);

  const isTv = mediaData.name !== undefined || mediaData.mediaType === "tv";
  const mediaType = isTv ? "tv" : "movie";

  const existingRecord = await prisma.accountWatchHistory.findFirst({
    where: { tmdbId: mediaData.id, mediaType, userId },
  });

  if (!existingRecord) {
    await prisma.accountWatchHistory.create({
      data: { tmdbId: mediaData.id, mediaType, userId },
    });
  }

  revalidatePath('/', 'layout');
}

export async function markEpisodeWatched(tvData: any, seasonNumber: number, episodeNumber: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = parseInt(session.user.id, 10);

  let watchHistory = await prisma.accountWatchHistory.findFirst({
    where: { tmdbId: tvData.id, mediaType: "tv", userId },
  });

  if (!watchHistory) {
    watchHistory = await prisma.accountWatchHistory.create({
      data: { tmdbId: tvData.id, mediaType: "tv", userId },
    });
  }

  await prisma.episodeHistory.upsert({
    where: {
      accountHistoryId_seasonNumber_episodeNumber: {
        accountHistoryId: watchHistory.accountHistoryId,
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber,
      }
    },
    update: { progress: "watched" }, 
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
        orderBy: { tmdbId: 'desc' },
        skip: skip,
        take: pageSize
      });
      // Use the helper to fetch fresh details from TMDB
      const results = await Promise.all(favs.map(f => fetchTmdbDetails(f.tmdbId, f.mediaType)));
      return results.filter(Boolean);
    }

    if (category === "history") {
      const history = await prisma.accountWatchHistory.findMany({
        where: { userId },
        orderBy: { accountHistoryId: 'desc' }
      });
      // Filter out duplicates (checking both ID and MediaType)
      const uniqueHistory = history.filter((item, index, self) =>
        index === self.findIndex((t) => t.tmdbId === item.tmdbId && t.mediaType === item.mediaType)
      );
      
      const paginatedHistory = uniqueHistory.slice(skip, skip + pageSize);
      const results = await Promise.all(paginatedHistory.map(h => fetchTmdbDetails(h.tmdbId, h.mediaType)));
      return results.filter(Boolean);
    }

    if (category === "recommendations") {
      // 1. Fetch BOTH recent Favorites and Watch History
      const [favs, history] = await Promise.all([
        prisma.accountFavorites.findMany({ where: { userId }, orderBy: { tmdbId: 'desc' }, take: 15 }),
        prisma.accountWatchHistory.findMany({ where: { userId }, orderBy: { accountHistoryId: 'desc' }, take: 25 })
      ]);

      // 2. Build a Set of IDs the user has ALREADY SEEN so we don't recommend them again!
      const seenIds = new Set([
        ...favs.map(f => f.tmdbId),
        ...history.map(h => h.tmdbId)
      ]);

      // 3. Combine and deduplicate base items to generate recommendations FROM
      const baseItemsMap = new Map();
      [...favs, ...history].forEach(item => {
        if (!baseItemsMap.has(item.tmdbId)) {
          baseItemsMap.set(item.tmdbId, item);
        }
      });
      const baseItems = Array.from(baseItemsMap.values());

      if (baseItems.length === 0) return fetchTmdbCategory("trending-movies", page);

      // 4. Separate into movies and TV, grab up to 3 most recent of each to heavily diversify the pool
      const recentMovies = baseItems.filter(i => i.mediaType === "movie").slice(0, 3);
      const recentTv = baseItems.filter(i => i.mediaType === "tv").slice(0, 3);

      const apiKey = process.env.TMDB_API_KEY;

      // 5. Helper function to fetch recommendations for a specific item
      const fetchRecs = async (item: any) => {
        try {
          // We fetch page 1 for each item (gives ~20 recs per item)
          const res = await fetch(`https://api.themoviedb.org/3/${item.mediaType}/${item.tmdbId}/recommendations?api_key=${apiKey}&language=en-US&page=1`);
          if (!res.ok) return [];
          const data = await res.json();
          // Explicitly tag them so the frontend knows how to route them
          return data.results.map((r: any) => ({ ...r, media_type: item.mediaType }));
        } catch {
          return [];
        }
      };

      // 6. Fetch ALL recommendations in parallel (blazing fast)
      const recPromises = [...recentMovies, ...recentTv].map(fetchRecs);
      const recResults = await Promise.all(recPromises);
      
      // Flatten the array of arrays into one massive pool of recommendations
      const allRecs = recResults.flat();

      // 7. Filter out duplicates AND items the user has already seen
      const uniqueRecsMap = new Map();
      allRecs.forEach(rec => {
        if (!seenIds.has(rec.id) && !uniqueRecsMap.has(rec.id)) {
          uniqueRecsMap.set(rec.id, rec);
        }
      });

      const finalRecs = Array.from(uniqueRecsMap.values());

      // 8. Sort by popularity to ensure high-quality recommendations bubble to the top
      finalRecs.sort((a, b) => b.popularity - a.popularity);

      // 9. Manually paginate the aggregated pool
      const paginatedRecs = finalRecs.slice(skip, skip + pageSize);

      if (paginatedRecs.length > 0) return paginatedRecs;

      // Fallback if TMDB somehow returns 0 recommendations for all their items
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

export async function getUserFavorites(userId: number) {
  const favs = await prisma.accountFavorites.findMany({
    where: { userId },
    orderBy: { tmdbId: 'desc' },
    take: 15
  });
  
  // Fetch fresh, full details directly from TMDB
  const results = await Promise.all(favs.map(f => fetchTmdbDetails(f.tmdbId, f.mediaType)));
  return results.filter(Boolean); 
}

export async function getUserWatchHistory(userId: number) {
  const history = await prisma.accountWatchHistory.findMany({
    where: { userId },
    orderBy: { accountHistoryId: 'desc' },
    take: 25 
  });
  
  // Filter out duplicates (checking both ID and MediaType)
  const uniqueHistory = history.filter((item, index, self) =>
    index === self.findIndex((t) => t.tmdbId === item.tmdbId && t.mediaType === item.mediaType)
  );
  
  // Fetch fresh details and AUTOMATICALLY inject the "watched: true" flag!
  const results = await Promise.all(uniqueHistory.slice(0, 15).map(async (h) => {
    const details = await fetchTmdbDetails(h.tmdbId, h.mediaType);
    if (!details) return null;
    return { ...details, watched: true }; 
  }));
  
  return results.filter(Boolean);
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

// src/app/actions.ts

export async function redirectToRandomMedia() {
  const apiKey = process.env.TMDB_API_KEY;
  const types = ["movie", "tv"];
  const selectedType = types[Math.floor(Math.random() * types.length)];
  
  let targetUrl = "";

  try {
    // We restrict the pool to the first 50 pages of high-quality content 
    // (50 pages * 20 items = 1000 top-tier random choices per type)
    const randomPage = Math.floor(Math.random() * 70) + 1; 
    
    // STRICT QUALITY FILTERS:
    // 1. vote_count.gte=300 (Must have at least 300 reviews - ensures it's a real, known production)
    // 2. vote_average.gte=6.0 (Must be at least a 6/10 rating)
    // 3. with_original_language=en (Prioritizes English releases)
    // 4. cache: 'no-store' (Forces Next.js to never cache the randomizer)
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/${selectedType}?api_key=${apiKey}&include_adult=false&vote_count.gte=300&vote_average.gte=6.0&with_original_language=en&language=en-US&page=${randomPage}`,
      { cache: 'no-store' }
    );
    
    if (res.ok) {
      const data = await res.json();
      
      // Filter out any results that are missing a poster OR a backdrop image
      // This guarantees your cinematic Hero and MediaCards never look broken
      const validResults = (data.results || []).filter(
        (item: any) => item.poster_path && item.backdrop_path && item.overview
      );
      
      if (validResults.length > 0) {
        const randomItem = validResults[Math.floor(Math.random() * validResults.length)];
        targetUrl = `/${selectedType}/${randomItem.id}`;
      }
    }

    // Fallback if the discover call fails or returns an empty page
    if (!targetUrl) {
      targetUrl = "/dashboard";
    }

  } catch (error) {
    console.error("Random search failed:", error);
    targetUrl = "/dashboard";
  }

  // Redirect the user to their high-quality random pick
  return redirect(targetUrl);
}