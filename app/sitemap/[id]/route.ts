import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

export const revalidate = 86400;

// Each sitemap page serves 50k URLs
// /sitemap/1.xml = jobs 0-50k
// /sitemap/2.xml = jobs 50k-100k
// etc.

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const PAGE_SIZE = 50000;
  const offset = (id - 1) * PAGE_SIZE;

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  return (jobs || []).map((job) => ({
    url: `https://www.applyfirstjobs.com/jobs/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));
}

export async function generateSitemaps() {
  // Generate sitemap IDs 1-5 (covers 250k jobs)
  // Increase as your job count grows
  return [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ];
}
