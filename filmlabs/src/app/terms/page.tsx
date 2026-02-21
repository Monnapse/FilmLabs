import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Terms of Service | FilmLabs",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] p-4 md:p-8 relative overflow-hidden flex justify-center pt-24 pb-20">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8">
        <header className="text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-primary mx-auto drop-shadow-[0_0_15px_rgba(255,193,25,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-white/50 font-medium">Last updated: February 2026</p>
        </header>

        <div className="bg-[#14151a]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-8 md:p-12 prose prose-invert prose-p:text-white/70 prose-headings:text-white max-w-none">
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using FilmLabs, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            FilmLabs is a personal media tracking application. We provide metadata, images, and recommendations 
            using the TMDB API. FilmLabs does not host, upload, or manage any playable media files.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
            You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2>4. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by FilmLabs. 
            FilmLabs has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
          </p>

        </div>
      </div>
    </div>
  );
}