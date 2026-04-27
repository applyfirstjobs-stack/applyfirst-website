import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Salary Data & Compensation Guide — ApplyFirst',
  description: 'Explore verified salary data for thousands of job titles across the US. Based on official H1B government filings.',
  alternates: { canonical: 'https://www.applyfirstjobs.com/salary' },
};

export default async function SalaryPage() {
  const { data: salaries } = await supabase
    .from('salaries_by_title')
    .select('job_title, avg_salary, min_salary, max_salary, sample_size, slug')
    .order('sample_size', { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-9 h-9 bg-[#d4af37] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-base italic">A</span>
            </div>
            <span className="font-black text-lg text-white tracking-tight uppercase">ApplyFirst</span>
          </Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            ← All Jobs
          </Link>
        </div>
      </nav>

      <section className="border-b border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Verified Salary Data</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            Salary Guide
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mb-6">
            Real compensation data from official US government H1B filings. No self-reported estimates — just verified salaries from thousands of companies.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              {(salaries?.length || 0).toLocaleString()}+ Job Titles
            </span>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
              Source: US Dept. of Labor H1B Filings
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="space-y-2">
          {(salaries || []).map((item) => (
            <Link key={item.slug} href={`/salary/${item.slug}`}
              className="group block bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl px-6 py-5 transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#d4af37]/25 transition-all">
                  <span className="text-[#d4af37] font-black text-lg">💰</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors truncate leading-tight mb-1">
                    {item.job_title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span>${item.min_salary?.toLocaleString()} – ${item.max_salary?.toLocaleString()}</span>
                    <span>·</span>
                    <span>{item.sample_size} data points</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[#d4af37] font-black text-xl">
                    ${item.avg_salary?.toLocaleString()}
                  </div>
                  <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">avg / year</div>
                </div>
                <span className="text-white/20 group-hover:text-[#d4af37] transition-colors shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#d4af37] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xs italic">A</span>
            </div>
            <span className="text-white/30 text-xs font-black uppercase tracking-widest">ApplyFirst — Job Intelligence</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span>·</span>
            <span>© 2026 ApplyFirst</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
