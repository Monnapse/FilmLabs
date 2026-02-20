import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileForms from "./ProfileForms";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = parseInt(session.user.id, 10);

  // 1. Fetch the user directly from the DB to ensure fresh data
  const dbUser = await prisma.account.findUnique({ where: { userId } });
  if (!dbUser) redirect("/login");

  // 2. Fetch all their watched history to generate the unlocked avatars
  const watchHistory = await prisma.accountWatchHistory.findMany({
    where: { userId },
    include: { film: true }
  });

  // 3. Extract just the poster URLs and remove any duplicates
  const unlockedPosters = Array.from(new Set(watchHistory.map(h => h.film.poster).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-3xl mx-auto space-y-8 mt-4 md:mt-10">
        
        <header className="pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-slate-400 mt-1">Manage your identity and security.</p>
        </header>

        <ProfileForms user={dbUser} unlockedPosters={unlockedPosters as string[]} />

      </div>
    </div>
  );
}