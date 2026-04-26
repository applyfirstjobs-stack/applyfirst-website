'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  if (score === 'High Chance')
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' };
  if (score === 'Medium Chance')
    return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' };
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

const INDUSTRIES = [
  'All Industries', 'AI', 'Technology', 'Finance', 'Marketing',
  'Design', 'Sales', 'Data', 'Product', 'Healthcare',
  'Customer Success', 'HR', 'Legal', 'Operations', 'Education',
  'Logistics', 'Manufacturing', 'Hospitality', 'Retail',
];
const JOB_TYPES = ['All Types', 'Full Time', 'Contract', 'Part Time', 'Internship'];
const APPLY_SCORES = ['All Scores', 'High Chance', 'Medium Chance', 'Standard'];
const LOCATIONS = ['All Locations', 'Remote', 'USA', 'UK', 'Europe', 'Canada', 'Australia'];
const PER_PAGE = 25;

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
    if (job.id) window.history.pushState({}, '', `/jobs/${job.id}`);
    const handlePopState = () => { onBack(); };
    window.addEventListener('popstate', handlePopState);

    async function loadRelated() {
      const { data } = await supabase
        .from('jobs')
        .select('id,job_title,company_name,industry,apply_score,date_posted,created_at,apply_url,location')
        .eq('industry', job.industry)
        .neq('id', job.id)
        .not('apply_url', 'is', null)
        .neq('apply_url', '')
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(12);
      const validJobs = (data || []).filter(r => isValidUrl(r.apply_url));
      setRelatedJobs(validJobs.slice(0, 6));
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
      await supabase.from('leads').insert([{
        email, job_title: job.job_title, company_name: job.company_name, source: 'job_page',
      }]);
    } catch {}
    setApplied(true);
    setSubmitting(false);
    openUrl(job.apply_url);
  };

  const handleOpenAgain = () => { if (!openUrl(job.apply_url)) setNoUrlError(true); };
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            ← All Jobs
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-[#d4af37] font-black text-3xl uppercase">{job.company_name?.[0] || 'A'}</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 uppercase tracking-tight">
                    {cleanText(job.job_title)}
                  </h1>
                  <p className="text-[#d4af37]/70 font-black uppercase tracking-[0.2em] text-sm">
                    {cleanText(job.company_name)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.apply_score && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${s.bg} ${s.border}`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${s.dot}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${s.text}`}>{job.apply_score}</span>
                  </div>
                )}
                {job.job_type && (
                  <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{job.job_type}</span>
                  </div>
                )}
                {job.industry && job.industry !== 'Other' && (
                  <div className="px-4 py-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]/60">{job.industry}</span>
                  </div>
                )}
                {job.location && (
                  <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">📍 {job.location}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="px-4 py-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]/80">💰 {job.salary}</span>
                  </div>
                )}
                <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    🕐 {getTimeAgo(job.date_posted || job.created_at)}
                  </span>
                </div>
                {job.source && (
                  <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">via {job.source}</span>
                  </div>
                )}
              </div>
            </div>

            {job.description && (
              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/40 mb-5">About This Role</h2>
                <p className="text-white/50 leading-relaxed text-sm">{cleanText(job.description)}</p>
              </div>
            )}

            {(job.funding_amount || job.funding_round) && (
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/40 mb-6">💰 Funding Intelligence</h2>
                <div className="flex flex-wrap gap-8 mb-4">
                  {job.funding_amount && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Amount Raised</p>
                      <p className="text-4xl font-black text-[#d4af37]">{job.funding_amount}</p>
                    </div>
                  )}
                  {job.funding_round && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Stage</p>
                      <p className="text-4xl font-black text-white">{job.funding_round}</p>
                    </div>
                  )}
                </div>
                <p className="text-white/25 text-xs">Funded companies hire fast. Apply while positions are fresh.</p>
              </div>
            )}

            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/50 mb-6">⚡ Why Apply Now</h2>
              <div className="space-y-4">
                {[
                  { icon: '🎯', title: 'Fresh Listing', desc: `This role was posted ${getTimeAgo(job.date_posted || job.created_at)}. Earlier applicants get more attention.` },
                  { icon: '🔄', title: 'Updated Daily', desc: 'ApplyFirst refreshes job data automatically so you never miss a fresh opening.' },
                  { icon: '🏢', title: 'Direct From Company', desc: 'This listing links directly to the official company careers page — no middlemen.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-tight mb-1">{item.title}</p>
                      <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {relatedJobs.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">🔥 Fresh {job.industry} Roles</h2>
                <div className="space-y-2">
                  {relatedJobs.map((r) => {
                    const rs = getScoreStyle(r.apply_score);
                    return (
                      <div key={r.id} onClick={() => r.id && setViewJob(r)}
                        className="flex items-center gap-4 bg-[#0c0c0c] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl p-5 transition-all group cursor-pointer">
                        <div className="w-10 h-10 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-[#d4af37] font-black text-sm uppercase">{r.company_name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">{cleanText(r.job_title)}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
                            {cleanText(r.company_name)}{r.location ? ` · 📍 ${r.location}` : ''} · {getTimeAgo(r.date_posted || r.created_at)}
                          </p>
                        </div>
                        {r.apply_score && (
                          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${rs.bg} ${rs.border} ${rs.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                            {r.apply_score === 'High Chance' ? 'Hot' : 'Active'}
                          </div>
                        )}
                        <span className="text-white/20 group-hover:text-[#d4af37] transition-colors">→</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 sticky top-24">
              {job.apply_score && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border w-fit mb-6 ${s.bg} ${s.border}`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${s.dot}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${s.text}`}>{job.apply_score}</span>
                </div>
              )}
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Apply Now</h3>
              {!hasUrl ? (
                <div className="space-y-4">
                  <p className="text-white/25 text-xs mb-4 leading-relaxed">
                    Direct link unavailable. Search for <strong className="text-white/40">{cleanText(job.job_title)}</strong> on {cleanText(job.company_name)}&apos;s careers page.
                  </p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                    <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">⚠ Direct link unavailable</p>
                  </div>
                </div>
              ) : !applied ? (
                <form onSubmit={handleApply} className="space-y-3">
                  <p className="text-white/25 text-xs mb-6 leading-relaxed">
                    Enter your email and we&apos;ll open the official career page at {cleanText(job.company_name)}.
                  </p>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#111] border border-white/10 px-5 py-4 rounded-2xl outline-none text-sm text-white placeholder:text-white/20 focus:border-[#d4af37]/30 transition-all" />
                  <button type="submit" disabled={submitting}
                    className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all disabled:opacity-50">
                    {submitting ? 'Opening...' : 'Apply Now →'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-4xl">✅</div>
                  <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Application page opened!</p>
                  <button onClick={handleOpenAgain}
                    className="w-full border border-white/10 text-white/40 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all">
                    Open Again →
                  </button>
                </div>
              )}
              {noUrlError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center">
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">No application link available</p>
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                {[
                  { label: 'Source', value: job.source || 'Direct' },
                  { label: 'Posted', value: getTimeAgo(job.date_posted || job.created_at) },
                  { label: 'Type', value: job.job_type || 'Full Time' },
                  ...(job.salary ? [{ label: 'Salary', value: job.salary }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">{item.label}</span>
                    <span className="text-white/50">{item.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleCopy}
                className="mt-6 w-full border border-white/10 text-white/30 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all">
                {copied ? '✅ Link Copied!' : '🔗 Copy Job Link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-[#d4af37] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xs italic">A</span>
            </div>
            <span className="text-white/20 text-xs font-black uppercase tracking-widest">ApplyFirst</span>
          </button>
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
            ← Browse All Jobs
          </button>
        </div>
      </footer>
    </div>
  );
}

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
        .select('id,job_title,company_name,location,job_type,apply_score,date_posted,created_at,industry,apply_url,salary,source,description,funding_amount,funding_round')
        .not('id', 'is', null)
        .order('created_at', { ascending: false, nullsFirst: false });

      if (search) q = q.or(`job_title.ilike.%${search}%,company_name.ilike.%${search}%`);
      if (industry !== 'All Industries') q = q.eq('industry', industry);
      if (jobType !== 'All Types') q = q.eq('job_type', jobType);
      if (applyScore !== 'All Scores') q = q.eq('apply_score', applyScore);
      if (location !== 'All Locations') q = q.ilike('location', `%${location}%`);
      q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
      const { data } = await q;
      setJobs((data || []).filter(j => j.id));
      setLoading(false);
    }

    async function loadCount() {
      try {
        const { count } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true });
        if (count !== null) { setTotalCount(count); return; }
      } catch {}
    }

    load();
    if (page === 1) loadCount();
  }, [search, industry, jobType, applyScore, location, page]);

  if (jobDetailView) {
    return <JobDetail job={jobDetailView} onBack={() => { setJobDetailView(null); setSelectedJob(null); }} />;
  }

  const activeFilters = [
    industry !== 'All Industries', jobType !== 'All Types',
    applyScore !== 'All Scores', location !== 'All Locations',
  ].filter(Boolean).length;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const resetFilters = () => {
    setIndustry('All Industries'); setJobType('All Types');
    setApplyScore('All Scores'); setLocation('All Locations');
    setSearch(''); setPage(1);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await supabase.from('lead
