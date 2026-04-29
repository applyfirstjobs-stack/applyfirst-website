import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  'https://mwgvdlefsjvdcwttxzzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z3ZkbGVmc2p2ZGN3dHR4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODIzODgsImV4cCI6MjA5MDk1ODM4OH0.vjw_tSybeazSi8DnvL07x1Bx2dCdcDAw-aFPpYQyk6o'
);

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .single();
  if (!data) return {};
  return {
    title: `${data.title} — ApplyFirst`,
    description: data.excerpt,
    alternates: { canonical: `https://www.applyfirstjobs.com/blog/${params.slug}` },
  };
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Handle **[text](url)** (bold link), **bold**, [text](url)
  const regex = /\*\*\[(.*?)\]\((.*?)\)\*\*|\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[1] !== undefined) {
      // **[text](url)** - bold link
      parts.push(<a key={i++} href={match[2]} className="text-[#d4af37] font-bold hover:underline" target="_blank" rel="noopener noreferrer">{match[1]}</a>);
    } else if (match[3] !== undefined) {
      // **bold**
      parts.push(<strong key={i++} className="text-white font-bold">{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      // [text](url)
      parts.push(<a key={i++} href={match[5]} className="text-[#d4af37] hover:underline" target="_blank" rel="noopener noreferrer">{match[4]}</a>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-6 mt-8 leading-tight">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-black text-white uppercase tracking-tight mb-4 mt-8 text-[#d4af37]">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-lg font-black text-white mb-3 mt-6">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-white/60 leading-relaxed mb-2 ml-4 list-disc">
          {renderInline(line.replace('- ', ''))}
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={key++} className="text-white/60 leading-relaxed mb-2 ml-4 list-decimal">
          {renderInline(line.replace(/^\d+\. /, ''))}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="mb-3" />);
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(
        <p key={key++} className="text-white/30 text-sm italic mb-4 leading-relaxed">
          {line.replace(/\*/g, '')}
        </p>
      );
    } else {
      elements.push(
        <p key={key++} className="text-white/60 leading-relaxed mb-4">
          {renderInline(line)}
        </p>
      );
    }
  }
  return elements;
}

const getCategoryColor = (cat: string) => {
  const colors: any = {
    'Hiring Trends': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'Salary Insights': 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20',
    'Remote Work': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Company Hiring': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'Global Markets': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  };
  return colors[cat] || 'text-white/40 bg-white/5 border-white/10';
};

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!article) return notFound();

  const { data: related } = await supabase
    .from('articles')
    .select('title, slug, excerpt, category, published_at')
    .eq('category', article.category)
    .neq('slug', params.slug)
    .order('published_at', { ascending: false })
    .limit(3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: { '@type': 'Organization', name: 'ApplyFirst' },
    publisher: {
      '@type': 'Organization',
      name: 'ApplyFirst',
      url: 'https://www.applyfirstjobs.com',
    },
    url: `https://www.applyfirstjobs.com/blog/${params.slug}`,
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

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 mb-8">
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>→</span>
          <span className={`px-2 py-0.5 rounded-full border ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>

        {/* ARTICLE HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
            <span className={`px-3 py-1 rounded-full border ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <span>
              {new Date(article.published_at).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
            <span>By ApplyFirst Research</span>
            <span>Powered by 546,000+ live job listings</span>
          </div>
        </div>

        {/* ARTICLE CONTENT */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 md:p-12 mb-10">
          {renderMarkdown(article.content)}
        </div>

        {/* CTA */}
        <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-3xl p-8 mb-10 text-center">
          <p className="text-[#d4af37] font-black uppercase tracking-widest text-sm mb-2">Browse Live Jobs</p>
          <p className="text-white/40 text-sm mb-6">546,000+ fresh job listings updated daily from 21,000+ company career pages</p>
          <Link href="/"
            className="inline-block bg-[#d4af37] text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
            Browse All Jobs →
          </Link>
        </div>

        {/* RELATED ARTICLES */}
        {related && related.length > 0 && (
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="group bg-[#0c0c0c] hover:bg-[#111] border border-white/5 hover:border-[#d4af37]/15 rounded-2xl p-5 transition-all">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getCategoryColor(r.category)} mb-3 inline-block`}>
                    {r.category}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors leading-tight">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
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
