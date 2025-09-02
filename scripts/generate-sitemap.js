import fs from 'fs';
import path from 'path';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://api.cvai.dev',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'CV-AI-Sitemap-Generator/1.0'
  }
});

const initialData = {
  experience_years: [],
  programming_language: [],
  skills: [],
  education: [],
  job_title: "",
  star_rating: 0,
  current_salary: [],
  estimated_salary: [],
  paid_by: "",
};

const formatName = (name) => {
  if (!name) return "undefined";
  return name.trim().replace(/\s+/g, "-").toLowerCase();
};

const formatLanguages = (languages) => {
  if (!languages || languages.length === 0) return "undefined";
  return languages
    .map((item) => {
      const match = item.match(/\b[a-zA-Z#]+\b/);
      return match ? match[0] : "";
    })
    .filter((lang) => lang !== "")
    .slice(0, 3)
    .join("-");
};

const escapeXml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.cvai.dev';
  const buildTime = new Date().toISOString();
  
  console.log('🚀 Starting static sitemap generation...');
  
  const staticUrls = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/dashboard`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/auth/login`, priority: '0.5', changefreq: 'monthly' },
    { url: `${baseUrl}/user/setting`, priority: '0.3', changefreq: 'monthly' },
    { url: `${baseUrl}/user/setting/api-keys`, priority: '0.3', changefreq: 'monthly' },
    { url: `${baseUrl}/user/setting/appearance`, priority: '0.3', changefreq: 'monthly' },
    { url: `${baseUrl}/user/setting/billing`, priority: '0.3', changefreq: 'monthly' },
    { url: `${baseUrl}/user/setting/payment`, priority: '0.3', changefreq: 'monthly' },
  ];
  
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  staticUrls.forEach(({ url, priority, changefreq }) => {
    xmlContent += `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${buildTime}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  try {
    console.log(`🔗 Attempting to connect to API: ${axiosInstance.defaults.baseURL}`);
    
    // try {
    //   await axiosInstance.get('/health', { timeout: 5000 });
    //   console.log('✅ API connection successful');
    // } catch (healthError) {
    //   console.log('⚠️  API health check failed, trying document endpoint directly...');
    // }
    
    const response = await axiosInstance.post("document/search_by_query", initialData);
    const documents = response.data || [];
    
    console.log(`📄 Found ${documents.length} documents to process`);
    
    if (documents.length === 0) {
      console.log('⚠️  No documents returned from API - this will result in a static-only sitemap');
      throw new Error('No documents available');
    }
    
    const maxCVs = 1500;
    const limitedDocuments = documents.slice(0, maxCVs);
    
    let successCount = 0;
    let failureCount = 0;
    
    const batchSize = 15;
    
    for (let i = 0; i < limitedDocuments.length; i += batchSize) {
      const batch = limitedDocuments.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (doc, index) => {
        try {
          await new Promise(resolve => setTimeout(resolve, index * 50));
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 6000);
          });

          const cvResponse = await Promise.race([
            axiosInstance.get(`/document/cv/${doc.doc_id}`),
            timeoutPromise
          ]);
          
          const cvData = cvResponse.data.parsed_cv;
          
          if (cvData && (cvData.name || cvData.position)) {
            const formattedName = formatName(cvData.name);
            const formattedLanguages = formatLanguages(cvData.programming_languages);
            const priority = cvData.position ? '0.8' : '0.6';
            
            successCount++;
            return {
              url: `${baseUrl}/cv-detail/${doc.doc_id}/${formattedName}/${formattedLanguages}`,
              priority,
            };
          } else {
            failureCount++;
            console.warn(`⚠️  Document ${doc.doc_id} has insufficient data`);
          }
        } catch (error) {
          failureCount++;
          console.error(`❌ Failed to process document ${doc.doc_id}:`, error.message);
        }
        return null;
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { url, priority } = result.value;
          xmlContent += `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${buildTime}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
        }
      });
      
      const processed = Math.min(i + batchSize, limitedDocuments.length);
      const percentage = Math.round((processed / limitedDocuments.length) * 100);
      
      if (i % 60 === 0 || processed >= limitedDocuments.length) {
        console.log(`📊 Progress: ${processed}/${limitedDocuments.length} (${percentage}%) | Success: ${successCount} | Failed: ${failureCount}`);
      }
      
      if (i + batchSize < limitedDocuments.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Sitemap generation complete:`);
    console.log(`   📄 Static pages: ${staticUrls.length}`);
    console.log(`   🎯 CV pages: ${successCount}`);
    console.log(`   ✅ Success rate: ${Math.round((successCount / limitedDocuments.length) * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error fetching CV data:', error.message);
    console.log('💡 API Connection Details:');
    console.log(`   🔗 Base URL: ${axiosInstance.defaults.baseURL}`);
    console.log(`   ⏱️  Timeout: ${axiosInstance.defaults.timeout}ms`);
    console.log(`   🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.API_BASE_URL) {
      console.log('');
      console.log('🚨 MISSING API CONFIGURATION:');
      console.log('   Set NEXT_PUBLIC_API_BASE_URL or API_BASE_URL environment variable');
      console.log('   Example: export NEXT_PUBLIC_API_BASE_URL="https://your-api-url.com"');
      console.log('');
    }
    
    console.log('🔄 Falling back to static pages only');
    console.log('⚠️  WARNING: This sitemap will NOT include any CV detail pages!');
  }

  xmlContent += `
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(sitemapPath, xmlContent);
  console.log(`✅ Sitemap written to: ${sitemapPath}`);
  console.log(`📊 Total URLs: ${(xmlContent.match(/<url>/g) || []).length}`);
}

generateSitemap().catch(console.error);