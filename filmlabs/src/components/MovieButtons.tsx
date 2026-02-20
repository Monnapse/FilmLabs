"use client";

import { Button } from "@/components/ui/button";
import { toggleFavorite, addToWatchHistory } from "@/app/actions";
import { useState } from "react";
import { toast } from "sonner"; // <-- Import toast

export default function MovieButtons({ movie, isFavorited }: { movie: any, isFavorited: boolean }) {
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);

  const handleFavorite = async () => {
    setLoadingFav(true);
    try {
      await toggleFavorite(movie);
      if (isFavorited) {
        toast("Removed from Favorites");
      } else {
        toast.success("Added to Favorites!", {
          description: `${movie.title} has been saved to your profile.`
        });
      }
    } catch (error) {
      toast.error("Failed to update favorites.");
    }
    setLoadingFav(false);
  };

  const handleWatchHistory = async () => {
    setLoadingWatch(true);
    try {
      await addToWatchHistory(movie);
      toast.success("Marked as Watched!", {
        description: `${movie.title} added to your watch history.`
      });
    } catch (error) {
      toast.error("Failed to update watch history.");
    }
    setLoadingWatch(false);
  };

  return (
    <div className="flex gap-4 mt-6">
      <Button 
        onClick={handleFavorite} 
        disabled={loadingFav}
        variant={isFavorited ? "destructive" : "default"}
      >
        {loadingFav ? "Saving..." : isFavorited ? "Remove Favorite" : "Add to Favorites"}
      </Button>

      <Button 
        onClick={handleWatchHistory} 
        disabled={loadingWatch}
        variant="secondary"
      >
        {loadingWatch ? "Adding..." : "Mark as Watched"}
      </Button>
    </div>
  );
}