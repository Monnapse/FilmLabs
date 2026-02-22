import { AlertOctagon } from "lucide-react";

export const metadata = {
  title: "DMCA",
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] p-4 md:p-8 relative overflow-hidden flex justify-center pt-24 pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8">
        <header className="text-center space-y-4">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">DMCA Disclaimer</h1>
          <p className="text-white/50 font-medium">Digital Millennium Copyright Act Notice</p>
        </header>

        <div className="bg-[#14151a]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-8 md:p-12 prose prose-invert prose-p:text-white/70 prose-headings:text-white max-w-none">
          
          <h2>No Hosted Content</h2>
          <p>
            FilmLabs is a personal media tracking and cataloging application. <strong>We do not host, upload, or store any video, media, or streaming files on our servers.</strong>
          </p>

          <h2>External APIs and Links</h2>
          <p>
            All metadata, including movie titles, descriptions, cast information, and promotional images (posters and backdrops) are pulled via external APIs (such as The Movie Database). Any embedded media or external links found within the application are scraped from the web and provided "as-is" by third parties.
          </p>

          <h2>Copyright Infringement</h2>
          <p>
            Because FilmLabs does not host any media files, we cannot remove content from third-party servers. If you believe your copyrighted material is being infringed upon by a third-party host linked through our application, you must contact the external hosting provider directly to issue a takedown notice.
          </p>

          <p className="text-sm text-white/40 mt-8 italic border-t border-white/10 pt-4">
            If you have questions regarding our automated data scraping or metadata services, please review the documentation of our API providers.
          </p>
          
        </div>
      </div>
    </div>
  );
}