import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAllSlugs } from '@/lib/seo-slugs';

const SUPABASE_URL = 'https://mwgvdlefsjvdcwttxzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://www.applyfirstjobs.com',
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://www.applyfirstjobs.com/privacy',
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://www.applyfirstjobs.com/terms',
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://www.applyfirstjobs.com/contact',
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // All 500+ browse/SEO pages
  const allSlugs = getAllSlugs();
  const browsePages: MetadataRoute.Sitemap = allSlugs.map((slug) => ({
    url: `https://www.applyfirstjobs.com/browse/${slug}`,
    lastModified: today,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Latest 50k job pages
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(50000);

  const jobPages: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
    url: `https://www.applyfirstjobs.com/jobs/${job.id}`,
    lastModified: job.created_at
      ? new Date(job.created_at).toISOString().split('T')[0]
      : today,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...browsePages, ...jobPages];
}
