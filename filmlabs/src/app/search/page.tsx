import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

async function searchMovies(query: string) {
  if (!query) return [];
  
  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
  );
  
  if (!res.ok) {
    console.error("Failed to fetch search results");
    return [];
  }

  const data = await res.json();
  return data.results;
}

// In Next.js 15, searchParams is a Promise
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Await the searchParams to get the actual query string
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  
  const movies = await searchMovies(query);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Search Results for "{query}"
          </h1>
          <p className="text-slate-500 mt-1">Found {movies.length} movies</p>
        </header>

        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-500">We couldn't find any movies matching your search.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
              Return to Discover
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((media: any) => {
              if (!media.poster_path) return null; 
              // Exclude people results from multi-search
              if (media.media_type === "person") return null;

              // Determine if it's a TV show or Movie for the link and title
              const linkBase = media.media_type === "tv" ? "tv" : "movie";
              const title = media.title || media.name; // Movies have title, TV has name

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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <span className="text-blue-400 text-xs font-bold uppercase mb-1">
                          {media.media_type}
                        </span>
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