"use client";

import { useEffect } from "react";
import { Server } from "lucide-react";
import { videoServices } from "@/lib/videoServices";

export default function ServerSelector({ 
  selectedIndex, 
  setSelectedIndex 
}: { 
  selectedIndex: number, 
  setSelectedIndex: (index: number) => void 
}) {
  
  useEffect(() => {
    const savedServer = localStorage.getItem("preferredServerIndex");
    if (savedServer !== null) {
      setSelectedIndex(Number(savedServer));
    }
  }, [setSelectedIndex]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    localStorage.setItem("preferredServerIndex", index.toString());
  };

  return (
    <div className="bg-[#242428] w-full p-4 flex flex-col md:flex-row md:items-center gap-4 text-sm">
      
      {/* Left Info/Icon Area (HiAnime Style) */}
      <div className="flex items-center gap-3 md:w-[220px] shrink-0 md:border-r border-white/10 pr-4">
        <div className="w-10 h-10 rounded-full bg-[#14151a] flex items-center justify-center shrink-0">
          <Server className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wide">Servers</span>
          <span className="text-[#aaaaaa] text-[10px] leading-tight mt-0.5">
            If current server doesn't work please try other servers below.
          </span>
        </div>
      </div>
      
      {/* Server Buttons */}
      <div className="flex flex-wrap items-center gap-2 pl-1">
        {videoServices.map((service, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                px-4 py-2 rounded-md font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-2
                ${isActive 
                  ? "bg-primary text-[#14151a]" // Active: Solid Primary background, Dark text
                  : "bg-[#323232] text-[#c0c0c0] hover:bg-white/10 hover:text-white"} // Inactive: Grey background, light text
              `}
            >
              {service.name}
            </button>
          );
        })}
      </div>
      
    </div>
  );
}