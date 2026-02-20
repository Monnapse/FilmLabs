import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
      
      {/* Cool background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
          Your Personal <span className="text-blue-500">Film</span> Laboratory
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover new movies, track what you've watched, and curate your ultimate favorites list. Powered by Next.js and PostgreSQL.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  Log In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      
    </div>
  );
}