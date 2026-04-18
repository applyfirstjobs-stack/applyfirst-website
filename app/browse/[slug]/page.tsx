import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllSlugs, parseSlug, CATEGORIES, LOCATIONS } from '@/lib/seo-slugs';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug);
  if (!parsed) return {};
  return {
    title: `${parsed.title} — ApplyFirst`,
    description: parsed.description,
    alternates: {
      canonical: `https://www.applyfirstjobs.com/browse/${params.slug}`,
    },
    openGraph: {
      title: `${parsed.title} — ApplyFirst`,
      description: parsed.description,
      url: `https://www.applyfirstjobs.com/browse/${params.slug}`,
    },
  };
}

function getTimeAgo(dateString: any) {
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
}

function getScoreColor(score: string) {
  if (score === 'High Chance') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score === 'Medium Chance') return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  return 'text-white/30 border-white/10 bg-white/5';
}

export default async function BrowsePage({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug);
  if (!parsed) return notFound();

  // Build query
  let query = supabase
    .from('jobs')
    .select('id,job_title,company_name,location,job_type,apply_score,date_posted,created_at,industry,salary')
    .order('created_at', { ascending: false })
    .limit(50);

  if (parsed.industry) query = query.eq('industry', parsed.industry);
  if (parsed.location) query = query.ilike('location', `%${parsed.location}%`);
  if (parsed.jobType) query = query.eq('job_type', parsed.jobType);

  const { data: jobs } = await query;

  // Count query
  let countQuery = supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });

  if (parsed.industry) countQuery = countQuery.eq('industry', parsed.industry);
  if (parsed.location) countQuery = countQuery.ilike('location', `%${parsed.location}%`);
  if (parsed.jobType) countQuery = countQuery.eq('job_type', parsed.jobType);

  const { count } = await countQuery;

  // JSON-LD Schema for SEO
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: parsed.title,
    description: parsed.description,
    url: `https://www.applyfirstjobs.com/browse/${params.slug}`,
    numberOfItems: count || 0,
    itemListElement: (jobs || []).slice(0, 10).map((job, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'JobPosting',
        title: job.job_title,
        hiringOrganization: { '@type': 'Organization', name: job.company_name },
        jobLocation: { '@type': 'Place', address: job.location || 'Remote' },
        datePosted: job.date_posted || job.created_at,
        employmentType: job.job_type || 'FULL_TIME',
        url: `https://www.applyfirstjobs.com/jobs/${job.id}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-9 h-9 bg-[#d4af37] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-base italic">A</span>
            </div>
            <span className="font-black text-lg text-white tracking-tight uppercase">ApplyFirst</span>
          </Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            ← All Jobs
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="border-b border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Updated Daily</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            {parsed.title}
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mb-6">
            {parsed.description}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              {(count || 0).toLocaleString()} Roles
            </span>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
              From 21,000+ Company Career Pages
            </span>
          </div>
        </div>
      </section>

      {/* JOB LIST */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-6">🔍</p>
            <p className="text-white/30 font-black uppercase tracking-widest text-sm mb-4">No roles found</p>
            <Link href="/" className="text-[#d4af37] text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
              Browse All Jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="group block bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl px-6 py-5 transition-all duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#d4af37]/25 transition-all">
                    <span className="text-[#d4af37] font-black text-lg uppercase">{job.company_name?.[0] || 'A'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors truncate leading-tight mb-1">
                      {job.job_title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                      <span className="text-white/50">{job.company_name}</span>
                      {job.location && (<><span>·</span><span>📍 {job.location}</span></>)}
                      {job.job_type && (<><span>·</span><span>{job.job_type}</span></>)}
                      {job.salary && (<><span>·</span><span className="text-[#d4af37]/60">💰 {job.salary}</span></>)}
                      <span>·</span>
                      <span>{getTimeAgo(job.date_posted || job.created_at)}</span>
                    </div>
                  </div>
                  {job.apply_score && (
                    <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getScoreColor(job.apply_score)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {job.apply_score === 'High Chance' ? 'Hot' : job.apply_score === 'Medium Chance' ? 'Active' : 'Standard'}
                    </div>
                  )}
                  <span className="text-white/20 group-hover:text-[#d4af37] transition-colors shrink-0">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* VIEW ALL LINK */}
        <div className="text-center mt-12">
          <Link href="/"
            className="inline-block bg-[#d4af37] text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
            View All {(count || 0).toLocaleString()} {parsed.title} →
          </Link>
        </div>
      </main>

      {/* RELATED CATEGORIES */}
      <section className="border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Browse Related</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 12).map((cat) => (
              <Link key={cat.slug} href={`/browse/${cat.slug}`}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-[#d4af37]/30 transition-all">
                {cat.label}
              </Link>
            ))}
            {LOCATIONS.map((loc) => (
              <Link key={loc.slug} href={`/browse/${loc.slug}`}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-[#d4af37]/30 transition-all">
                {loc.label} Jobs
              </Link>
            ))}
          </div>
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
