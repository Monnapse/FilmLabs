"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { updateUsername, updatePassword, updateAvatar } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserX, CheckCircle } from "lucide-react";

export default function ProfileForms({ user, unlockedPosters }: { user: any, unlockedPosters: string[] }) {
  const { data: session, update } = useSession(); 
  
  const [username, setUsername] = useState(user.username);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  
  // NEW: Use local state so the UI updates instantly and handles 'null' correctly!
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(user.avatar);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateUsername(username);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      await update({ name: username });
      toast.success("Username updated successfully!");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updatePassword(currentPass, newPass);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Password updated successfully.");
      setCurrentPass("");
      setNewPass("");
    }
  };

  const handleAvatarSelect = async (posterUrl: string | null) => {
    const previousAvatar = currentAvatar;
    
    // Instantly update the UI checkmark
    setCurrentAvatar(posterUrl); 
    
    const res = await updateAvatar(posterUrl);
    
    if (res.error) {
      // Revert the checkmark if the database failed
      setCurrentAvatar(previousAvatar); 
      toast.error("Failed to update profile picture.");
    } else {
      // Tell NextAuth to update the Navbar/Dropdown
      await update({ avatar: posterUrl }); 
      if (posterUrl) {
        toast.success("Profile picture updated!");
      } else {
        toast.success("Profile picture unequipped!");
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Unlockable Avatars Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Profile Picture</CardTitle>
          <CardDescription className="text-slate-400">
            Unlock new avatars by watching more movies and TV shows!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            
            {/* Unequip Button */}
            <button
              onClick={() => handleAvatarSelect(null)}
              className={`flex flex-col items-center justify-center h-20 w-20 rounded-full border-2 transition-all focus:outline-none bg-slate-900 relative
                ${!currentAvatar 
                  ? "border-blue-500 text-blue-400 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-800" 
                  : "border-dashed border-slate-600 hover:border-red-500 hover:text-red-500 text-slate-500"
                }
              `}
              title="Unequip Avatar"
            >
              <UserX className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Clear</span>
              
              {/* Active Checkmark for Clear Button */}
              {!currentAvatar && (
                <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full">
                  <CheckCircle className="h-6 w-6 text-blue-500 fill-slate-900" />
                </div>
              )}
            </button>

            {unlockedPosters.length === 0 && (
              <p className="text-slate-500 text-sm ml-2">Mark a movie or show as watched to unlock its poster here!</p>
            )}
            
            {/* Unlocked Posters */}
            {unlockedPosters.map((poster, idx) => {
              const isEquipped = currentAvatar === poster;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleAvatarSelect(poster)}
                  className={`relative h-20 w-20 rounded-full overflow-visible border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-md
                    ${isEquipped 
                      ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-800 scale-105" 
                      : "border-transparent hover:border-blue-500 hover:scale-105"
                    }
                  `}
                >
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${poster}`}
                      alt="Unlocked Avatar"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  
                  {/* Active Checkmark for Equipped Avatar */}
                  {isEquipped && (
                    <div className="absolute -top-2 -right-2 z-10 bg-slate-800 rounded-full shadow-lg">
                      <CheckCircle className="h-7 w-7 text-blue-500 fill-slate-900" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Username Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Change Username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameChange} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 max-w-sm">
            <div className="space-y-2 w-full">
              <Label htmlFor="username" className="text-slate-300">New Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="bg-slate-900 border-slate-700 text-white w-full"
                required 
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">Save</Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="currentPass" className="text-slate-300">Current Password</Label>
              <Input 
                id="currentPass" 
                type="password"
                value={currentPass} 
                onChange={(e) => setCurrentPass(e.target.value)} 
                className="bg-slate-900 border-slate-700 text-white"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPass" className="text-slate-300">New Password</Label>
              <Input 
                id="newPass" 
                type="password"
                value={newPass} 
                onChange={(e) => setNewPass(e.target.value)} 
                className="bg-slate-900 border-slate-700 text-white"
                required 
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">Update Password</Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}