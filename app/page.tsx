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

  // Handle Workday's text format e.g. "Posted 2 Days Ago"
  const str = String(dateString);
  const postedMatch = str.match(/Posted\s+(\d+)\s+Day/i);
  if (postedMatch) return `${postedMatch[1]}d ago`;
  if (str.toLowerCase().includes('today')) return 'Today';
  if (str.toLowerCase().includes('yesterday')) return 'Yesterday';
  const hourMatch = str.match(/(\d+)\s+hour/i);
  if (hourMatch) return `${hourMatch[1]}h ago`;

  // Handle real date strings
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
    return {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
    };
  if (score === 'Medium Chance')
    return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
    };
  return {
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-white/30',
    dot: 'bg-white/20',
  };
};

// ─── URL VALIDATION ────────────────────────────────────────────────────────
const isValidUrl = (url: any): boolean => {
  if (!url) return false;
  const str = String(url).trim();
  if (str === '' || str === 'null' || str === 'None' || str === 'undefined') return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
];
const JOB_TYPES = ['All Types', 'Full Time', 'Contract', 'Part Time', 'Internship'];
const APPLY_SCORES = ['All Scores', 'High Chance', 'Medium Chance', 'Standard'];
const LOCATIONS = ['All Locations', 'Remote', 'USA', 'UK', 'Europe', 'Canada', 'Australia'];
const PER_PAGE = 25;

