"use client";

import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/actions";
import { useState } from "react";
import { toast } from "sonner";

export default function MediaButtons({ media, mediaType, isFavorited }: { media: any, mediaType: string, isFavorited: boolean }) {
  const [loadingFav, setLoadingFav] = useState(false);

  const handleFavorite = async () => {
    setLoadingFav(true);
    try {
      // TMDB uses 'name' for TV and 'title' for movies. We normalize it here for our database!
      const mappedMedia = mediaType === "tv" 
        ? { ...media, title: media.name, release_date: media.first_air_date }
        : media;
        
      await toggleFavorite(mappedMedia);
      
      if (isFavorited) {
        toast("Removed from Favorites");
      } else {
        toast.success("Added to Favorites!", { description: `${mappedMedia.title || mappedMedia.name} saved.` });
      }
    } catch (error) {
      toast.error("Failed to update favorites.");
    }
    setLoadingFav(false);
  };

  return (
    <div className="mt-6">
      <Button 
        onClick={handleFavorite} 
        disabled={loadingFav}
        variant={isFavorited ? "destructive" : "default"}
      >
        {loadingFav ? "Saving..." : isFavorited ? "Remove Favorite" : "Add to Favorites"}
      </Button>
    </div>
  );
}