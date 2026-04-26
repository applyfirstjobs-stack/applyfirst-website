import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ApplySection from './ApplySection';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

interface Props {
  params: { id: string };
}

const cleanText = (text: any) => {
  if (!text) return '';
  return String(text)
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

function isOlderThan30Days(dateString: any): boolean {
  if (!dateString) return false;
  const date = new Date(String(dateString));
  if (isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > 30 * 24 * 60 * 60 * 1000;
}

export async function generateMetadata({ params }: Props) {
  const { data: job } = await supabase
    .from('jobs')
    .select('job_title, company_name, location, description')
    .eq('id', params.id)
    .single();

  if (!job) {
    return {
      title: 'ApplyFirst — Fresh Jobs',
      description: 'Browse fresh jobs on ApplyFirst.',
    };
  }

  return {
    title: `${job.job_title} at ${job.company_name} — ApplyFirst`,
    description: job.description
      ? cleanText(job.description).slice(0, 160)
      : `Apply for ${job.job_title} at ${job.company_name}${job.location ? ` in ${job.location}` : ''}. Fresh job listing on ApplyFirst.`,
  };
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 bg-[#d4af37] rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-sm italic">A</span>
          </div>
          <span className="font-black text-base text-white tracking-tight uppercase">ApplyFirst</span>
        </a>
        <a href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
          ← All Jobs
        </a>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div className="w-7 h-7 bg-[#d4af37] rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xs italic">A</span>
          </div>
          <span className="text-white/30 text-xs font-black uppercase tracking-widest">ApplyFirst — Job Intelligence</span>
        </a>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <span>·</span>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          <span>·</span>
          <span>© 2026 ApplyFirst</span>
        </div>
      </div>
    </footer>
  );
}

function RelatedJobCard({ r }: { r: any }) {
  const rs = getScoreStyle(r.apply_score);
  return (
    <a href={`/jobs/${r.id}`}
      className="flex items-center gap-4 bg-[#0c0c0c] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl p-5 transition-all group">
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
    </a>
  );
}

export default async function JobPage({ params }: Props) {
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!job) notFound();

  const cutoff = new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString();
  const { data: relatedRaw } = await supabase
    .from('jobs')
    .select('id, job_title, company_name, location, apply_score, date_posted, created_at, industry, apply_url')
    .eq('industry', job.industry || 'Technology')
    .neq('id', params.id)
    .gte('created_at', cutoff)
    .not('apply_url', 'is', null)
    .neq('apply_url', '')
    .order('created_at', { ascending: false })
    .limit(12);

  const relatedJobs = (relatedRaw || []).filter((r) => isValidUrl(r.apply_url)).slice(0, 6);
  const expired = isOlderThan30Days(job.date_posted || job.created_at);
  const s = getScoreStyle(job.apply_score);

  if (expired) {
    return (
      <div className="min-h-screen bg-[#030303] text-white">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-20">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-12 mb-12 text-center">
            <p className="text-5xl mb-6">⏰</p>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
              This Role May Be Filled
            </h1>
            <p className="text-white/40 mb-3 max-w-md mx-auto">
              <span className="text-white/60 font-bold">{cleanText(job.job_title)}</span> at{' '}
              <span className="text-white/60 font-bold">{cleanText(job.company_name)}</span> was posted
              over 30 days ago and may no longer be available.
            </p>
            <p className="text-white/25 mb-8 text-sm max-w-md mx-auto">
              Browse fresh listings below — updated daily from 21,000+ company career pages.
            </p>
            <a href="/"
              className="inline-block bg-[#d4af37] text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
              Browse Fresh Jobs →
            </a>
          </div>
          {relatedJobs.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">
                🔥 Fresh {job.industry} Jobs
              </h2>
              <div className="space-y-3">
                {relatedJobs.map((r) => <RelatedJobCard key={r.id} r={r} />)}
              </div>
              <div className="mt-8 text-center">
                <a href="/"
                  className="inline-block border border-white/10 text-white/30 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all">
                  Browse All Jobs →
                </a>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#d4af37] selection:text-black">
      <Nav />
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
                <p className="text-white/50 leading-relaxed text-sm whitespace-pre-wrap">{cleanText(job.description)}</p>
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
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">
                  🔥 Fresh {job.industry} Roles
                </h2>
                <div className="space-y-2">
                  {relatedJobs.map((r) => <RelatedJobCard key={r.id} r={r} />)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <ApplySection job={job} />
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8 text-center">
              <p className="text-2xl mb-4">📬</p>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Get Weekly Alerts</h4>
              <p className="text-white/25 text-xs mb-5">Fresh {job.industry} roles every Monday</p>
              <a href="/"
                className="inline-block bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37]/20 transition-all">
                Browse All Jobs
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
