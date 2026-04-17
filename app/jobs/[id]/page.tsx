import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const { data: job } = await supabase
    .from('jobs')
    .select('job_title, company_name, location, description')
    .eq('id', params.id)
    .single();

  if (!job) {
    return {
      title: 'Job Not Found — ApplyFirst',
      description: 'This job may have been filled. Browse 1.6M+ fresh jobs on ApplyFirst.',
    };
  }

  return {
    title: `${job.job_title} at ${job.company_name} — ApplyFirst`,
    description: job.description
      ? job.description.slice(0, 160)
      : `Apply for ${job.job_title} at ${job.company_name}${job.location ? ` in ${job.location}` : ''}. Fresh job listing on ApplyFirst.`,
  };
}

export default async function JobPage({ params }: Props) {
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .single();

  // Fetch related jobs
  const { data: relatedJobs } = await supabase
    .from('jobs')
    .select('id, job_title, company_name, location, apply_score, date_posted, created_at, industry')
    .eq('industry', job?.industry || 'Technology')
    .neq('id', params.id)
    .order('created_at', { ascending: false })
    .limit(6);

  if (!job) {
    // Job expired — show expired page with related jobs
    return (
      <div className="min-h-screen bg-[#030303] text-white">
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

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 text-center">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-12 mb-12">
            <p className="text-5xl mb-6">⏰</p>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
              This Role May Be Filled
            </h1>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              This job was posted over 30 days ago and may no longer be available. Browse fresh listings below.
            </p>
            <a
              href="/"
              className="inline-block bg-[#d4af37] text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
            >
              Browse 1.6M+ Fresh Jobs →
            </a>
          </div>

          {relatedJobs && relatedJobs.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">
                🔥 Fresh Jobs You Might Like
              </h2>
              <div className="space-y-3 text-left">
                {relatedJobs.map((r) => (
                  <a
                    key={r.id}
                    href={`/jobs/${r.id}`}
                    className="flex items-center gap-4 bg-[#0c0c0c] border border-white/5 hover:border-[#d4af37]/20 rounded-2xl p-5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-[#d4af37] font-black text-sm uppercase">{r.company_name?.[0] || 'A'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">{r.job_title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
                        {r.company_name} {r.location ? `· ${r.location}` : ''}
                      </p>
                    </div>
                    <span className="text-white/20 group-hover:text-[#d4af37] transition-colors">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Job exists — redirect to homepage with job loaded
  redirect(`/?job=${params.id}`);
}
