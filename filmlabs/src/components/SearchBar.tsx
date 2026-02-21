"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react"; 

const ALL_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "History", 
  "Horror", "Music", "Mystery", "Romance", "SciFi", 
  "Thriller", "War", "Western"
];

interface SearchBarProps {
  hideFilter?: boolean;
}

export default function SearchBar({ hideFilter = false }: SearchBarProps) { // <-- Update this line
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "multi");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [genres, setGenres] = useState<string[]>(searchParams.get("genres")?.split(",").filter(Boolean) || []);
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [rating, setRating] = useState(searchParams.get("rating") || "all");
  const [score, setScore] = useState(searchParams.get("score") || "0");
  const [sort, setSort] = useState(searchParams.get("sort") || "popularity");

  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (type !== "multi") params.append("type", type);
    if (year.trim()) params.append("year", year.trim());
    if (genres.length > 0) params.append("genres", genres.join(","));
    if (status !== "all") params.append("status", status);
    if (rating !== "all") params.append("rating", rating);
    if (score !== "0") params.append("score", score);
    if (sort !== "popularity") params.append("sort", sort);

    router.push(`/search?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
     setType("multi");
     setYear("");
     setGenres([]);
     setStatus("all");
     setRating("all");
     setScore("0");
     setSort("popularity");
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-2 relative z-50" ref={filterRef}>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2 bg-secondary p-1 rounded-full border border-border/50 shadow-inner">
        <Input
          type="text"
          placeholder="Search for movies or TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-0 text-white placeholder:text-muted-foreground focus-visible:ring-0 px-4 h-10 w-full"
        />
        
        {/* Wrap the Filter button in this conditional check */}
        {!hideFilter && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setShowFilters(!showFilters)} 
            className={`rounded-full h-10 w-10 p-0 shrink-0 transition-colors ${showFilters ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white hover:bg-white/10'}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}

        <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/80">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Optional: Add !hideFilter to your dropdown check just to be extra safe */}
      {!hideFilter && showFilters && (
        <div className="absolute top-16 left-0 w-full bg-[#14151a] rounded-2xl border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-6 text-foreground z-50">
           <div className="flex justify-between items-center border-b border-border/50 pb-3">
               <h3 className="font-bold text-xl text-white">Advanced Filters</h3>
               <div className="flex gap-4 items-center">
                  <button type="button" onClick={clearFilters} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Clear All</button>
                  <button type="button" onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-white transition-colors bg-secondary p-1.5 rounded-full">
                      <X className="h-4 w-4" />
                  </button>
               </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* Left Column */}
               <div className="space-y-4">
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Media Type</label>
                       <select value={type} onChange={(e) => setType(e.target.value)} className="bg-secondary border border-border/50 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all">
                           <option value="multi">All Types</option>
                           <option value="movie">Movies Only</option>
                           <option value="tv">TV Shows Only</option>
                       </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Release Year</label>
                       <input type="number" placeholder="e.g., 2023" value={year} onChange={(e) => setYear(e.target.value)} className="bg-secondary border border-border/50 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                       <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-secondary border border-border/50 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all">
                           <option value="all">Any Status</option>
                           <option value="released">Released</option>
                           <option value="upcoming">Upcoming</option>
                       </select>
                   </div>
               </div>

               {/* Right Column */}
               <div className="space-y-4">
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sort By</label>
                       <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-secondary border border-border/50 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all">
                           <option value="popularity">Popularity</option>
                           <option value="rating">Highest Rated</option>
                           <option value="newest">Newest First</option>
                           <option value="oldest">Oldest First</option>
                       </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Age Rating (US)</label>
                       <select value={rating} onChange={(e) => setRating(e.target.value)} className="bg-secondary border border-border/50 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all">
                           <option value="all">Any Rating</option>
                           <option value="G">G / TV-Y</option>
                           <option value="PG">PG / TV-PG</option>
                           <option value="PG-13">PG-13 / TV-14</option>
                           <option value="R">R / TV-MA</option>
                       </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <div className="flex justify-between items-center">
                           <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Minimum Score</label>
                           <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">{score > "0" ? `${score} / 10` : 'Any'}</span>
                       </div>
                       <input type="range" min="0" max="10" step="1" value={score} onChange={(e) => setScore(e.target.value)} className="w-full accent-primary" />
                   </div>
               </div>
           </div>

           {/* Genres Toggle */}
           <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Genres</label>
               <div className="flex flex-wrap gap-2">
                   {ALL_GENRES.map(g => (
                       <button 
                          key={g}
                          type="button" 
                          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${genres.includes(g) ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,193,25,0.3)]' : 'bg-secondary text-muted-foreground hover:bg-secondary-foreground/10 hover:text-white'}`}
                          onClick={() => toggleGenre(g)}
                       >
                           {g}
                       </button>
                   ))}
               </div>
           </div>

           <Button type="button" onClick={() => handleSearch()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 rounded-xl mt-4 shadow-[0_0_15px_rgba(255,193,25,0.2)]">
               Apply Filters & Search
           </Button>
        </div>
      )}
    </div>
  );
}