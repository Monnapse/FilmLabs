import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "./ui/button";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  return (
    <nav className="bg-[#14151a]/95 backdrop-blur-md border-b border-border/50 text-white py-3 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        
        {/* Logo */}
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-white hover:text-primary transition-colors">
            Film<span className="text-primary">Labs</span>
          </Link>
          
          {/* Quick Links */}
          <div className="hidden lg:flex items-center gap-6 font-medium text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/movies" className="hover:text-primary transition-colors">Movies</Link>
            <Link href="/tv-shows" className="hover:text-primary transition-colors">TV Shows</Link>
            <Link href="/top-rated" className="hover:text-primary transition-colors">Top Rated</Link>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          {/* Ensure your SearchBar component has rounded-full styling to match HiAnime */}
          <SearchBar /> 
        </div>

        {/* User Profile / Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full font-bold">
            Random
          </Button>
          <ProfileDropdown user={session.user} />
        </div>
      </div>
    </nav>
  );
}