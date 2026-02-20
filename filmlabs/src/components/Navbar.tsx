import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white py-4 px-8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-400 hover:text-blue-300 transition-colors shrink-0">
          FilmLabs
        </Link>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <SearchBar />
        </div>

        {/* Links & Avatar Menu */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/dashboard" className="text-sm font-medium hover:text-blue-400 transition-colors hidden md:block">
            Discover
          </Link>
          {/* Pass the session user data to the dropdown */}
          <ProfileDropdown user={session.user} />
        </div>
      </div>
    </nav>
  );
}