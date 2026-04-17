import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

export const revalidate = 86400;

function generateXML(urls: { url: string; lastmod: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastmod }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;
}

async function getSitemapPage(page: number) {
  const PAGE_SIZE = 50000;
  const offset = page * PAGE_SIZE;
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  return (jobs || []).map(job => ({
    url: `https://www.applyfirstjobs.com/jobs/${job.id}`,
    lastmod: new Date(job.created_at).toISOString().split('T')[0],
  }));
}

export async function GET() {
  const urls = await getSitemapPage(0);
  const xml = generateXML(urls);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
