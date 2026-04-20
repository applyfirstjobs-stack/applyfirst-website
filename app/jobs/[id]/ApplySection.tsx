'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

const cleanText = (text: any) => {
  if (!text) return '';
  return String(text).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
};

const getTimeAgo = (dateString: any) => {
  if (!dateString) return 'Recently';
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

const isValidUrl = (url: any): boolean => {
  if (!url) return false;
  const str = String(url).trim();
  if (str === '' || str === 'null' || str === 'None' || str === 'undefined') return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch { return false; }
};

const getScoreStyle = (score: string) => {
  if (score === 'High Chance')
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' };
  if (score === 'Medium Chance')
    return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber.400' };
  return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/30', dot: 'bg-white/20' };
};

export default function ApplySection({ job }: { job: any }) {
  const [email, setEmail] = useState('');
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noUrlError, setNoUrlError] = useState(false);

  const s = getScoreStyle(job.apply_score);
  const hasUrl = isValidUrl(job.apply_url);

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
    window.open(String(job.apply_url).trim(), '_blank');
  };

  const handleOpenAgain = () => {
    if (!hasUrl) { setNoUrlError(true); return; }
    window.open(String(job.apply_url).trim(), '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
          {job.company_website && (
            <a href={job.company_website} target="_blank" rel="noopener noreferrer"
              className="block w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all text-center">
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
  );
}
