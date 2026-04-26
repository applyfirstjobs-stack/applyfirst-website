import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/seo-slugs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

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
      url: 'https://www.applyfirstjobs.com/salary',
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
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

  // Browse/SEO pages
  const allSlugs = getAllSlugs();
  const browsePages: MetadataRoute.Sitemap = allSlugs.map((slug) => ({
    url: `https://www.applyfirstjobs.com/browse/${slug}`,
    lastModified: today,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Salary pages
  const { data: salaries } = await supabase
    .from('salaries_by_title')
    .select('slug')
    .not('slug', 'is', null);

  const salaryPages: MetadataRoute.Sitemap = (salaries || []).map((s) => ({
    url: `https://www.applyfirstjobs.com/salary/${s.slug}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...browsePages, ...salaryPages];
}
