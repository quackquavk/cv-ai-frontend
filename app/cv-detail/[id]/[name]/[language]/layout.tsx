import { Metadata } from 'next';
import axiosInstance from '@/utils/axiosConfig';

interface CVData {
  name?: string;
  position?: string;
  skills?: string[];
  programming_languages?: string[];
  years_of_experience?: string;
  email?: string;
  address?: string;
  work_experience?: Array<{
    job_title?: string;
    company_name?: string;
    start_date?: string;
    end_date?: string;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
  }>;
}

const formatName = (name: string | undefined): string => {
  if (!name) return "Professional";
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const getExperienceSummary = (data: CVData): string => {
  const yearsExp = data.years_of_experience ? `${data.years_of_experience} years of experience` : '';
  const position = data.position ? `${data.position}` : '';
  const skills = data.skills?.slice(0, 3).join(', ') || '';
  
  let summary = '';
  if (position) summary += position;
  if (yearsExp) summary += summary ? ` with ${yearsExp}` : yearsExp;
  if (skills) summary += summary ? ` skilled in ${skills}` : `Skilled in ${skills}`;
  
  return summary || 'Professional CV and Resume';
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string; name: string; language: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.cvai.dev';
  const defaultTitle = 'CV AI - Professional Resume Parser';
  const defaultDescription = 'AI-powered CV parsing and analysis platform for recruiters and professionals.';
  
  try {
    const response = await axiosInstance.get(`/document/seo/${resolvedParams.id}`);
    const cvData: CVData = response.data.parsed_cv;
    
    if (!cvData) {
      return {
        title: defaultTitle,
        description: defaultDescription,
      };
    }
    
    const formattedName = formatName(cvData.name);
    const experienceSummary = getExperienceSummary(cvData);
    
    const title = cvData.name && cvData.position
      ? `${formattedName} - ${cvData.position} | CV AI`
      : cvData.name
      ? `${formattedName} - Professional CV | CV AI`
      : defaultTitle;
    
    const description = cvData.name
      ? `View ${formattedName}'s professional CV and resume. ${experienceSummary}. Discover skills, experience, education, and contact information through our AI-powered CV analysis platform.`
      : defaultDescription;
    
    const keywords = [
      'CV',
      'Resume',
      'Professional',
      'Career',
      cvData.name,
      cvData.position,
      ...(cvData.skills?.slice(0, 10) || []),
      ...(cvData.programming_languages?.slice(0, 5) || []),
      ...(cvData.work_experience?.map(exp => exp.job_title).filter(Boolean).slice(0, 3) || []),
    ].filter(Boolean).join(', ');
    
    const currentCompany = cvData.work_experience?.[0]?.company_name;
    const currentRole = cvData.work_experience?.[0]?.job_title;
    
    return {
      title,
      description,
      keywords,
      authors: [{ name: formattedName }],
      creator: 'CV AI Platform',
      publisher: 'CV AI',
      category: 'Professional Services',
      
      openGraph: {
        title,
        description,
        url: `${baseUrl}/cv-detail/${resolvedParams.id}/${resolvedParams.name}/${resolvedParams.language}`,
        siteName: 'CV AI',
        type: 'profile',
        locale: 'en_US',
        images: [
          {
            url: `${baseUrl}/assets/logo.png`,
            width: 1200,
            height: 630,
            alt: `${formattedName} - Professional CV`,
          },
        ],
      },
      
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@cvai',
        images: [`${baseUrl}/assets/logo.png`],
      },
      
      alternates: {
        canonical: `${baseUrl}/cv-detail/${resolvedParams.id}/${resolvedParams.name}/${resolvedParams.language}`,
      },
      
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
        
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: formattedName,
          jobTitle: cvData.position,
          email: cvData.email,
          address: cvData.address,
          worksFor: currentCompany ? {
            '@type': 'Organization',
            name: currentCompany,
          } : undefined,
          hasOccupation: currentRole ? {
            '@type': 'Occupation',
            name: currentRole,
          } : undefined,
          knowsAbout: cvData.skills?.slice(0, 10),
          alumniOf: cvData.education?.map(edu => ({
            '@type': 'EducationalOrganization',
            name: edu.institution,
          })),
          url: `${baseUrl}/cv-detail/${resolvedParams.id}/${resolvedParams.name}/${resolvedParams.language}`,
        }),
      },
    };
    
  } catch (error: any) {
    console.error('Error generating metadata for CV detail page:', error.response.data);
    
    // For 401 errors (unauthorized), still allow indexing but use default metadata
    if (error?.response?.status === 401) {
      return {
        title: defaultTitle,
        description: defaultDescription,
        robots: {
          index: true,
          follow: true,
        },
      };
    }
    
    // For other errors, don't index the page
    return {
      title: defaultTitle,
      description: defaultDescription,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function CVDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
