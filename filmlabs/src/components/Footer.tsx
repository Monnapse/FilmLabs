import Link from "next/link";
import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0c] border-t border-white/5 pt-16 pb-8 mt-auto relative z-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 mb-12">
          
          {/* Brand & Disclaimer */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Film className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(255,193,25,0.5)]" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Film<span className="text-primary">Labs</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-md font-medium">
              FilmLabs is a personalized media tracking dashboard. We do not host, upload, or store any media files on our servers. All metadata and images are provided by external APIs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 md:col-start-8 space-y-5">
            <h3 className="text-white font-bold tracking-wider uppercase text-sm">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">Home</Link></li>
              <li><Link href="/search?type=movie" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">Movies</Link></li>
              <li><Link href="/search?type=tv" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">TV Shows</Link></li>
              <li><Link href="/category/trending-movies" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">Trending</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-2 space-y-5">
            <h3 className="text-white font-bold tracking-wider uppercase text-sm">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link href="/dmca" className="text-white/50 hover:text-primary text-sm font-medium transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-4">
          <p className="text-white/30 text-xs font-medium">
            &copy; {new Date().getFullYear()} FilmLabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}