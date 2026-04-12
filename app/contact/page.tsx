import Link from 'next/link';

export const metadata = {
  title: 'Contact — ApplyFirst',
  description: 'Get in touch with ApplyFirst.',
};

export default function Contact() {
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
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Contact Us</h1>
        <p className="text-white/30 text-sm mb-12">We'd love to hear from you.</p>

        <div className="grid md:grid-cols-2 gap-8">

          {/* CONTACT OPTIONS */}
          <div className="space-y-5">
            {[
              {
                icon: '📬',
                title: 'General Enquiries',
                desc: 'Questions about ApplyFirst, feedback, or suggestions.',
                email: 'applyfirstjobs@gmail.com',
              },
              {
                icon: '🔒',
                title: 'Privacy & Data',
                desc: 'Data deletion requests, privacy concerns, GDPR.',
                email: 'applyfirstjobs@gmail.com',
              },
              {
                icon: '⚖️',
                title: 'Legal',
                desc: 'Legal notices, takedown requests, copyright issues.',
                email: 'applyfirstjobs@gmail.com',
              },
              {
                icon: '🏢',
                title: 'Employers & Partnerships',
                desc: 'Featured listings, partnerships, API access.',
                email: 'applyfirstjobs@gmail.com',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-tight text-sm mb-1">{item.title}</h3>
                    <p className="text-white/30 text-xs mb-3 leading-relaxed">{item.desc}</p>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-[#d4af37] text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {item.email} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* INFO */}
          <div className="space-y-5">
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-2xl p-8">
              <h3 className="text-white font-black uppercase tracking-tight text-sm mb-4">About ApplyFirst</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                ApplyFirst is a remote job board that aggregates job listings directly from company career pages. We update our listings every 6 hours so job seekers always see the freshest opportunities.
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                We are not a recruitment agency. We do not charge job seekers any fees. All job listings link directly to the employer's official career page.
              </p>
            </div>

            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-8">
              <h3 className="text-white font-black uppercase tracking-tight text-sm mb-4">Response Time</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                We aim to respond to all enquiries within 2-3 business days. For urgent legal or privacy matters, please mark your email subject line as URGENT.
              </p>
            </div>

            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-8">
              <h3 className="text-white font-black uppercase tracking-tight text-sm mb-4">Report a Problem</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-3">
                Found a broken job link? Inaccurate listing? Let us know and we'll fix it.
              </p>
              <a
                href="mailto:applyfirstjobs@gmail.com?subject=Report a Problem"
                className="text-[#d4af37] text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                Report Issue →
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <Link href="/" className="text-white/20 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">ApplyFirst</Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
