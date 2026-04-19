'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Move these to Vercel Environment Variables later for security!
const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Keep your key here for now
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. This tells Vercel to refresh the data every hour
export const revalidate = 3600; 

const cleanText = (text: any) => {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'");
};

const getTimeAgo = (dateString: any) => {
  if (!dateString) return 'Recently';
  const str = String(dateString);
  const postedMatch = str.match(/Posted\s+(\d+)\s+Day/i);
  if (postedMatch) return `${postedMatch[1]}d ago`;
  if (str.toLowerCase().includes('today')) return 'Today';
  if (str.toLowerCase().includes('yesterday')) return 'Yesterday';
  const hourMatch = str.match(/(\d+)\s+hour/i);
  if (hourMatch) return `${hourMatch[1]}h ago`;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const diff = new Date().getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (hours < 1) return 'Just Posted';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

const getScoreStyle = (score: string) => {
  if (score === 'High Chance') return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' };
  if (score === 'Medium Chance') return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' };
  return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/30', dot: 'bg-white/20' };
};

const isValidUrl = (url: any): boolean => {
  if (!url) return false;
  const str = String(url).trim();
  if (str === '' || str === 'null' || str === 'None' || str === 'undefined') return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch { return false; }
};

const openUrl = (url: any) => {
  if (!isValidUrl(url)) return false;
  window.open(String(url).trim(), '_blank');
  return true;
};

const INDUSTRIES = ['All Industries', 'AI', 'Technology', 'Finance', 'Marketing', 'Design', 'Sales', 'Data', 'Product', 'Healthcare', 'Customer Success', 'HR', 'Legal', 'Operations', 'Education', 'Logistics', 'Manufacturing', 'Hospitality', 'Retail'];
const JOB_TYPES = ['All Types', 'Full Time', 'Contract', 'Part Time', 'Internship'];
const APPLY_SCORES = ['All Scores', 'High Chance', 'Medium Chance', 'Standard'];
const LOCATIONS = ['All Locations', 'Remote', 'USA', 'UK', 'Europe', 'Canada', 'Australia'];
const PER_PAGE = 25;

// --- INDIVIDUAL JOB PAGE ---
function JobDetail({ job, onBack }: { job: any; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState<any[]>([]);
  const [viewJob, setViewJob] = useState<any>(null);
  const [noUrlError, setNoUrlError] = useState(false);
  const s = getScoreStyle(job.apply_score);
  const hasUrl = isValidUrl(job.apply_url);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${job.job_title} at ${job.company_name} — ApplyFirst`;
    window.history.pushState({}, '', `/jobs/${job.id}`);
    const handlePopState = () => { onBack(); };
    window.addEventListener('popstate', handlePopState);

    async function loadRelated() {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('jobs')
        .select('id,job_title,company_name,industry,apply_score,date_posted,created_at,apply_url,location')
        .eq('industry', job.industry)
        .neq('id', job.id)
        .gte('created_at', cutoff)
        .not('apply_url', 'is', null)
        .neq('apply_url', '')
        .order('created_at', { ascending: false })
        .limit(12);
      const validJobs = (data || []).filter(r => isValidUrl(r.apply_url));
      setRelatedJobs(validJobs.slice(0, 4));
    }
    if (job.industry) loadRelated();
    return () => {
      document.title = 'ApplyFirst — Fresh Jobs Direct From Companies';
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState({}, '', '/');
    };
  }, [job.id]);

  if (viewJob) return <JobDetail job={viewJob} onBack={() => setViewJob(null)} />;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasUrl) { setNoUrlError(true); return; }
    setSubmitting(true);
    try {
      await supabase.from('leads').insert([{ email, job_title: job.job_title, company_name: job.company_name, source: 'job_page' }]);
    } catch { }
    setApplied(true);
    setSubmitting(false);
    openUrl(job.apply_url);
  };

  const handleOpenAgain = () => { if (!openUrl(job.apply_url)) setNoUrlError(true); };
  const handleCopy = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#d4af37] selection:text-black">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-8 h-8 bg-[#d4af37] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm italic">A</span>
            </div>
            <span className="font-black text-base text-white tracking-tight uppercase">ApplyFirst</span>
          </button>
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"> ← All Jobs </button>
        </div>
      </nav>
      {/* ... (Job Detail Content) ... */}
    </div>
  );
}

// --- MAIN HOME PAGE ---
export default function ApplyFirst() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All Industries');
  const [jobType, setJobType] = useState('All Types');
  const [applyScore, setApplyScore] = useState('All Scores');
  const [location, setLocation] = useState('All Locations');
  const [showFilters, setShowFilters] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyEmail, setApplyEmail] = useState('');
  const [applying, setApplying] = useState(false);
  const [jobDetailView, setJobDetailView] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

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

    async function loadCount() {
      // FIX: Using head: true and count: estimated for speed with 3M+ rows
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'estimated', head: true });
      if (count) setTotalCount(count);
    }

    load();
    if (page === 1) loadCount();
  }, [search, industry, jobType, applyScore, location, page]);

  if (jobDetailView) {
    return <JobDetail job={jobDetailView} onBack={() => { setJobDetailView(null); setSelectedJob(null); }} />;
  }

  // --- RENDERING LOGIC ---
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#d4af37] selection:text-black">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#d4af37] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <span className="text-black font-black text-base italic">A</span>
            </div>
            <div className="leading-none">
              <p className="font-black text-lg text-white tracking-tight uppercase">ApplyFirst</p>
              <p className="text-[8px] text-[#d4af37]/50 font-bold uppercase tracking-[0.25em]">Job Intelligence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-1.5 rounded-full">
              {totalCount.toLocaleString()} Roles
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">● Live</span>
          </div>
        </div>
      </nav>
      {/* ... Rest of your Hero and Job List components ... */}
    </div>
  );
}
