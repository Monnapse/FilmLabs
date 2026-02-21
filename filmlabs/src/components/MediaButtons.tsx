"use client";

import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/actions";
import { useState } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MediaButtons({
  media,
  mediaType,
  isFavorited,
  isLoggedIn = false,
}: {
  media: any;
  mediaType: string;
  isFavorited: boolean;
  isLoggedIn?: boolean;
}) {
  const [loadingFav, setLoadingFav] = useState(false);
  const router = useRouter();

 const handleFavorite = async () => {
    if (!isLoggedIn) {
      toast("Authentication required", {
        description: "Please sign in to save your favorites.",
      });
      router.push("/login");
      return;
    }

    setLoadingFav(true);
    try {
      await toggleFavorite({ ...media, mediaType });

      const title = media.title || media.name;
      if (isFavorited) {
        toast("Removed from Favorites");
      } else {
        toast.success("Added to Favorites!", {
          description: `${title} saved.`,
        });
      }
    } catch (error) {
      toast.error("Failed to update favorites.");
    }
    setLoadingFav(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-8">
      {mediaType === "movie" && (
        <Button
          onClick={() => router.push("?play=true", { scroll: true })}
          size="lg"
          className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(255,193,25,0.4)] transition-all"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Watch Now
        </Button>
      )}
      <Button
        onClick={handleFavorite}
        disabled={loadingFav}
        variant={isFavorited ? "secondary" : "outline"}
        size="lg"
        className={`h-14 px-8 rounded-full font-bold border-2 transition-all shadow-md ${isFavorited ? "bg-secondary border-border/50 text-white hover:bg-secondary/80" : "border-primary text-primary hover:bg-primary/10"}`}
      >
        {loadingFav
          ? "Saving..."
          : isFavorited
            ? "Remove Favorite"
            : "Add to Favorites"}
      </Button>
    </div>
  );
}