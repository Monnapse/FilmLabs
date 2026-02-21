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
import { UserX, CheckCircle, Shield, User } from "lucide-react";

export default function ProfileForms({ user, unlockedPosters }: { user: any, unlockedPosters: string[] }) {
  const { data: session, update } = useSession(); 
  
  const [username, setUsername] = useState(user.username);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
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
    setCurrentAvatar(posterUrl); 
    const res = await updateAvatar(posterUrl);
    
    if (res.error) {
      setCurrentAvatar(previousAvatar); 
      toast.error("Failed to update profile picture.");
    } else {
      await update({ avatar: posterUrl }); 
      if (posterUrl) toast.success("Profile picture updated!");
      else toast.success("Profile picture unequipped!");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Avatars Section */}
      <Card className="bg-[#14151a]/80 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-transparent opacity-50" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white flex items-center gap-2 font-bold">
            <User className="w-5 h-5 text-primary" /> Profile Picture
          </CardTitle>
          <CardDescription className="text-white/50">
            Unlock new avatars by watching more movies and TV shows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center bg-[#0d0d0d]/50 p-6 rounded-2xl border border-white/5">
            
            <button
              onClick={() => handleAvatarSelect(null)}
              className={`flex flex-col items-center justify-center h-20 w-20 rounded-full border-2 transition-all focus:outline-none relative group
                ${!currentAvatar 
                  ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/20 ring-offset-2 ring-offset-[#14151a]" 
                  : "border-dashed border-white/20 bg-white/5 hover:border-red-500 hover:text-red-500 text-white/40 hover:bg-red-500/10"
                }
              `}
              title="Unequip Avatar"
            >
              <UserX className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Clear</span>
              
              {!currentAvatar && (
                <div className="absolute -top-1 -right-1 bg-[#14151a] rounded-full shadow-lg">
                  <CheckCircle className="h-6 w-6 text-primary fill-[#14151a]" />
                </div>
              )}
            </button>

            {unlockedPosters.length === 0 && (
              <p className="text-white/40 text-sm ml-2 font-medium">Mark a movie or show as watched to unlock its poster here!</p>
            )}
            
            {unlockedPosters.map((poster, idx) => {
              const isEquipped = currentAvatar === poster;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleAvatarSelect(poster)}
                  className={`relative h-20 w-20 rounded-full overflow-visible border-2 transition-all duration-300 focus:outline-none shadow-xl
                    ${isEquipped 
                      ? "border-primary ring-4 ring-primary/20 ring-offset-2 ring-offset-[#14151a] scale-105 z-10" 
                      : "border-transparent hover:border-primary/50 hover:scale-110 opacity-70 hover:opacity-100"
                    }
                  `}
                >
                  <div className="absolute inset-0 rounded-full overflow-hidden bg-[#242428]">
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${poster}`}
                      alt="Unlocked Avatar"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  
                  {isEquipped && (
                    <div className="absolute -top-2 -right-2 z-20 bg-[#14151a] rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                      <CheckCircle className="h-7 w-7 text-primary fill-[#14151a]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Username Section */}
        <Card className="bg-[#14151a]/80 backdrop-blur-xl border border-white/5 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white font-bold">Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameChange} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-white/60 font-medium uppercase tracking-wider text-xs">Display Name</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="bg-[#0d0d0d] border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 rounded-xl transition-all font-medium"
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white border-none h-12 rounded-xl font-bold transition-all">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="bg-[#14151a]/80 backdrop-blur-xl border border-white/5 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2 font-bold">
              <Shield className="w-5 h-5 text-red-500" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="currentPass" className="text-white/60 font-medium uppercase tracking-wider text-xs">Current Password</Label>
                <Input 
                  id="currentPass" 
                  type="password"
                  value={currentPass} 
                  onChange={(e) => setCurrentPass(e.target.value)} 
                  className="bg-[#0d0d0d] border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 h-12 rounded-xl transition-all"
                  required 
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="newPass" className="text-white/60 font-medium uppercase tracking-wider text-xs">New Password</Label>
                <Input 
                  id="newPass" 
                  type="password"
                  value={newPass} 
                  onChange={(e) => setNewPass(e.target.value)} 
                  className="bg-[#0d0d0d] border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 h-12 rounded-xl transition-all"
                  required 
                />
              </div>
              <Button type="submit" variant="destructive" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-12 rounded-xl font-bold transition-all mt-2">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}