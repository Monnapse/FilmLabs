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
    <div className="w-full p-4 md:p-6 flex flex-col lg:flex-row lg:items-center gap-6 bg-[#14151a]/95 backdrop-blur-xl">
      
      {/* Left Info/Icon Area */}
      <div className="flex items-center gap-4 lg:w-[260px] shrink-0 lg:border-r border-white/10 pr-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,193,25,0.1)]">
          <Server className="w-6 h-6 text-primary drop-shadow-[0_0_10px_rgba(255,193,25,0.5)]" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black text-sm tracking-widest uppercase">Servers</span>
          <span className="text-white/40 text-[11px] font-medium leading-tight mt-1">
            If the current server doesn't work, please try another below.
          </span>
        </div>
      </div>
      
      {/* Server Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {videoServices.map((service, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                px-5 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 border
                ${isActive 
                  ? "bg-primary border-primary text-[#14151a] shadow-[0_0_20px_rgba(255,193,25,0.3)] scale-105" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"}
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