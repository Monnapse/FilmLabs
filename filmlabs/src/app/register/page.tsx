"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/login?registered=true");
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Film className="w-12 h-12 text-primary mx-auto drop-shadow-[0_0_15px_rgba(255,193,25,0.5)]" />
        </div>
        <Card className="bg-[#14151a]/80 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
          {/* Top Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-primary to-transparent opacity-80" />
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-black text-white tracking-tight">Create an Account</CardTitle>
            <CardDescription className="text-white/50 font-medium mt-2">Join FilmLabs to track your favorite movies and shows.</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/60 font-medium uppercase tracking-wider text-xs ml-1">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="filmbuff99" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="bg-[#0d0d0d] border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 rounded-xl transition-all font-medium placeholder:text-white/20"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/60 font-medium uppercase tracking-wider text-xs ml-1">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="bg-[#0d0d0d] border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 rounded-xl transition-all font-medium"
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-2 pb-8">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,193,25,0.3)] transition-all">
                Sign Up
              </Button>
              <p className="text-sm text-white/50 font-medium text-center">
                Already have an account? <Link href="/login" className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors">Log in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}