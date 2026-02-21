import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileForms from "./ProfileForms";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = parseInt(session.user.id, 10);

  const dbUser = await prisma.account.findUnique({ where: { userId } });
  if (!dbUser) redirect("/login");

  // 1. Get raw history from DB
  const watchHistory = await prisma.accountWatchHistory.findMany({
    where: { userId },
  });

  // 2. Filter unique items by ID and Type
  const uniqueMedia = Array.from(new Set(watchHistory.map(h => `${h.mediaType}-${h.tmdbId}`)));

  // 3. Fetch fresh posters from TMDB
  const posterPromises = uniqueMedia.map(async (mediaStr) => {
    const [type, id] = mediaStr.split('-');
    try {
      const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.poster_path;
    } catch {
      return null;
    }
  });

  const rawPosters = await Promise.all(posterPromises);
  const unlockedPosters = rawPosters.filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0d0d0d] p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 mt-6 md:mt-12 relative z-10">
        <header className="pb-6 border-b border-white/10 flex items-center gap-4">
          <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(255,193,25,0.5)]" />
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Account Settings</h1>
            <p className="text-white/50 mt-1.5 font-medium text-sm">Manage your identity, security, and unlocked avatars.</p>
          </div>
        </header>

        <ProfileForms user={dbUser} unlockedPosters={unlockedPosters as string[]} />
      </div>
    </div>
  );
}