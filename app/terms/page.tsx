import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — ApplyFirst',
  description: 'Terms of Service for ApplyFirst job board.',
};

export default function TermsOfService() {
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
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Terms of Service</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: April 13, 2026</p>

        <div className="space-y-10 text-white/60 leading-relaxed">

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ApplyFirst at applyfirstjobs.com ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">2. What ApplyFirst Is</h2>
            <p>ApplyFirst is a job listing aggregator. We collect publicly available job postings from company career pages and display them in one place. We are a directory service only. We are not a recruiter, staffing agency, or employer. We do not facilitate, guarantee, or participate in any employment relationship.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">3. No Guarantee of Employment</h2>
            <p>ApplyFirst makes no guarantee that any job listing is accurate, current, or available. Job listings are sourced automatically from third-party sources. We are not responsible for the accuracy, completeness, or legality of any job listing. Applying for a job through a link on our site takes you directly to the employer's own website — we have no involvement in that process.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">4. No Liability for Third-Party Sites</h2>
            <p>When you click Apply on any job listing, you leave our website and enter a third-party employer's website. ApplyFirst is not responsible for the content, accuracy, privacy practices, or any other aspect of third-party websites. Any dealings you have with employers are solely between you and them.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">5. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, ApplyFirst and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to: loss of employment opportunity, reliance on inaccurate job listings, or any interactions with third-party employers.</p>
            <p className="mt-3">The Service is provided "as is" and "as available" without any warranties of any kind, express or implied.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">6. User Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, or systematically extract data from the Service without permission</li>
              <li>Attempt to interfere with or disrupt the Service</li>
              <li>Use the Service to send spam or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">7. Intellectual Property</h2>
            <p>Job listing content is sourced from public sources and remains the property of the respective employers. The ApplyFirst brand, design, and website code are owned by ApplyFirst. You may not reproduce or redistribute our website design or code without permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">8. Email Alerts</h2>
            <p>If you subscribe to job alerts, you consent to receiving periodic emails from us. You can unsubscribe at any time by contacting us at <span className="text-[#d4af37]">applyfirstjobs@gmail.com</span>. We will never sell your email address.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable law. Any disputes shall be resolved through good-faith negotiation first.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">11. Contact</h2>
            <p>For any questions about these Terms: <span className="text-[#d4af37]">applyfirstjobs@gmail.com</span></p>
          </section>

        </div>
      </div>

      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <Link href="/" className="text-white/20 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">ApplyFirst</Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