// ─── INDIVIDUAL JOB PAGE ──────────────────────────────────────────────────
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

    // Handle browser back button
    const handlePopState = () => {
      onBack();
    };
    window.addEventListener('popstate', handlePopState);

    async function loadRelated() {
      const { data } = await supabase
        .from('jobs')
        .select('id,job_title,company_name,industry,apply_score,date_posted,created_at')
        .eq('industry', job.industry)
        .neq('id', job.id)
        .order('created_at', { ascending: false })
        .limit(4);
      setRelatedJobs(data || []);
    }
    if (job.industry) loadRelated();

    return () => {
      document.title = 'ApplyFirst — Fresh Remote Jobs Updated Every 6 Hours';
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState({}, '', '/');
    };
  }, [job.id]);

  if (viewJob) return <JobDetail job={viewJob} onBack={() => setViewJob(null)} />;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasUrl) {
      setNoUrlError(true);
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from('leads').insert([{
        email,
        job_title: job.job_title,
        company_name: job.company_name,
        source: 'job_page',
      }]);
    } catch {}
    setApplied(true);
    setSubmitting(false);
    openUrl(job.apply_url);
  };

  const handleOpenAgain = () => {
    if (!openUrl(job.apply_url)) {
      setNoUrlError(true);
    }
  };

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
            {/* HEADER */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-[#d4af37] font-black text-3xl uppercase">
                    {job.company_name?.[0] || 'A'}
                  </span>
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

            {/* DESCRIPTION */}
            {job.description && (
              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/40 mb-5">About This Role</h2>
                <p className="text-white/50 leading-relaxed text-sm">{cleanText(job.description)}</p>
              </div>
            )}

            {/* FUNDING */}
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

            {/* WHY APPLY NOW */}
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/50 mb-6">⚡ Why Apply Now</h2>
              <div className="space-y-4">
                {[
                  { icon: '🎯', title: 'Fresh Listing', desc: `This role was posted ${getTimeAgo(job.date_posted || job.created_at)}. Earlier applicants get more attention.` },
                  { icon: '🔄', title: 'Updated Every 6 Hours', desc: 'ApplyFirst refreshes job data automatically so you never miss a fresh opening.' },
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

            {/* RELATED JOBS */}
            {relatedJobs.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">More {job.industry} Roles</h2>
                <div className="space-y-2">
                  {relatedJobs.map((r) => {
                    const rs = getScoreStyle(r.apply_score);
                    return (
                      <div
                        key={r.id}
                        onClick={() => setViewJob(r)}
                        className="flex items-center gap-4 bg-[#0c0c0c] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl p-5 transition-all group cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-[#d4af37] font-black text-sm uppercase">{r.company_name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">{cleanText(r.job_title)}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
                            {cleanText(r.company_name)} · {getTimeAgo(r.date_posted || r.created_at)}
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

          {/* SIDEBAR */}
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
                /* NO URL — show message instead of apply form */
                <div className="space-y-4">
                  <p className="text-white/25 text-xs mb-4 leading-relaxed">
                    The direct application link for this role is not available. Search for <strong className="text-white/40">{cleanText(job.job_title)}</strong> on {cleanText(job.company_name)}'s careers page.
                  </p>
                  {job.company_website && (
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all text-center"
                    >
                      Visit Company Website →
                    </a>
                  )}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                    <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">⚠ Direct link unavailable</p>
                  </div>
                </div>
              ) : !applied ? (
                <form onSubmit={handleApply} className="space-y-3">
                  <p className="text-white/25 text-xs mb-6 leading-relaxed">
                    Enter your email and we'll open the official career page at {cleanText(job.company_name)}.
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#111] border border-white/10 px-5 py-4 rounded-2xl outline-none text-sm text-white placeholder:text-white/20 focus:border-[#d4af37]/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Opening...' : 'Apply Now →'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-4xl">✅</div>
                  <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Application page opened!</p>
                  <button
                    onClick={handleOpenAgain}
                    className="w-full border border-white/10 text-white/40 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all"
                  >
                    Open Again →
                  </button>
                </div>
              )}

              {noUrlError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center">
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">No application link available for this role</p>
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
              <button
                onClick={handleCopy}
                className="mt-6 w-full border border-white/10 text-white/30 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all"
              >
                {copied ? '✅ Link Copied!' : '🔗 Copy Job Link'}
              </button>
            </div>
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8 text-center">
              <p className="text-2xl mb-4">📬</p>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Get Weekly Alerts</h4>
              <p className="text-white/25 text-xs mb-5">Fresh {job.industry} roles every Monday</p>
              <button
                onClick={onBack}
                className="inline-block bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37]/20 transition-all"
              >
                Browse All Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 bg-[#d4af37] rounded-lg flex items-center justify-center">
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

// ─── MAIN HOME PAGE ────────────────────────────────────────────────────────
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
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (search) q = q.or(`job_title.ilike.%${search}%,company_name.ilike.%${search}%`);
      if (industry !== 'All Industries') q = q.eq('industry', industry);
      if (jobType !== 'All Types') q = q.eq('job_type', jobType);
      if (applyScore !== 'All Scores') q = q.eq('apply_score', applyScore);
      if (location !== 'All Locations') q = q.ilike('location', `%${location}%`);
      q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
      const { data, count } = await q;
      setJobs(data || []);
      setTotalCount(count || 0);
      setLoading(false);
    }
    load();
  }, [search, industry, jobType, applyScore, location, page]);

  if (jobDetailView) {
    return (
      <JobDetail
        job={jobDetailView}
        onBack={() => { setJobDetailView(null); setSelectedJob(null); }}
      />
    );
  }

  const activeFilters = [
    industry !== 'All Industries',
    jobType !== 'All Types',
    applyScore !== 'All Scores',
    location !== 'All Locations',
  ].filter(Boolean).length;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const resetFilters = () => {
    setIndustry('All Industries');
    setJobType('All Types');
    setApplyScore('All Scores');
    setLocation('All Locations');
    setSearch('');
    setPage(1);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('leads').insert([{ email: alertEmail, source: 'homepage_alert' }]);
    } catch {}
    setSubscribed(true);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!isValidUrl(selectedJob.apply_url)) {
      alert('Sorry, no direct application link is available for this role. Please visit the company website directly.');
      setSelectedJob(null);
      return;
    }
    setApplying(true);
    try {
      await supabase.from('leads').insert([{
        email: applyEmail,
        job_title: selectedJob.job_title,
        company_name: selectedJob.company_name,
        source: 'apply_modal',
      }]);
    } catch {}
    openUrl(selectedJob.apply_url);
    setSelectedJob(null);
    setApplyEmail('');
    setApplying(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#d4af37] selection:text-black">
      {/* NAV */}
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
          <button
            onClick={() => document.getElementById('get-alerts')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#d4af37] text-black px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shrink-0"
          >
            Get Alerts
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.07),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 relative">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Updated Every 6 Hours</span>
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black text-white leading-none tracking-tighter mb-6 uppercase">
              Fresh Remote<br />
              <span className="text-[#d4af37]">Jobs Direct</span><br />
              From Companies
            </h1>
            <p className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
              Jobs pulled directly from Stripe, OpenAI, Netflix, Notion and 100+ company career pages.
              <span className="text-white/60 font-bold"> Fresh listings updated automatically every 6 hours.</span>
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { color: 'text-emerald-400', dot: 'bg-emerald-400', label: 'High Chance — Posted Today' },
                { color: 'text-amber-400', dot: 'bg-amber-400', label: 'Active — This Week' },
                { color: 'text-white/30', dot: 'bg-white/20', label: 'Standard — Older' },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                  <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <div className="sticky top-16 z-40 bg-[#030303]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center bg-[#111] border border-white/10 rounded-2xl px-5 py-3 gap-3 focus-within:border-[#d4af37]/30 transition-all">
              <svg className="w-4 h-4 text-white/20 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search roles, companies, skills..."
                className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-white/20"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/20 hover:text-white text-sm">✕</button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                showFilters || activeFilters > 0
                  ? 'bg-[#d4af37] text-black border-[#d4af37]'
                  : 'bg-[#111] border-white/10 text-white/40 hover:border-white/20'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </button>
          </div>
          {showFilters && (
            <div className="pt-3 pb-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: industry, setter: setIndustry, options: INDUSTRIES },
                { value: jobType, setter: setJobType, options: JOB_TYPES },
                { value: applyScore, setter: setApplyScore, options: APPLY_SCORES },
                { value: location, setter: setLocation, options: LOCATIONS },
              ].map((f, i) => (
                <select
                  key={i}
                  value={f.value}
                  onChange={(e) => { f.setter(e.target.value); setPage(1); }}
                  className="bg-[#111] border border-white/10 text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#d4af37]/20 transition-all"
                >
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ))}
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="col-span-2 md:col-span-4 text-[10px] font-black uppercase tracking-widest text-[#d4af37]/50 hover:text-[#d4af37] transition-colors py-1"
                >
                  ✕ Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* COUNT */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          {loading ? 'Loading...' : `${totalCount.toLocaleString()} ${activeFilters > 0 || search ? 'Filtered' : 'Verified'} Roles`}
        </p>
        {totalPages > 1 && (
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Page {page} / {totalPages}</p>
        )}
      </div>

      {/* JOB LIST */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#111] animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-6">🔍</p>
            <p className="text-white/30 font-black uppercase tracking-widest text-sm mb-2">No matching roles</p>
            <button onClick={resetFilters} className="mt-4 text-[#d4af37] text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => {
              const sc = getScoreStyle(job.apply_score);
              const jobHasUrl = isValidUrl(job.apply_url);
              return (
                <div
                  key={job.id}
                  className="group bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all duration-200 cursor-pointer"
                  onClick={() => setJobDetailView(job)}
                >
                  <div className="w-12 h-12 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#d4af37]/25 transition-all">
                    <span className="text-[#d4af37] font-black text-lg uppercase">{job.company_name?.[0] || 'A'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors truncate leading-tight mb-1">
                      {cleanText(job.job_title)}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                      <span className="text-white/50">{cleanText(job.company_name)}</span>
                      {job.industry && job.industry !== 'Other' && (<><span>·</span><span className="text-[#d4af37]/50">{job.industry}</span></>)}
                      {job.job_type && (<><span>·</span><span>{job.job_type}</span></>)}
                      {job.location && (<><span>·</span><span>📍 {job.location}</span></>)}
                      {job.salary && (<><span>·</span><span className="text-[#d4af37]/60">💰 {job.salary}</span></>)}
                      <span>·</span>
                      <span>{getTimeAgo(job.date_posted || job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                    {job.apply_score && (
                      <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.border} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {job.apply_score === 'High Chance' ? 'Hot' : job.apply_score === 'Medium Chance' ? 'Active' : 'Standard'}
                      </div>
                    )}
                    {jobHasUrl ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                        className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setJobDetailView(job); }}
                        className="bg-white/10 text-white/40 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{page} / {totalPages}</span>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* GET ALERTS */}
      <section id="get-alerts" className="border-t border-white/5 bg-[#080808]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/20 px-5 py-2.5 rounded-full mb-10">
            <span className="text-[#d4af37]">📬</span>
            <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em]">Weekly Job Alerts</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6">
            Get Fresh Jobs<br /><span className="text-[#d4af37]">Every Monday</span>
          </h2>
          <p className="text-white/30 mb-10 max-w-md mx-auto leading-relaxed">
            Fresh remote jobs from top company career pages delivered to your inbox every Monday morning.
          </p>
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 bg-[#111] border border-white/10 px-6 py-4 rounded-full text-sm text-white outline-none focus:border-[#d4af37]/30 transition-all placeholder:text-white/20"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
              <button type="submit" className="bg-[#d4af37] text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
                Join Free
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">✅</span>
              <span className="text-emerald-400 font-black text-sm uppercase tracking-widest">You're in. See you Monday.</span>
            </div>
          )}
          <p className="text-white/20 text-xs mt-5">Free forever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${totalCount.toLocaleString()}+`, label: 'Verified Roles', color: 'text-[#d4af37]' },
            { value: '6hr', label: 'Update Cycle', color: 'text-emerald-400' },
            { value: '100+', label: 'Direct Sources', color: 'text-white' },
            { value: '30d', label: 'Max Job Age', color: 'text-[#d4af37]' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className={`text-4xl md:text-5xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

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
            <span>Jobs from public career pages</span>
            <span>·</span>
            <span>Updated every 6 hours</span>
            <span>·</span>
            <span>© 2026 ApplyFirst</span>
          </div>
        </div>
      </footer>

      {/* QUICK APPLY MODAL */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedJob(null); }}
        >
          <div className="bg-[#0c0c0c] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all text-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-[#d4af37] font-black text-2xl uppercase">{selectedJob.company_name?.[0] || 'A'}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white leading-tight truncate">{cleanText(selectedJob.job_title)}</h3>
                <p className="text-[#d4af37]/60 text-[10px] font-black uppercase tracking-widest mt-1">{cleanText(selectedJob.company_name)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedJob.apply_score && (() => {
                const sc = getScoreStyle(selectedJob.apply_score);
                return (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.border} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${sc.dot}`} />
                    {selectedJob.apply_score}
                  </div>
                );
              })()}
              {selectedJob.job_type && (
                <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                  {selectedJob.job_type}
                </div>
              )}
              {selectedJob.salary && (
                <div className="px-3 py-1.5 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[9px] font-black uppercase tracking-widest text-[#d4af37]/80">
                  💰 {selectedJob.salary}
                </div>
              )}
            </div>
            {selectedJob.description && (
              <p className="text-white/30 text-xs leading-relaxed mb-6 line-clamp-2">{cleanText(selectedJob.description)}</p>
            )}
            <form onSubmit={handleApply} className="space-y-3">
              <input
                type="email"
                required
                value={applyEmail}
                onChange={(e) => setApplyEmail(e.target.value)}
                placeholder="Enter your email to apply"
                className="w-full bg-[#111] border border-white/10 px-5 py-4 rounded-2xl outline-none text-sm text-white placeholder:text-white/20 focus:border-[#d4af37]/30 transition-all"
              />
              <button
                type="submit"
                disabled={applying}
                className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all disabled:opacity-50"
              >
                {applying ? 'Opening...' : 'Apply Now →'}
              </button>
            </form>
            <p className="text-white/20 text-[10px] text-center mt-4">Opens the official company careers page</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                onClick={() => { setJobDetailView(selectedJob); setSelectedJob(null); }}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#d4af37] transition-colors"
              >
                View Full Job Page →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
