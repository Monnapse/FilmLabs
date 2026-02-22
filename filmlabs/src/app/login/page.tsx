"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

export const metadata = {
  title: "Login",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="text-center mb-8">
        <Film className="w-12 h-12 text-primary mx-auto drop-shadow-[0_0_15px_rgba(255,193,25,0.5)]" />
      </div>
      <Card className="bg-[#14151a]/80 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-transparent opacity-80" />
        
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-black text-white tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-white/50 font-medium mt-2">Log in to access your FilmLabs account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            {registered && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm font-medium text-center">
                Registration successful! Please log in.
              </div>
            )}
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
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="bg-[#0d0d0d] border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 rounded-xl transition-all font-medium"
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
              Log In
            </Button>
            <p className="text-sm text-white/50 font-medium text-center">
              Don't have an account? <Link href="/register" className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors">Sign up</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="text-primary font-bold animate-pulse z-10">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}