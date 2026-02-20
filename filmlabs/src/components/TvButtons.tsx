"use client";

import { Button } from "@/components/ui/button";
import { markEpisodeWatched, toggleFavorite } from "@/app/actions";
import { useState } from "react";
import { toast } from "sonner";

export default function TvButtons({ tvShow, isFavorited, nextEpisode }: { tvShow: any, isFavorited: boolean, nextEpisode: any }) {
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);

  const handleFavorite = async () => {
    setLoadingFav(true);
    try {
      // We can reuse toggleFavorite by mapping the TV 'name' to 'title'
      const mappedShow = { ...tvShow, title: tvShow.name, release_date: tvShow.first_air_date };
      await toggleFavorite(mappedShow);
      toast(isFavorited ? "Removed from Favorites" : "Added to Favorites!");
    } catch (error) {
      toast.error("Failed to update favorites.");
    }
    setLoadingFav(false);
  };

  const handleWatchEpisode = async () => {
    if (!nextEpisode) return;
    setLoadingWatch(true);
    try {
      await markEpisodeWatched(tvShow, nextEpisode.season_number, nextEpisode.episode_number);
      toast.success(`S${nextEpisode.season_number} E${nextEpisode.episode_number} Watched!`);
    } catch (error) {
      toast.error("Failed to log episode.");
    }
    setLoadingWatch(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <Button 
        onClick={handleFavorite} 
        disabled={loadingFav}
        variant={isFavorited ? "destructive" : "default"}
      >
        {loadingFav ? "Saving..." : isFavorited ? "Remove Favorite" : "Add Show to Favorites"}
      </Button>

      {nextEpisode && (
        <Button 
          onClick={handleWatchEpisode} 
          disabled={loadingWatch}
          variant="secondary"
        >
          {loadingWatch ? "Saving..." : `Mark S${nextEpisode.season_number} E${nextEpisode.episode_number} Watched`}
        </Button>
      )}
    </div>
  );
}