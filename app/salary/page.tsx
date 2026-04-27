'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

const PER_PAGE = 50;

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Technology', value: 'software' },
  { label: 'Healthcare', value: 'nurse' },
  { label: 'Finance', value: 'financial' },
  { label: 'Education', value: 'teacher' },
  { label: 'Management', value: 'manager' },
  { label: 'Sales', value: 'sales' },
  { label: 'Trades', value: 'electrician' },
];

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from('salaries_by_title')
        .select('job_title, avg_salary, min_salary, max_salary, sample_size, slug', { count: 'exact' })
        .order('sample_size', { ascending: false });

      if (search) q = q.ilike('job_title', `%${search}%`);
      else if (category) q = q.ilike('job_title', `%${category}%`);

      q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      const { data, count } = await q;
      setSalaries(data || []);
      setTotal(count || 0);
      setLoading(false);
    }
    load();
  }, [search, page, category]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-9 h-9 bg-[#d4af37] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-base italic">A</span>
            </div>
            <span className="font-black text-lg text-white tracking-tight uppercase">ApplyFirst</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
              Jobs
            </Link>
            <span className="text-white/10">·</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
              Salaries
            </span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="border-b border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Verified Salary Data</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            Salary Guide
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mb-8">
            Real compensation data from official US government filings. No self-reported estimates — verified salaries across every industry.
          </p>

          {/* SEARCH */}
          <div className="flex items-center bg-[#111] border border-white/10 rounded-2xl px-5 py-4 gap-3 max-w-2xl focus-within:border-[#d4af37]/30 transition-all">
            <svg className="w-5 h-5 text-white/20 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search job title e.g. Software Engineer, Nurse, Teacher..."
              className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-white/20"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); setCategory(''); }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-white/20 hover:text-white text-sm">✕</button>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      <div className="border-b border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat.label}
              onClick={() => { setCategory(cat.value); setSearch(''); setPage(1); }}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                category === cat.value && !search
                  ? 'bg-[#d4af37] text-black border-[#d4af37]'
                  : 'text-white/40 border-white/10 hover:border-[#d4af37]/30 hover:text-white'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
          {loading ? 'Loading...' : `${total.toLocaleString()} job titles`}
        </p>
        {totalPages > 1 && (
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            Page {page} / {totalPages}
          </p>
        )}
      </div>

      {/* SALARY LIST */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        {loading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#111] animate-pulse" />)}
          </div>
        ) : salaries.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-white/30 font-black uppercase tracking-widest text-sm">No results found</p>
            <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-4 text-[#d4af37] text-xs font-black uppercase tracking-widest">
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {salaries.map((item) => (
              <Link key={item.slug} href={`/salary/${item.slug}`}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl px-6 py-5 transition-all duration-200">
                <div className="w-12 h-12 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#d4af37]/25 transition-all">
                  <span className="text-[#d4af37] font-black text-lg">💰</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors truncate leading-tight mb-1">
                    {item.job_title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                    {item.min_salary && item.max_salary && (
                      <span>${item.min_salary?.toLocaleString()} – ${item.max_salary?.toLocaleString()}</span>
                    )}
                    {item.sample_size > 0 && (
                      <><span>·</span><span>{item.sample_size?.toLocaleString()} data points</span></>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[#d4af37] font-black text-xl">
                    ${item.avg_salary?.toLocaleString()}
                  </div>
                  <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">avg / year</div>
                </div>
                <span className="text-white/20 group-hover:text-[#d4af37] transition-colors shrink-0">→</span>
              </Link>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="px-6 py-3 rounded-full border border-white/10 text-white/30 font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all disabled:opacity-20">
              ← Prev
            </button>
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              {page} / {totalPages}
            </span>
            <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-full border border-white/10 text-white/30 font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all disabled:opacity-20">
              Next →
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 mt-10">
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
