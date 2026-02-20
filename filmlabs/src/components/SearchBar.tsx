"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"; // Lucide icons come pre-installed with shadcn!

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirect the user to the search page with their query in the URL
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(""); // Clear the input after searching
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Search for movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-blue-500"
      />
      <Button type="submit" size="icon" variant="secondary" className="bg-slate-800 hover:bg-slate-700 border border-slate-700">
        <Search className="h-4 w-4 text-slate-300" />
      </Button>
    </form>
  );
}