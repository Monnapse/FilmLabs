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

export default function SearchBar() {
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

  // Close filters when clicking outside the component
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
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Search for movies or TV shows... (Leave empty to browse)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-blue-500"
        />
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => setShowFilters(!showFilters)} 
          className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors ${showFilters ? 'bg-slate-700 ring-2 ring-blue-500' : ''}`}
        >
          <Filter className="h-4 w-4 text-slate-300" />
        </Button>
        <Button type="submit" size="icon" variant="secondary" className="bg-slate-800 hover:bg-slate-700 border border-slate-700">
          <Search className="h-4 w-4 text-slate-300" />
        </Button>
      </form>

      {/* Advanced Filter Dropdown */}
      {showFilters && (
        <div className="absolute top-14 left-0 w-full bg-slate-900 rounded-xl border border-slate-700 shadow-2xl p-5 overflow-y-auto max-h-[80vh] flex flex-col gap-6 text-slate-200">
           
           <div className="flex justify-between items-center border-b border-slate-800 pb-3">
               <h3 className="font-semibold text-lg text-white">Advanced Filters</h3>
               <div className="flex gap-4 items-center">
                  <button type="button" onClick={clearFilters} className="text-sm text-slate-400 hover:text-white transition-colors">Clear All</button>
                  <button type="button" onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                  </button>
               </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* Left Column */}
               <div className="space-y-4">
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-medium text-slate-400">Media Type</label>
                       <select value={type} onChange={(e) => setType(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="multi">All Types</option>
                           <option value="movie">Movies Only</option>
                           <option value="tv">TV Shows Only</option>
                       </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-medium text-slate-400">Release Year</label>
                       <input type="number" placeholder="e.g., 2023" value={year} onChange={(e) => setYear(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-medium text-slate-400">Status</label>
                       <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="all">Any Status</option>
                           <option value="released">Released</option>
                           <option value="upcoming">Upcoming</option>
                       </select>
                   </div>
               </div>

               {/* Right Column */}
               <div className="space-y-4">
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-medium text-slate-400">Sort By</label>
                       <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="popularity">Popularity</option>
                           <option value="rating">Highest Rated</option>
                           <option value="newest">Newest First</option>
                           <option value="oldest">Oldest First</option>
                       </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-medium text-slate-400">Age Rating (US)</label>
                       <select value={rating} onChange={(e) => setRating(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="all">Any Rating</option>
                           <option value="G">G / TV-Y</option>
                           <option value="PG">PG / TV-PG</option>
                           <option value="PG-13">PG-13 / TV-14</option>
                           <option value="R">R / TV-MA</option>
                       </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                       <div className="flex justify-between items-center">
                           <label className="text-sm font-medium text-slate-400">Minimum Score</label>
                           <span className="text-xs text-blue-400 font-medium">{score > "0" ? `${score} / 10` : 'Any'}</span>
                       </div>
                       <input type="range" min="0" max="10" step="1" value={score} onChange={(e) => setScore(e.target.value)} className="w-full accent-blue-500" />
                   </div>
               </div>
           </div>

           {/* Genres Toggle */}
           <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-400">Genres</label>
               <div className="flex flex-wrap gap-2">
                   {ALL_GENRES.map(g => (
                       <button 
                          key={g}
                          type="button" 
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${genres.includes(g) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                          onClick={() => toggleGenre(g)}
                       >
                           {g}
                       </button>
                   ))}
               </div>
           </div>

           <Button type="button" onClick={() => handleSearch()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md mt-2">
               Apply Filters & Search
           </Button>
        </div>
      )}
    </div>
  );
}