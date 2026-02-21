"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Heart, Clock, Sparkles } from "lucide-react";

export default function ProfileDropdown({ user: serverUser }: { user: any }) {
  const { data: session } = useSession();
  const activeUser = session?.user || serverUser;
  const initial = activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none outline-none">
        <Avatar className="h-10 w-10 border-2 border-primary/30 hover:border-primary shadow-[0_0_15px_rgba(255,193,25,0.15)] hover:shadow-[0_0_20px_rgba(255,193,25,0.4)] transition-all duration-300 cursor-pointer overflow-hidden ring-offset-background">
          {activeUser?.avatar ? (
            <img 
              src={`https://image.tmdb.org/t/p/w200${activeUser.avatar}`} 
              alt="Profile" 
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <AvatarFallback className="bg-[#14151a] text-primary font-bold">{initial}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-[#14151a]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl mt-2 rounded-xl p-2"
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-bold leading-none tracking-wide">{activeUser?.name}</p>
            <p className="text-[11px] font-medium leading-none text-white/50 uppercase tracking-wider">FilmLabs Member</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10 my-2" />
        
        <div className="space-y-1">
          <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg transition-colors py-2.5">
            <Link href="/category/history" className="flex items-center w-full group">
              <Clock className="mr-3 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-medium text-white/80 group-hover:text-white">Watch History</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg transition-colors py-2.5">
            <Link href="/category/favorites" className="flex items-center w-full group">
              <Heart className="mr-3 h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-white/80 group-hover:text-white">Favorites</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg transition-colors py-2.5">
            <Link href="/category/recommendations" className="flex items-center w-full group">
              <Sparkles className="mr-3 h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-white/80 group-hover:text-white">Recommendations</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-white/10 my-2" />
        
        <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg transition-colors py-2.5">
          <Link href="/profile" className="flex items-center w-full group">
            <User className="mr-3 h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
            <span className="font-medium text-white/80 group-hover:text-white">Account Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10 my-2" />
        
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 cursor-pointer rounded-lg transition-colors py-2.5 mt-1"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-bold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}