"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, Search, X } from "lucide-react";
import SearchBar from "./SearchBar"; 
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "./ui/button";
import { redirectToRandomMedia } from "@/app/actions";

export default function Navbar() {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRandomClick = () => {
    startTransition(async () => {
      await redirectToRandomMedia();
    });
  };

  return (
    <>
      {/* MAIN NAVBAR */}
      <nav className="bg-[#14151a]/95 backdrop-blur-xl border-b border-white/5 text-white py-3 px-4 md:px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          
          {/* LEFT: Logo & Desktop Links */}
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden text-white/70 hover:text-primary transition-colors"
            >
              <Menu className="w-7 h-7" />
            </button>

            <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-white hover:text-primary transition-colors">
              Film<span className="text-primary">Labs</span>
            </Link>

            {/* Desktop Quick Links */}
            <div className="hidden lg:flex items-center gap-6 font-bold text-sm text-white/70">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/search?type=movie" className="hover:text-primary transition-colors">Movies</Link>
              <Link href="/search?type=tv" className="hover:text-primary transition-colors">TV Shows</Link>
              <Link href="/category/trending-movies" className="hover:text-primary transition-colors">Trending</Link>
            </div>
          </div>
          
          {/* CENTER: Custom SearchBar (Desktop) */}
          <div className="flex-1 max-w-md hidden md:block mx-4">
            <SearchBar /> 
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden text-white/70 hover:text-primary transition-colors p-1"
            >
              <Search className="w-6 h-6" />
            </button>

            <Button 
              variant="ghost" 
              onClick={handleRandomClick}
              disabled={isPending}
              className="hidden sm:flex text-white/70 hover:text-primary hover:bg-primary/10 rounded-full font-bold"
            >
              {isPending ? "Picking..." : "Random"}
            </Button>

            {/* Profile Dropdown */}
            {session ? (
              <ProfileDropdown user={session.user} />
            ) : (
               <Link href="/login">
                 <Button className="rounded-full font-bold px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(255,193,25,0.3)]">Login</Button>
               </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH DROPDOWN */}
      {isMobileSearchOpen && (
        <div className="md:hidden w-full bg-[#14151a] p-4 border-b border-white/5 absolute top-[70px] left-0 z-40 shadow-xl animate-in slide-in-from-top-2">
           <SearchBar />
        </div>
      )}

      {/* MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-[280px] h-full bg-[#0d0d0d] border-r border-white/5 p-6 flex flex-col gap-6 animate-in slide-in-from-left duration-300 shadow-2xl">
            
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="absolute top-5 right-5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="text-3xl font-black tracking-tighter text-white mt-2">
              Film<span className="text-primary">Labs</span>
            </Link>

            <nav className="flex flex-col gap-5 mt-6 font-bold text-lg text-white/60">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="hover:text-primary hover:translate-x-2 transition-all">Home</Link>
              <Link href="/search?type=movie" onClick={() => setIsSidebarOpen(false)} className="hover:text-primary hover:translate-x-2 transition-all">Movies</Link>
              <Link href="/search?type=tv" onClick={() => setIsSidebarOpen(false)} className="hover:text-primary hover:translate-x-2 transition-all">TV Shows</Link>
              <Link href="/category/trending-movies" onClick={() => setIsSidebarOpen(false)} className="hover:text-primary hover:translate-x-2 transition-all">Trending</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}