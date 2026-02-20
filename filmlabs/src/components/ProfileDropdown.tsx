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
import { User, LogOut, Heart, Clock, Sparkles } from "lucide-react"; // Removed Settings

// We rename the incoming prop to 'serverUser' to act as a fallback
export default function ProfileDropdown({ user: serverUser }: { user: any }) {
  // Hook into the live NextAuth session!
  const { data: session } = useSession();
  
  // Use the live session data if it exists, otherwise fall back to the server data
  const activeUser = session?.user || serverUser;

  const initial = activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-10 w-10 border-2 border-slate-700 hover:border-blue-500 hover:opacity-80 transition-all cursor-pointer overflow-hidden">
          {activeUser?.avatar ? (
            <img 
              src={`https://image.tmdb.org/t/p/w200${activeUser.avatar}`} 
              alt="Profile" 
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <AvatarFallback className="bg-slate-800 text-blue-400 font-bold">{initial}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-800 text-slate-300 mt-2">
        <DropdownMenuLabel className="text-white">
          <div className="flex flex-col space-y-1 pb-1">
            <p className="text-sm font-medium leading-none">{activeUser?.name}</p>
            <p className="text-xs leading-none text-slate-500 mt-1">FilmLabs Member</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem asChild className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-white">
          <Link href="/category/history" className="flex items-center w-full">
            <Clock className="mr-2 h-4 w-4 text-blue-400" />
            <span>Watch History</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-white">
          <Link href="/category/favorites" className="flex items-center w-full">
            <Heart className="mr-2 h-4 w-4 text-red-400" />
            <span>Favorites</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-white">
          <Link href="/category/recommendations" className="flex items-center w-full">
            <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Recommendations</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem asChild className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-white">
          <Link href="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Preferences has been removed completely! */}

        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hover:bg-red-900/20 focus:bg-red-900/20 text-red-400 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}