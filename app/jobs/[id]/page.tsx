import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const cleanText = (text: any) => {
  if (!text) return '';
  return String(text).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'");
};

const getTimeAgo = (dateString: any) => {
  if (!dateString) return 'Recently';
  const str = String(dateString);
  const m = str.match(/Posted\s+(\d+)\s+Day/i);
  if (m) return `${m[1]}d ago`;
  if (str.toLowerCase().includes('today')) return 'Today';
  if (str.toLowerCase().includes('yesterday')) return 'Yesterday';
  const h = str.match(/(\d+)\s+hour/i);
  if (h) return `${h[1]}h ago`;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just Posted';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

const isValidUrl = (url: any) => {
  if (!url) return false;
  const s = String(url).trim();
  if (['','null','None','undefined'].includes(s)) return false;
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
};

const scoreStyle = (score: string) => {
  if (score === 'High Chance') return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' };
  if (score === 'Medium Chance') return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' };
  return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/30', dot: 'bg-white/20' };
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: job } = await supabase.from('jobs').select('job_title,company_name,location,industry').eq('id', params.id).single();
  if (!job) return { title: 'Job Not Found — ApplyFirst' };
  return {
    title: `${job.job_title} at ${job.company_name} — ApplyFirst`,
    description: `Apply for ${job.job_title} at ${job.company_name}${job.location ? ` in ${job.location}` : ''}. Fresh remote job on ApplyFirst.`,
  };
}

export default async function JobPage({ params }: { params: { id: string } }) {
  const { data: job } = await supabase.from('jobs').select('*').eq('id', params.id).single();
  if (!job) notFound();

  const { data: related } = await supabase
    .from('jobs').select('id,job_title,company_name,apply_score,date_posted,created_at')
    .eq('industry', job.industry).neq('id', job.id)
    .order('created_at', { ascending: false }).limit(4);

  const hasUrl = isValidUrl(job.apply_url);
  const timeAgo = getTimeAgo(job.date_posted || job.created_at);
  const s = scoreStyle(job.apply_score);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-8 h-8 bg-[#d4af37] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm italic">A</span>
            </div>
            <span className="font-black text-base text-white tracking-tight uppercase">ApplyFirst</span>
          </Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">← All Jobs</Link>
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
                  <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 uppercase tracking-tight">{cleanText(job.job_title)}</h1>
                  <p className="text-[#d4af37]/70 font-black uppercase tracking-[0.2em] text-sm">{cleanText(job.company_name)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.apply_score && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${s.bg} ${s.border}`}>
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${s.text}`}>{job.apply_score}</span>
                  </div>
                )}
                {job.job_type && <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5"><span className="text-[10px] font-black uppercase tracking-widest text-white/40">{job.job_type}</span></div>}
                {job.industry && job.industry !== 'Other' && <div className="px-4 py-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5"><span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]/60">{job.industry}</span></div>}
                {job.location && <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5"><span className="text-[10px] font-black uppercase tracking-widest text-white/40">📍 {job.location}</span></div>}
                {job.salary && <div className="px-4 py-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5"><span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]/80">💰 {job.salary}</span></div>}
                <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5"><span className="text-[10px] font-black uppercase tracking-widest text-white/40">🕐 {timeAgo}</span></div>
                {job.source && <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5"><span className="text-[10px] font-black uppercase tracking-widest text-white/30">via {job.source}</span></div>}
              </div>
            </div>

            {job.description && (
              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/40 mb-5">About This Role</h2>
                <p className="text-white/50 leading-relaxed text-sm whitespace-pre-line">{cleanText(job.description)}</p>
              </div>
            )}

            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/50 mb-6">⚡ Why Apply Now</h2>
              <div className="space-y-4">
                {[
                  { icon: '🎯', title: 'Fresh Listing', desc: `Posted ${timeAgo}. Earlier applicants get more attention.` },
                  { icon: '🔄', title: 'Updated Every 6 Hours', desc: 'ApplyFirst refreshes job data so you never miss a fresh opening.' },
                  { icon: '🏢', title: 'Direct From Company', desc: 'Links directly to the official company careers page.' },
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

            {related && related.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">More {job.industry} Roles</h2>
                <div className="space-y-2">
                  {related.map((r) => {
                    const rs = scoreStyle(r.apply_score);
                    return (
                      <Link key={r.id} href={`/jobs/${r.id}`} className="flex items-center gap-4 bg-[#0c0c0c] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl p-5 transition-all group">
                        <div className="w-10 h-10 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-[#d4af37] font-black text-sm uppercase">{r.company_name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">{cleanText(r.job_title)}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/25">{cleanText(r.company_name)} · {getTimeAgo(r.date_posted || r.created_at)}</p>
                        </div>
                        <span className="text-white/20 group-hover:text-[#d4af37] transition-colors">→</span>
                      </Link>
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
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${s.text}`}>{job.apply_score}</span>
                </div>
              )}
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Apply Now</h3>
              {hasUrl ? (
                <div>
                  <p className="text-white/25 text-xs mb-6 leading-relaxed">Click below to go directly to {cleanText(job.company_name)}'s official career page.</p>
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all text-center">
                    Apply Now →
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-white/25 text-xs mb-4 leading-relaxed">Direct link not available. Search this role on {cleanText(job.company_name)}'s careers page.</p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                    <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">⚠ Direct link unavailable</p>
                  </div>
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                {[
                  { label: 'Source', value: job.source || 'Direct' },
                  { label: 'Posted', value: timeAgo },
                  { label: 'Type', value: job.job_type || 'Full Time' },
                  ...(job.salary ? [{ label: 'Salary', value: job.salary }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">{item.label}</span>
                    <span className="text-white/50">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8 text-center">
              <p className="text-2xl mb-4">📬</p>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Get Weekly Alerts</h4>
              <p className="text-white/25 text-xs mb-5">Fresh {job.industry || 'remote'} roles every Monday</p>
              <Link href="/" className="inline-block bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37]/20 transition-all">
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 bg-[#d4af37] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xs italic">A</span>
            </div>
            <span className="text-white/20 text-xs font-black uppercase tracking-widest">ApplyFirst</span>
          </Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">← Browse All Jobs</Link>
        </div>
      </footer>
    </div>
  );
}
