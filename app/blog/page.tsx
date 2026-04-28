'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

const CATEGORIES = ['All', 'Hiring Trends', 'Salary Insights', 'Remote Work', 'Company Hiring', 'Global Markets'];
const PER_PAGE = 20;

export default function BlogPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from('articles')
        .select('title, slug, excerpt, category, published_at', { count: 'exact' })
        .order('published_at', { ascending: false });

      if (category !== 'All') q = q.eq('category', category);
      q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      const { data, count } = await q;
      setArticles(data || []);
      setTotal(count || 0);
      setLoading(false);
    }
    load();
  }, [category, page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const getCategoryColor = (cat: string) => {
    const colors: any = {
      'Hiring Trends': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      'Salary Insights': 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20',
      'Remote Work': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      'Company Hiring': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      'Global Markets': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    };
    return colors[cat] || 'text-white/40 bg-white/5 border-white/10';
  };

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
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <Link href="/" className="text-white/30 hover:text-white transition-colors">Jobs</Link>
            <span className="text-white/10">·</span>
            <Link href="/salary" className="text-white/30 hover:text-white transition-colors">Salaries</Link>
            <span className="text-white/10">·</span>
            <span className="text-[#d4af37]">Blog</span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="border-b border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Updated Daily</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            Job Market<br /><span className="text-[#d4af37]">Intelligence</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed">
            Data-driven insights on hiring trends, salaries and the global job market — powered by real data from 546,000+ live job listings.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                category === cat
                  ? 'bg-[#d4af37] text-black border-[#d4af37]'
                  : 'text-white/40 border-white/10 hover:border-[#d4af37]/30 hover:text-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
          {loading ? 'Loading...' : `${total.toLocaleString()} articles`}
        </p>
      </div>

      {/* ARTICLES */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-[#111] animate-pulse" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">📰</p>
            <p className="text-white/30 font-black uppercase tracking-widest text-sm">No articles yet</p>
            <p className="text-white/20 text-xs mt-2">Check back tomorrow — we publish daily</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`}
                className="group bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl p-6 transition-all duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                    {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-tight mb-3">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-white/30 text-sm leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37]/50 group-hover:text-[#d4af37] transition-colors">
                  Read Article →
                </div>
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
      <footer className="border-t border-white/5">
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
