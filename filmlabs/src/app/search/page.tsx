import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const GENRE_MAP: Record<string, number[]> = {
  Action: [28, 10759], Adventure: [12, 10759], Animation: [16],
  Comedy: [35], Crime: [80], Documentary: [99], Drama: [18],
  Family: [10751], Fantasy: [14, 10765], History: [36],
  Horror: [27], Music: [10402], Mystery: [9648], Romance: [10749],
  SciFi: [878, 10765], Thriller: [53], War: [10752], Western: [37]
};

function getGenreIds(selectedGenres: string[]): number[] {
  const ids = new Set<number>();
  selectedGenres.forEach(g => {
    if (GENRE_MAP[g]) GENRE_MAP[g].forEach(id => ids.add(id));
  });
  return Array.from(ids);
}

async function searchMedia(params: {
  query: string; type: string; year: string; 
  genres: string; status: string; rating: string; 
  score: string; sort: string;
}) {
  const { query, type, year, genres, status, rating, score, sort } = params;
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

  if (!query.trim()) {
    // DISCOVER MODE
    if (type === 'movie' || type === 'multi') {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`;
      
      // FIX: Age rating requires certification_country
      if (rating !== 'all') {
        url += `&certification_country=US&certification=${rating}`;
      }
      
      if (year) url += `&primary_release_year=${year}`;
      if (genreQueryParam) url += `&with_genres=${genreQueryParam}`;
      if (minScore > 0) url += `&vote_average.gte=${minScore}&vote_count.gte=10`;
      url += `&sort_by=${sortMap[sort] || 'popularity.desc'}`;
      urls.push({ url, media_type: 'movie' });
    }

    if (type === 'tv' || type === 'multi') {
      let url = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`;
      
      // FIX: TV age ratings also require certification_country
      if (rating !== 'all') {
        url += `&certification_country=US&certification=${rating}`;
      }

      if (year) url += `&first_air_date_year=${year}`;
      if (genreQueryParam) url += `&with_genres=${genreQueryParam}`;
      if (minScore > 0) url += `&vote_average.gte=${minScore}&vote_count.gte=10`;
      
      let tvSort = sortMap[sort] || 'popularity.desc';
      if (tvSort.includes('primary_release_date')) tvSort = tvSort.replace('primary_release_date', 'first_air_date');
      url += `&sort_by=${tvSort}`;
      urls.push({ url, media_type: 'tv' });
    }
  } else {
    // SEARCH MODE (Text search does not natively support age filters)
    // Results are filtered locally in the post-fetch section below
    let endpoint = type === "movie" ? "search/movie" : type === "tv" ? "search/tv" : "search/multi";
    let url = `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&language=en-US&page=1`;
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

  // -----------------------------------------------------------------
  // Post-Fetch Filtering (Acts as a fallback for Text Searches which lack TMDB filter parameters)
  // -----------------------------------------------------------------
  const today = new Date().toISOString().split('T')[0];

  results = results.filter((item: any) => {
    if (item.media_type === "person") return false;

    // Filter by score
    if (minScore > 0 && (item.vote_average || 0) < minScore) return false;

    // Filter by Genre
    if (query.trim() && genreIds.length > 0) {
      const itemGenres = item.genre_ids || [];
      const hasGenre = itemGenres.some((id: number) => genreIds.includes(id));
      if (!hasGenre) return false;
    }

    // Filter by Status (Released vs Upcoming based on date)
    if (status !== 'all') {
      const date = item.release_date || item.first_air_date || "";
      if (!date) return false;
      if (status === 'released' && date > today) return false;
      if (status === 'upcoming' && date <= today) return false;
    }

    // Multi-Search Year fallback filter
    if (query.trim() && type === 'multi' && year) {
      const date = item.release_date || item.first_air_date || "";
      if (!date.startsWith(year)) return false;
    }

    return true;
  });

  // -----------------------------------------------------------------
  // Custom Sorting Logic (Necessary when merging multi-searches)
  // -----------------------------------------------------------------
  if (sort === 'rating') results.sort((a,b) => (b.vote_average||0) - (a.vote_average||0));
  else if (sort === 'newest') results.sort((a,b) => new Date(b.release_date || b.first_air_date || 0).getTime() - new Date(a.release_date || a.first_air_date || 0).getTime());
  else if (sort === 'oldest') results.sort((a,b) => new Date(a.release_date || a.first_air_date || 0).getTime() - new Date(b.release_date || b.first_air_date || 0).getTime());
  else if (sort === 'popularity') results.sort((a,b) => (b.popularity||0) - (a.popularity||0));
  
  // Clean duplicates natively
  const uniqueIds = new Set();
  results = results.filter(item => {
    if (uniqueIds.has(item.id)) return false;
    uniqueIds.add(item.id);
    return true;
  });

  return results;
}

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const type = resolvedParams.type || "multi";
  const year = resolvedParams.year || "";
  const genres = resolvedParams.genres || "";
  const status = resolvedParams.status || "all";
  const rating = resolvedParams.rating || "all";
  const score = resolvedParams.score || "0";
  const sort = resolvedParams.sort || "popularity";
  
  const mediaItems = await searchMedia({ query, type, year, genres, status, rating, score, sort });
  const isBrowsing = !query.trim();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            {isBrowsing ? "Browsing Catalog" : `Search Results for "${query}"`}
          </h1>
          <p className="text-slate-500 mt-1">
            Found {mediaItems.length} matching results
          </p>
        </header>

        {mediaItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-500">We couldn't find any results matching your search and filters.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block font-medium">
              Return to Discover
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {mediaItems.map((media: any) => {
              if (!media.poster_path) return null; 

              const linkBase = media.media_type === "tv" ? "tv" : "movie";
              const title = media.title || media.name; 
              const date = media.release_date || media.first_air_date;
              const yearLabel = date ? date.split('-')[0] : "";

              return (
                <Link href={`/${linkBase}/${media.id}`} key={media.id}>
                  <Card className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-0 relative aspect-[2/3]">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-blue-400 text-xs font-bold uppercase">
                            {media.media_type} {yearLabel && `• ${yearLabel}`}
                            </span>
                            {media.vote_average > 0 && (
                                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    {(media.vote_average).toFixed(1)}
                                </div>
                            )}
                        </div>
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {title}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}