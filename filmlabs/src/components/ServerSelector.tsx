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
  
  // 1. On load, check if the user previously saved a preferred server
  useEffect(() => {
    const savedServer = localStorage.getItem("preferredServerIndex");
    if (savedServer !== null) {
      setSelectedIndex(Number(savedServer));
    }
  }, [setSelectedIndex]);

  // 2. When the user changes the server, save it to their browser!
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedIndex(val);
    localStorage.setItem("preferredServerIndex", val.toString());
  };

  return (
    <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
      <div className="flex items-center text-slate-300 text-sm font-medium">
        <Server className="w-4 h-4 mr-2 text-blue-400" />
        <span>Streaming Source</span>
      </div>
      <select 
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer hover:bg-slate-950 transition-colors"
        value={selectedIndex}
        onChange={handleChange}
      >
        {videoServices.map((service, index) => (
          <option key={index} value={index}>
            {service.name}
          </option>
        ))}
      </select>
    </div>
  );
}