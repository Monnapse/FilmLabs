"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function NativePlayer({ streamUrl, poster }: { streamUrl: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Check if the browser supports HLS.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        // Optional: Tweak settings for better buffering
        maxBufferSize: 0,
        maxBufferLength: 30,
      });
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => console.log("Autoplay blocked by browser"));
      });

      return () => {
        hls.destroy();
      };
    } 
    // Safari supports native HLS playback
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => console.log("Autoplay blocked by browser"));
      });
    }
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      poster={poster}
      className="absolute inset-0 w-full h-full object-contain bg-black focus:outline-none"
      style={{ 
        // A little CSS trick to make the native player look sleeker
        filter: "drop-shadow(0 0 20px rgba(255,193,25,0.1))" 
      }}
    />
  );
}