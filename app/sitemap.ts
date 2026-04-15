import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://applyfirstjobs.com', lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: 'https://applyfirstjobs.com/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://applyfirstjobs.com/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://applyfirstjobs.com/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    // Fetch latest 50,000 jobs (Google sitemap limit per file)
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(50000);

    const jobUrls: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
      url: `https://applyfirstjobs.com/jobs/${job.id}`,
      lastModified: new Date(job.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...jobUrls];
  } catch {
    return staticPages;
  }
}
