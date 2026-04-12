import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

export const revalidate = 86400; // regenerate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (error || !jobs) {
      return [{ url: 'https://applyfirstjobs.com', lastModified: new Date(), changeFrequency: 'hourly', priority: 1 }];
    }

    const jobUrls = jobs.map((job) => ({
      url: `https://applyfirstjobs.com/jobs/${job.id}`,
      lastModified: new Date(job.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [
      { url: 'https://applyfirstjobs.com', lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1 },
      ...jobUrls,
    ];
  } catch {
    return [{ url: 'https://applyfirstjobs.com', lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1 }];
  }
}
