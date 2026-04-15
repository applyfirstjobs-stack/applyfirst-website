'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INDUSTRIES = ['All Industries', 'AI', 'Technology', 'Finance', 'Marketing', 'Design', 'Sales', 'Data', 'Product', 'Healthcare', 'Customer Success', 'HR', 'Legal', 'Operations', 'Education'];
const JOB_TYPES = ['All Types', 'Full Time', 'Contract', 'Part Time', 'Internship'];
const APPLY_SCORES = ['All Scores', 'High Chance', 'Medium Chance', 'Standard'];
const LOCATIONS = ['All Locations', 'Remote', 'USA', 'UK', 'Europe', 'Canada', 'Australia'];
const PER_PAGE = 25;

const cleanText = (text: any) => text ? text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'") : '';

const getTimeAgo = (dateString: any) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const diff = new Date().getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return hours < 24 ? `${hours}h ago` : `${days}d ago`;
};

const getScoreStyle = (score: string) => {
  if (score === 'High Chance') return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' };
  if (score === 'Medium Chance') return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' };
  return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/30', dot: 'bg-white/20' };
};

const isValidUrl = (url: any) => { if (!url) return false; try { new URL(url); return true; } catch { return false; } };
const openUrl = (url: any) => { if (isValidUrl(url)) window.open(url, '_blank'); };

// ─── JOB DETAIL VIEW ───
function JobDetail({ job, onBack }: { job: any; onBack: () => void }) {
  const s = getScoreStyle(job.apply_score);
  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl h-16 flex items-center justify-between px-8">
        <button onClick={onBack} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="text-black font-black italic">A</span>
          </div>
          <span className="font-black uppercase tracking-tight">ApplyFirst</span>
        </button>
      </nav>
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase leading-tight">{cleanText(job.job_title)}</h1>
          <p className="text-[#d4af37] font-black uppercase tracking-[0.3em] mb-8">{job.company_name}</p>
          <div className="flex flex-wrap gap-3 mb-10">
            <span className={`px-4 py-2 rounded-full border ${s.bg} ${s.border} ${s.text} text-[10px] font-black uppercase tracking-widest`}>{job.apply_score}</span>
            <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">📍 {job.location}</span>
          </div>
          <button onClick={() => openUrl(job.apply_url)} className="bg-[#d4af37] text-black px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">Apply Now →</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function ApplyFirst() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount] = useState(867492); 
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All Industries');
  const [jobType, setJobType] = useState('All Types');
  const [applyScore, setApplyScore] = useState('All Scores');
  const [location, setLocation] = useState('All Locations');
  const [showFilters, setShowFilters] = useState(false);
  const [jobDetailView, setJobDetailView] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (search) q = q.or(`job_title.ilike.%${search}%,company_name.ilike.%${search}%`);
      if (industry !== 'All Industries') q = q.eq('industry', industry);
      if (jobType !== 'All Types') q = q.eq('job_type', jobType);
      if (applyScore !== 'All Scores') q = q.eq('apply_score', applyScore);
      if (location !== 'All Locations') q = q.ilike('location', `%${location}%`);
      q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
      const { data } = await q;
      setJobs(data || []);
      setLoading(false);
    }
    load();
  }, [search, industry, jobType, applyScore, location, page]);

  if (jobDetailView) return <JobDetail job={jobDetailView} onBack={() => setJobDetailView(null)} />;

  const activeFilters = [industry !== 'All Industries', jobType !== 'All Types', applyScore !== 'All Scores', location !== 'All Locations'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#d4af37] selection:text-black">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="text-black font-black italic">A</span>
          </div>
          <div className="leading-none">
            <p className="font-black text-lg uppercase tracking-tight">ApplyFirst</p>
            <p className="text-[8px] text-[#d4af37]/50 font-bold uppercase tracking-widest">Job Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{totalCount.toLocaleString()} Roles</span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">● Live</span>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-8 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.07),transparent)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-fit mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Updated Every 6 Hours</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black mb-6 uppercase leading-none tracking-tighter">Fresh Jobs<br/><span className="text-[#d4af37]">Direct From</span><br/>Companies</h1>
          <p className="text-white/40 text-xl max-w-2xl leading-relaxed font-medium">Jobs pulled directly from Stripe, OpenAI, Netflix, Notion and 400,000+ company career pages.</p>
        </div>
      </section>

      {/* SEARCH & FILTER BAR */}
      <div className="sticky top-16 z-40 bg-[#030303]/95 backdrop-blur-xl border-b border-white/5 py-4 px-8">
        <div className="max-w-7xl mx-auto flex gap-3">
          <div className="flex-1 flex items-center bg-[#111] border border-white/10 rounded-2xl px-6 py-4 gap-4 focus-within:border-[#d4af37]/30 transition-all">
            <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search roles, companies, skills..." className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-white/20" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`px-8 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${showFilters || activeFilters > 0 ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-[#111] border-white/10 text-white/40 hover:border-white/20'}`}>Filters {activeFilters > 0 ? `(${activeFilters})` : ''}</button>
        </div>
        {showFilters && (
            <div className="max-w-7xl mx-auto pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="bg-[#111] border border-white/10 text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#d4af37]/20">{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="bg-[#111] border border-white/10 text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#d4af37]/20">{JOB_TYPES.map(i => <option key={i} value={i}>{i}</option>)}</select>
                <select value={applyScore} onChange={(e) => setApplyScore(e.target.value)} className="bg-[#111] border border-white/10 text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#d4af37]/20">{APPLY_SCORES.map(i => <option key={i} value={i}>{i}</option>)}</select>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="bg-[#111] border border-white/10 text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#d4af37]/20">{LOCATIONS.map(i => <option key={i} value={i}>{i}</option>)}</select>
            </div>
        )}
      </div>

      {/* JOB FEED */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Verified Role Feed</p>
        </div>
        
        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-[#0c0c0c] border border-white/5 rounded-3xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const sc = getScoreStyle(job.apply_score);
              return (
                <div key={job.id} onClick={() => setJobDetailView(job)} className="group bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/20 rounded-3xl px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all cursor-pointer">
                  <div className="w-16 h-16 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-[#d4af37]/30 transition-all">
                    <span className="text-[#d4af37] font-black text-2xl uppercase">{job.company_name?.[0] || 'A'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold group-hover:text-[#d4af37] transition-colors truncate mb-1 leading-tight">{cleanText(job.job_title)}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-white/25">
                        <span className="text-white/40">{job.company_name}</span>
                        <span>·</span>
                        <span className="text-[#d4af37]/40">{job.industry}</span>
                        <span>·</span>
                        <span>📍 {job.location || 'Remote'}</span>
                        <span>·</span>
                        <span>{getTimeAgo(job.date_posted)}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.border} ${sc.text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${sc.dot}`} />
                    {job.apply_score}
                  </div>
                  <button className="bg-white text-black px-10 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">Apply</button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER STATS */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center"><span className="text-white/40 font-black text-[10px] italic">A</span></div>
                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">ApplyFirst © 2026 — Job Intelligence</span>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                <span>Updated every 6 hours</span>
                <span>·</span>
                <span>Direct Sources Only</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
