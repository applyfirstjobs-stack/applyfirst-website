export const CATEGORIES = [
  { slug: 'technology-jobs', label: 'Technology', industry: 'Technology' },
  { slug: 'marketing-jobs', label: 'Marketing', industry: 'Marketing' },
  { slug: 'finance-jobs', label: 'Finance', industry: 'Finance' },
  { slug: 'design-jobs', label: 'Design', industry: 'Design' },
  { slug: 'sales-jobs', label: 'Sales', industry: 'Sales' },
  { slug: 'healthcare-jobs', label: 'Healthcare', industry: 'Healthcare' },
  { slug: 'hr-jobs', label: 'HR', industry: 'HR' },
  { slug: 'legal-jobs', label: 'Legal', industry: 'Legal' },
  { slug: 'data-jobs', label: 'Data', industry: 'Data' },
  { slug: 'ai-jobs', label: 'AI', industry: 'AI' },
  { slug: 'product-jobs', label: 'Product', industry: 'Product' },
  { slug: 'operations-jobs', label: 'Operations', industry: 'Operations' },
  { slug: 'customer-success-jobs', label: 'Customer Success', industry: 'Customer Success' },
  { slug: 'education-jobs', label: 'Education', industry: 'Education' },
  { slug: 'logistics-jobs', label: 'Logistics', industry: 'Logistics' },
];

export const LOCATIONS = [
  { slug: 'remote-jobs', label: 'Remote', location: 'Remote' },
  { slug: 'new-york-jobs', label: 'New York', location: 'New York' },
  { slug: 'san-francisco-jobs', label: 'San Francisco', location: 'San Francisco' },
  { slug: 'london-jobs', label: 'London', location: 'London' },
  { slug: 'austin-jobs', label: 'Austin', location: 'Austin' },
  { slug: 'chicago-jobs', label: 'Chicago', location: 'Chicago' },
  { slug: 'boston-jobs', label: 'Boston', location: 'Boston' },
  { slug: 'seattle-jobs', label: 'Seattle', location: 'Seattle' },
];

export const ATS_SOURCES = [
  { slug: 'greenhouse', label: 'Greenhouse' },
  { slug: 'lever', label: 'Lever' },
  { slug: 'workday', label: 'Workday' },
  { slug: 'teamtailor', label: 'Teamtailor' },
  { slug: 'pinpoint', label: 'Pinpoint' },
];

export type ParsedSlug = {
  title: string;
  description: string;
  industry?: string;
  location?: string;
  jobType?: string;
  source?: string;
};

export function parseSlug(slug: string): ParsedSlug | null {
  // Check categories
  const cat = CATEGORIES.find(c => c.slug === slug);
  if (cat) return {
    title: `${cat.label} Jobs`,
    description: `Browse the latest remote and on-site ${cat.label} jobs from top companies worldwide.`,
    industry: cat.industry,
  };

  // Check locations
  const loc = LOCATIONS.find(l => l.slug === slug);
  if (loc) return {
    title: `${loc.label} Jobs`,
    description: `Find the best jobs in ${loc.label}. Browse hundreds of open roles from top companies.`,
    location: loc.location,
  };

  // Check ATS sources
  const ats = ATS_SOURCES.find(a => `${a.slug}-jobs` === slug);
  if (ats) return {
    title: `${ats.label} Jobs`,
    description: `Browse jobs posted via ${ats.label} from thousands of companies worldwide.`,
    source: ats.label,
  };

  // Job type slugs
  if (slug === 'remote-jobs') return { title: 'Remote Jobs', description: 'Browse remote jobs worldwide.', jobType: 'Full Time', location: 'Remote' };
  if (slug === 'part-time-jobs') return { title: 'Part Time Jobs', description: 'Browse part-time jobs worldwide.', jobType: 'Part Time' };
  if (slug === 'contract-jobs') return { title: 'Contract Jobs', description: 'Browse contract jobs worldwide.', jobType: 'Contract' };
  if (slug === 'internship-jobs') return { title: 'Internship Jobs', description: 'Browse internship opportunities worldwide.', jobType: 'Internship' };

  return null;
}

export function getAllSlugs(): string[] {
  return [
    ...CATEGORIES.map(c => c.slug),
    ...LOCATIONS.map(l => l.slug),
    ...ATS_SOURCES.map(a => `${a.slug}-jobs`),
    'part-time-jobs',
    'contract-jobs',
    'internship-jobs',
  ];
}
