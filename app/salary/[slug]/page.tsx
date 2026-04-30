import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from('salaries_by_title')
    .select('job_title, avg_salary')
    .eq('slug', params.slug)
    .single();
  if (!data) return {};
  return {
    title: `${data.job_title} Salary in the US — ApplyFirst`,
    description: `The average ${data.job_title} salary in the US is $${data.avg_salary?.toLocaleString()} per year. See salary ranges by state and employer based on verified government data.`,
    alternates: { canonical: `https://www.applyfirstjobs.com/salary/${params.slug}` },
  };
}

export default async function SalaryDetailPage({ params }: { params: { slug: string } }) {
  const { data: titleData } = await supabase
    .from('salaries_by_title')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!titleData) return notFound();

  const { data: stateData } = await supabase
    .from('salaries_by_title_state')
    .select('state, avg_salary, min_salary, max_salary, sample_size')
    .ilike('job_title', titleData.job_title)
    .order('avg_salary', { ascending: false })
    .limit(15);

  const { data: employerData } = await supabase
    .from('salaries_by_employer')
    .select('employer_name, avg_salary, min_salary, max_salary, sample_size')
    .ilike('job_title', titleData.job_title)
    .order('avg_salary', { ascending: false })
    .limit(15);

  // Normalize job title for matching — remove plural s, take first 2 words
  const jobSearchTerm = titleData.job_title
    .split(' ')
    .slice(0, 2)
    .join(' ')
    .replace(/s$/i, '');

  const { data: relatedJobs } = await supabase
    .from('jobs')
    .select('id, job_title, company_name, location, apply_score, date_posted, apply_url')
    .ilike('job_title', `%${jobSearchTerm}%`)
    .not('apply_url', 'is', null)
    .neq('apply_url', '')
    .order('created_at', { ascending: false })
    .limit(20);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${titleData.job_title} Salary`,
    description: `Average ${titleData.job_title} salary is $${titleData.avg_salary?.toLocaleString()} per year`,
    url: `https://www.applyfirstjobs.com/salary/${params.slug}`,
  };

  const cleanCompanyName = (name: string) => {
    if (!name) return 'Unknown';
    if (name.toLowerCase() === name) return name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    return name;
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

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
            <Link href="/blog" className="text-white/30 hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Verified Salary Data</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            {titleData.job_title} Salary
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mb-8">
            Based on {titleData.sample_size?.toLocaleString()} verified salary filings from the US Department of Labor.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl p-6">
              <div className="text-[#d4af37] text-3xl font-black mb-1">${titleData.avg_salary?.toLocaleString()}</div>
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Average Salary</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-white text-3xl font-black mb-1">${titleData.median_salary?.toLocaleString()}</div>
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Median Salary</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-emerald-400 text-3xl font-black mb-1">${titleData.max_salary?.toLocaleString()}</div>
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Max Salary</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-white/60 text-3xl font-black mb-1">${titleData.min_salary?.toLocaleString()}</div>
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Min Salary</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid md:grid-cols-2 gap-10">
        {stateData && stateData.length > 0 && (
          <div>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              {titleData.job_title} Salary by State
            </h2>
            <div className="space-y-2">
              {stateData.map((row) => (
                <div key={row.state} className="bg-[#0c0c0c] border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm">{row.state}</div>
                    <div className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">
                      {row.sample_size?.toLocaleString()} filings · ${row.min_salary?.toLocaleString()} – ${row.max_salary?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[#d4af37] font-black text-lg">${row.avg_salary?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {employerData && employerData.length > 0 && (
          <div>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              {titleData.job_title} Salary by Company
            </h2>
            <div className="space-y-2">
              {employerData.map((row) => (
                <div key={row.employer_name} className="bg-[#0c0c0c] border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm">{row.employer_name}</div>
                    <div className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">
                      {row.sample_size?.toLocaleString()} filings · ${row.min_salary?.toLocaleString()} – ${row.max_salary?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[#d4af37] font-black text-lg">${row.avg_salary?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {relatedJobs && relatedJobs.length > 0 && (
        <section className="border-t border-white/5 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-black uppercase tracking-widest text-sm">
                Open {titleData.job_title} Jobs
              </h2>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Updated Daily
              </span>
            </div>
            <div className="space-y-2">
              {relatedJobs.map((job) => (
                <a key={job.id} href={job.apply_url} target="_blank" rel="noopener noreferrer"
                  className="group block bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl px-6 py-4 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">
                        {job.job_title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mt-0.5">
                        <span>{cleanCompanyName(job.company_name)}</span>
                        {job.location && <><span>·</span><span>{job.location}</span></>}
                      </div>
                    </div>
                    <span className="bg-[#d4af37] text-black px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest group-hover:bg-white transition-all shrink-0">Apply →</span>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/" className="inline-block border border-white/10 text-white/40 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all">
                Browse All Jobs →
              </Link>
            </div>
          </div>
        </section>
      )}

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
