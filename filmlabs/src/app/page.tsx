import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
      
      {/* Dark gradient overlay mimicking anime sites */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-background/90 to-background z-0" />
      
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-8 px-4">
        {/* Logo/Brand Area */}
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-md">
          Film<span className="text-primary">Labs</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          The ultimate ad-free streaming laboratory. Track, discover, and watch your favorite shows in high quality.
        </p>

        {/* Big Centered Search Bar (Like HiAnime) */}
        <div className="max-w-2xl mx-auto py-6">
           <SearchBar hideFilter={true} /> {/* <-- Add the prop here */}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-10 h-14 rounded-full font-bold shadow-[0_0_15px_rgba(255,193,25,0.4)] transition-all hover:scale-105">
                Enter Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-10 h-14 rounded-full font-bold shadow-[0_0_15px_rgba(255,193,25,0.4)] transition-all hover:scale-105">
                  Watch Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-10 h-14 rounded-full font-bold hover:bg-secondary/80">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}