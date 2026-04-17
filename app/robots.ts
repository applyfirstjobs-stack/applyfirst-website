import type { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: [
      'https://www.applyfirstjobs.com/sitemap.xml',
      'https://www.applyfirstjobs.com/sitemap/1.xml',
      'https://www.applyfirstjobs.com/sitemap/2.xml',
      'https://www.applyfirstjobs.com/sitemap/3.xml',
      'https://www.applyfirstjobs.com/sitemap/4.xml',
      'https://www.applyfirstjobs.com/sitemap/5.xml',
    ],
  };
}
 
