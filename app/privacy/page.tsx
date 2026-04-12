import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — ApplyFirst',
  description: 'Privacy Policy for ApplyFirst job board.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-8 h-8 bg-[#d4af37] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm italic">A</span>
            </div>
            <span className="font-black text-base text-white tracking-tight uppercase">ApplyFirst</span>
          </Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">← Home</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: April 13, 2026</p>

        <div className="space-y-10 text-white/60 leading-relaxed">

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">1. Who We Are</h2>
            <p>ApplyFirst ("we", "us", "our") operates the website applyfirstjobs.com — a job board that aggregates publicly available job listings from company career pages. We are not a recruitment agency and do not act as an employer or staffing service.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect only the following personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white/80">Email address</strong> — only when you voluntarily submit it to receive job alerts or to proceed to a job application. We never collect your email without your explicit action.</li>
              <li><strong className="text-white/80">Usage data</strong> — standard server logs including IP address, browser type, pages visited. This is collected automatically by our hosting provider (Vercel).</li>
            </ul>
            <p className="mt-3">We do NOT collect: names, phone numbers, resumes, payment information, or any sensitive personal data.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To send you weekly job alert emails if you signed up for them</li>
              <li>To understand which jobs are most popular (aggregated, anonymised analytics)</li>
              <li>We do NOT sell, rent, or share your email with third parties</li>
              <li>We do NOT use your data for advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">4. Job Listings</h2>
            <p>All job listings on ApplyFirst are sourced from publicly available company career pages and job boards. We do not create job listings. When you click Apply, you are redirected to the employer's own website. We have no control over and take no responsibility for the content, accuracy, or hiring decisions of third-party employers.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">5. Data Storage</h2>
            <p>Your email address is stored securely in our database provided by Supabase, hosted on AWS infrastructure. We retain email addresses until you request deletion. To delete your data, email us at <span className="text-[#d4af37]">privacy@applyfirstjobs.com</span>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">6. Cookies</h2>
            <p>We do not use tracking cookies or advertising cookies. Our website may use essential cookies required for basic functionality only.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request deletion of your personal data</li>
              <li>Unsubscribe from job alert emails at any time</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <span className="text-[#d4af37]">privacy@applyfirstjobs.com</span>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. The date at the top of this page indicates when it was last revised. Continued use of the site after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">9. Contact</h2>
            <p>For any privacy-related questions: <span className="text-[#d4af37]">privacy@applyfirstjobs.com</span></p>
          </section>
        </div>
      </div>

      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <Link href="/" className="text-white/20 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">ApplyFirst</Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
