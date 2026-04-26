// lib/seo-slugs.ts
export const CATEGORIES = [
  { slug: 'software-engineer', label: 'Software Engineer', industry: 'Technology' },
  { slug: 'ai-machine-learning', label: 'AI & Machine Learning', industry: 'AI' },
  { slug: 'marketing', label: 'Marketing', industry: 'Marketing' },
  { slug: 'finance', label: 'Finance', industry: 'Finance' },
  { slug: 'design', label: 'Design', industry: 'Design' },
  { slug: 'sales', label: 'Sales', industry: 'Sales' },
  { slug: 'data-science', label: 'Data Science', industry: 'Data' },
  { slug: 'product-manager', label: 'Product Manager', industry: 'Product' },
  { slug: 'healthcare', label: 'Healthcare', industry: 'Healthcare' },
  { slug: 'hr-recruiting', label: 'HR & Recruiting', industry: 'HR' },
  { slug: 'legal', label: 'Legal', industry: 'Legal' },
  { slug: 'operations', label: 'Operations', industry: 'Operations' },
  { slug: 'customer-success', label: 'Customer Success', industry: 'Customer Success' },
  { slug: 'education', label: 'Education', industry: 'Education' },
  { slug: 'devops', label: 'DevOps & Cloud', industry: 'Technology' },
  { slug: 'cybersecurity', label: 'Cybersecurity', industry: 'Technology' },
  { slug: 'backend-developer', label: 'Backend Developer', industry: 'Technology' },
  { slug: 'frontend-developer', label: 'Frontend Developer', industry: 'Technology' },
  { slug: 'fullstack-developer', label: 'Full Stack Developer', industry: 'Technology' },
  { slug: 'mobile-developer', label: 'Mobile Developer', industry: 'Technology' },
  { slug: 'data-engineer', label: 'Data Engineer', industry: 'Data' },
  { slug: 'data-analyst', label: 'Data Analyst', industry: 'Data' },
  { slug: 'business-intelligence', label: 'Business Intelligence', industry: 'Data' },
  { slug: 'growth-marketing', label: 'Growth Marketing', industry: 'Marketing' },
  { slug: 'content-marketing', label: 'Content Marketing', industry: 'Marketing' },
  { slug: 'seo-specialist', label: 'SEO Specialist', industry: 'Marketing' },
  { slug: 'account-executive', label: 'Account Executive', industry: 'Sales' },
  { slug: 'business-development', label: 'Business Development', industry: 'Sales' },
  { slug: 'ux-designer', label: 'UX Designer', industry: 'Design' },
  { slug: 'graphic-designer', label: 'Graphic Designer', industry: 'Design' },
  { slug: 'accounting', label: 'Accounting', industry: 'Finance' },
  { slug: 'investment-banking', label: 'Investment Banking', industry: 'Finance' },
  { slug: 'project-manager', label: 'Project Manager', industry: 'Operations' },
  { slug: 'supply-chain', label: 'Supply Chain', industry: 'Logistics' },
  { slug: 'nurse', label: 'Nursing', industry: 'Healthcare' },
  { slug: 'software-qa', label: 'Software QA', industry: 'Technology' },
];

export const LOCATIONS = [
  { slug: 'remote', label: 'Remote', location: 'Remote' },
  { slug: 'usa', label: 'USA', location: 'USA' },
  { slug: 'uk', label: 'UK', location: 'UK' },
  { slug: 'europe', label: 'Europe', location: 'Europe' },
  { slug: 'australia', label: 'Australia', location: 'Australia' },
  { slug: 'canada', label: 'Canada', location: 'Canada' },
  { slug: 'singapore', label: 'Singapore', location: 'Singapore' },
  { slug: 'germany', label: 'Germany', location: 'Germany' },
  { slug: 'netherlands', label: 'Netherlands', location: 'Netherlands' },
  { slug: 'uae', label: 'UAE', location: 'UAE' },
];

export const JOB_TYPES = [
  { slug: 'full-time', label: 'Full Time', jobType: 'Full Time' },
  { slug: 'contract', label: 'Contract', jobType: 'Contract' },
  { slug: 'part-time', label: 'Part Time', jobType: 'Part Time' },
  { slug: 'internship', label: 'Internship', jobType: 'Internship' },
];

export const ATS_SOURCES = [
  { slug: 'greenhouse', label: 'Greenhouse' },
  { slug: 'lever', label: 'Lever' },
  { slug: 'workday', label: 'Workday' },
  { slug: 'teamtailor', label: 'Teamtailor' },
  { slug: 'pinpoint', label: 'Pinpoint' },
];

export function getAllSlugs(): string[] {
  const slugs: string[] = [];
  CATEGORIES.forEach(c => slugs.push(c.slug));
  LOCATIONS.forEach(l => slugs.push(l.slug));
  JOB_TYPES.forEach(j => slugs.push(j.slug));
  CATEGORIES.forEach(c => {
    LOCATIONS.forEach(l => slugs.push(`${c.slug}-${l.slug}`));
  });
  CATEGORIES.forEach(c => {
    JOB_TYPES.forEach(j => slugs.push(`${c.slug}-${j.slug}`));
  });
  return slugs;
}

export function parseSlug(slug: string): {
  industry?: string;
  location?: string;
  jobType?: string;
  source?: string;
  title: string;
  description: string;
} | null {
  // Category + location combo
  for (const cat of CATEGORIES) {
    for (const loc of LOCATIONS) {
      if (slug === `${cat.slug}-${loc.slug}`) {
        return {
          industry: cat.industry,
          location: loc.location,
          title: `${cat.label} Jobs in ${loc.label}`,
          description: `Browse ${cat.label} jobs in ${loc.label}. Fresh listings updated daily from 21,000+ company career pages.`,
        };
      }
    }
  }
  // Category + job type combo
  for (const cat of CATEGORIES) {
    for (const jt of JOB_TYPES) {
      if (slug === `${cat.slug}-${jt.slug}`) {
        return {
          industry: cat.industry,
          jobType: jt.jobType,
          title: `${jt.label} ${cat.label} Jobs`,
          description: `Browse ${jt.label} ${cat.label} jobs. Fresh listings updated daily from 21,000+ company career pages.`,
        };
      }
    }
  }
  // Category only
  const cat = CATEGORIES.find(c => c.slug === slug);
  if (cat) return {
    industry: cat.industry,
    title: `${cat.label} Jobs`,
    description: `Browse ${cat.label} jobs. Fresh listings updated daily from 21,000+ company career pages.`,
  };

  // Location only
  const loc = LOCATIONS.find(l => l.slug === slug);
  if (loc) return {
    location: loc.location,
    title: `Remote Jobs in ${loc.label}`,
    description: `Browse remote jobs in ${loc.label}. Fresh listings updated daily from 21,000+ company career pages.`,
  };

  // Job type only
  const jt = JOB_TYPES.find(j => j.slug === slug);
  if (jt) return {
    jobType: jt.jobType,
    title: `${jt.label} Jobs`,
    description: `Browse ${jt.label} jobs. Fresh listings updated daily from 21,000+ company career pages.`,
  };

  // ATS source
  const ats = ATS_SOURCES.find(a => `${a.slug}-jobs` === slug);
  if (ats) return {
    source: ats.label,
    title: `${ats.label} Jobs`,
    description: `Browse jobs posted via ${ats.label} from thousands of companies worldwide.`,
  };

  return null;
}
