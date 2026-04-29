import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

export const dynamic = 'force-dynamic';

function titleToSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function slugToTitle(slug: string) {
  if (!slug) return '';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const title = slugToTitle(params.slug);
  return {
    title: `${title} Jobs — Live Openings | ApplyFirst`,
    description: `Browse all live ${title} job openings updated daily from 21,000+ company career pages. Find your next ${title} role on ApplyFirst.`,
    alternates: { canonical: `https://www.applyfirstjobs.com/jobs/${params.slug}` },
  };
}

export default async function JobsByTitlePage({ params }: { params: { slug: string } }) {
  const jobTitle = slugToTitle(params.slug);

  // Fetch jobs matching this title
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, job_title, company_name, location, apply_url, created_at')
    .ilike('job_title', `%${jobTitle.replace(/-/g, ' ')}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch salary data for this role
  const { data: salaryData } = await supabase
    .from('salaries_by_title')
    .select('job_title, avg_salary, slug, sample_size')
    .ilike('job_title', `%${jobTitle}%`)
    .limit(1)
    .single();

  // Fetch related salary roles
  const { data: relatedSalaries } = await supabase
    .from('salaries_by_title')
    .select('job_title, avg_salary, slug')
    .ilike('job_title', `%${jobTitle.split(' ')[0]}%`)
    .neq('job_title', salaryData?.job_title || '')
    .order('avg_salary', { ascending: false })
    .limit(5);

  if (!jobs || jobs.length === 0) return notFound();

  const cleanCompanyName = (name: string) => {
    if (!name) return 'Unknown';
    if (name.toLowerCase() === name) return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return name;
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: jobTitle,
    description: `Browse all live ${jobTitle} job openings on ApplyFirst`,
    datePosted: new Date().toISOString(),
    employmentType: 'FULL_TIME',
    hiringOrganization: { '@type': 'Organization', name: 'Multiple Companies' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'US' } },
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* NAV */}
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

      {/* HERO */}
      <section className="border-b border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Jobs</Link>
            <span className="text-white/10">→</span>
            <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">{jobTitle}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            {jobTitle}<br /><span className="text-[#d4af37]">Jobs</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mb-6">
            {jobs.length} live openings updated daily from 21,000+ company career pages worldwide.
          </p>

          {/* SALARY BANNER */}
          {salaryData && (
            <div className="inline-flex items-center gap-6 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl px-6 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Average Salary</p>
                <p className="text-2xl font-black text-[#d4af37]">${salaryData.avg_salary.toLocaleString()}<span className="text-sm text-white/30">/year</span></p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Data Source</p>
                <p className="text-sm font-black text-white">US Gov + BLS Verified</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <Link href={`/salary/${salaryData.slug}`} className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] hover:underline">
                Full Salary Data →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* JOB LISTINGS */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              {jobs.length} open positions
            </p>
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Updated Daily
            </span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <a
                key={job.id}
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/20 rounded-2xl p-5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-tight mb-2">
                      {job.job_title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">{cleanCompanyName(job.company_name)}</span>
                      {job.location && (
                        <>
                          <span className="text-white/10">·</span>
                          <span className="text-white/30">{job.location}</span>
                        </>
                      )}
                      <span className="text-white/10">·</span>
                      <span className="text-white/20">
                        {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block bg-[#d4af37] text-black px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest group-hover:bg-white transition-all">
                      Apply →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8 text-center">
            <p className="text-[#d4af37] font-black uppercase tracking-widest text-sm mb-2">Browse All Jobs</p>
            <p className="text-white/40 text-sm mb-6">546,000+ live job listings across all roles updated daily</p>
            <Link href="/" className="inline-block bg-[#d4af37] text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
              Browse All Jobs →
            </Link>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* SALARY CARD */}
          {salaryData && (
            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{jobTitle} Salary Data</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Average</span>
                  <span className="text-[#d4af37] font-black">${salaryData.avg_salary.toLocaleString()}/yr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Data points</span>
                  <span className="text-white font-black">{salaryData.sample_size?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Source</span>
                  <span className="text-white font-black text-xs">BLS + H1B Gov Data</span>
                </div>
              </div>
              <Link href={`/salary/${salaryData.slug}`}
                className="mt-4 block text-center border border-[#d4af37]/20 text-[#d4af37] px-4 py-3 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-[#d4af37]/10 transition-all">
                Full Salary Breakdown →
              </Link>
            </div>
          )}

          {/* RELATED SALARIES */}
          {relatedSalaries && relatedSalaries.length > 0 && (
            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Related Roles</h3>
              <div className="space-y-3">
                {relatedSalaries.map((s) => (
                  <Link key={s.slug} href={`/salary/${s.slug}`}
                    className="flex justify-between items-center group hover:opacity-70 transition-opacity">
                    <span className="text-white/60 text-xs group-hover:text-white transition-colors truncate mr-2">{s.job_title}</span>
                    <span className="text-[#d4af37] font-black text-xs flex-shrink-0">${(s.avg_salary / 1000).toFixed(0)}k</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TIPS */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Apply Tips</h3>
            <div className="space-y-3 text-xs text-white/40 leading-relaxed">
              <p>✓ Apply within 24 hours — early applicants get more callbacks</p>
              <p>✓ Tailor your CV to each specific role</p>
              <p>✓ Research salary before negotiating — use our data above</p>
              <p>✓ Connect with the hiring manager on LinkedIn first</p>
            </div>
          </div>

          {/* BLOG LINK */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Job Market Intel</h3>
            <p className="text-white/40 text-xs mb-4">Daily insights on hiring trends, salaries and the job market.</p>
            <Link href="/blog" className="block text-center border border-white/10 text-white/40 px-4 py-3 rounded-full font-black text-[9px] uppercase tracking-widest hover:border-[#d4af37]/20 hover:text-white transition-all">
              Read Latest Reports →
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 mt-10">
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
