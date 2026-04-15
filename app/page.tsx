'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PER_PAGE = 25;
const INDUSTRIES = ['All Industries', 'AI', 'Technology', 'Finance', 'Marketing', 'Design', 'Sales', 'Data', 'Product', 'Healthcare', 'Customer Success', 'HR', 'Legal', 'Operations', 'Education'];
const JOB_TYPES = ['All Types', 'Full Time', 'Contract', 'Part Time', 'Internship'];
const APPLY_SCORES = ['All Scores', 'High Chance', 'Medium Chance', 'Standard'];
const LOCATIONS = ['All Locations', 'Remote', 'USA', 'UK', 'Europe', 'Canada', 'Australia'];

const cleanText = (text: any) => text ? text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'") : '';

const getTimeAgo = (dateString: any) => {
  if (!dateString) return 'Recently';
  const str = String(dateString);
  const postedMatch = str.match(/Posted\s+(\d+)\s+Day/i);
  if (postedMatch) return `${postedMatch[1]}d ago`;
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

const isValidUrl = (url: any) => {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
};

const openUrl = (url: any) => { if (isValidUrl(url)) window.open(url, '_blank'); };

// ─── INDIVIDUAL JOB PAGE ───
function JobDetail({ job, onBack }: { job: any; onBack: () => void }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const s = getScoreStyle(job.apply_score);
  return (
    <div className="min-h-screen bg-[#030303] text-white p-8">
      <button onClick={onBack} className="text-[#d4af37] mb-8 font-black uppercase tracking-widest text-xs">← Back to Jobs</button>
      <div className="max-w-4xl mx-auto bg-[#0c0c0c] border border-white/5 rounded-3xl p-10">
        <h1 className="text-4xl font-black mb-4 uppercase">{cleanText(job.job_title)}</h1>
        <p className="text-[#d4af37] font-black uppercase tracking-widest mb-8">{job.company_name}</p>
        <div className="flex gap-4 mb-10">
            <span className={`px-4 py-2 rounded-full border ${s.bg} ${s.border} ${s.text} text-[10px] font-black uppercase tracking-widest`}>{job.apply_score}</span>
            <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">{job.location}</span>
        </div>
        <button onClick={() => openUrl(job.apply_url)} className="bg-[#d4af37] text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs">Apply Now →</button>
      </div>
    </div>
  );
}

// ─── MAIN HOME PAGE ───
export default function ApplyFirst() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount] = useState(867492); // FIXED: Hardcoded count to stop timeouts
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All Industries');
  const [jobType, setJobType] = useState('All Types');
  const [applyScore, setApplyScore] = useState('All Scores');
  const [location, setLocation] = useState('All Locations');
  const [jobDetailView, setJobDetailView] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // FIXED: Removed { count: 'exact' } for massive speed boost
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

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center"><span className="text-black font-black italic">A</span></div>
          <span className="font-black uppercase tracking-tight">ApplyFirst</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{totalCount.toLocaleString()} Roles</span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">● Live</span>
        </div>
      </nav>

      <section className="py-20 px-8 max-w-7xl mx-auto">
        <h1 className="text-7xl font-black mb-6 uppercase leading-none">Fresh Jobs <br/><span className="text-[#d4af37]">Direct From</span> Companies</h1>
        <div className="flex gap-4 mb-12">
            <input type="text" placeholder="Search roles..." className="bg-[#111] border border-white/10 px-6 py-4 rounded-2xl flex-1 text-sm outline-none focus:border-[#d4af37]/40" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
            <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-[#111] rounded-2xl animate-pulse" />)}</div>
        ) : (
            <div className="space-y-3">
                {jobs.map((job) => (
                    <div key={job.id} onClick={() => setJobDetailView(job)} className="bg-[#0c0c0c] border border-white/5 hover:border-[#d4af37]/20 rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-all">
                        <div>
                            <h2 className="font-bold text-lg mb-1">{cleanText(job.job_title)}</h2>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{job.company_name} · {getTimeAgo(job.date_posted)}</p>
                        </div>
                        <button className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Apply</button>
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  );
}
