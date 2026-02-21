import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | FilmLabs",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] p-4 md:p-8 relative overflow-hidden flex justify-center pt-24 pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8">
        <header className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto drop-shadow-[0_0_15px_rgba(255,193,25,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-white/50 font-medium">Last updated: February 2026</p>
        </header>

        <div className="bg-[#14151a]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-8 md:p-12 prose prose-invert prose-p:text-white/70 prose-headings:text-white max-w-none">
          
          <h2>1. Information We Collect</h2>
          <p>
            When you register for an account, we collect your chosen username and a securely hashed version of your password. 
            We also track the movies and TV shows you add to your favorites or mark as watched to provide personalized recommendations.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to provide and improve the FilmLabs service. We use your watch history to track your progress, unlock profile avatars, and suggest new content. We do not sell your personal data to third parties.
          </p>

          <h2>3. Cookies and Local Storage</h2>
          <p>
            FilmLabs uses secure cookies exclusively for session management (keeping you logged in). We do not use third-party tracking cookies for advertising purposes.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement standard security measures to protect your account information. Passwords are encrypted before being stored in our database. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
          
        </div>
      </div>
    </div>
  );
}