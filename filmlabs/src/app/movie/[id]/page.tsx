import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import MovieButtons from "@/components/MovieButtons";
import { authOptions } from "@/lib/auth";
import MoviePlayer from "@/components/MoviePlayer";

async function getMovieDetails(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
  );
  
  if (!res.ok) {
    console.error(`TMDB API Error for ID ${id}: Status ${res.status}`);
    return null;
  }
  
  return res.json();
}

// 1. Update the params type to be a Promise
export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 2. Await the params before using them (Next.js 15 requirement)
  const resolvedParams = await params;
  const movieId = resolvedParams.id;

  // 3. Pass the resolved ID to our fetch function
  const movie = await getMovieDetails(movieId);
  
  if (!movie) return <div className="p-8 text-center text-red-500">Movie not found</div>;

  // Safely parse the ID, fallback to 0 if it fails
  const userId = parseInt(session.user?.id as string, 10);
  
  let favoriteRecord = null;
  
  // Only ask Prisma for favorites if we have a valid, numerical user ID
  if (!isNaN(userId)) {
    favoriteRecord = await prisma.accountFavorites.findUnique({
      where: {
        tmdbId_userId: { tmdbId: movie.id, userId },
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-10">
        {/* NEW Interactive Video Player */}
        <MoviePlayer movie={movie} posterPath={movie.poster_path} />

        <div className="md:w-2/3 space-y-4">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-slate-400 text-lg">{movie.release_date?.split("-")[0]} • {movie.runtime} min</p>
          
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm">
              ★ {movie.vote_average.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">({movie.vote_count} votes)</span>
          </div>

          <p className="text-lg leading-relaxed mt-4">{movie.overview}</p>

          <MovieButtons movie={movie} isFavorited={!!favoriteRecord} />
        </div>

      </div>
    </div>
  );
}