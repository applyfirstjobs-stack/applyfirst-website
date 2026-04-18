import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/seo-slugs';

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

  return [...staticPages, ...browsePages];
}
