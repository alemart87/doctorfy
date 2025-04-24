const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.doctorfy.app';

// Rutas estáticas principales
const staticRoutes = [
  '',                    // Home
  '/login',
  '/register',
  '/medical-studies',
  '/doctors',
  '/nutrition',
  '/medical-chat',
  '/dashboard',
  '/profile',
  '/guide',
  '/blog',
  '/subscription'
];

// Contenido del blog (esto podría venir de una base de datos o CMS)
const blogPosts = [
  {
    slug: 'importancia-chequeos-medicos-regulares',
    title: 'La Importancia de los Chequeos Médicos Regulares',
    lastmod: '2024-02-20',
    priority: '0.9'
  },
  {
    slug: 'beneficios-telemedicina',
    title: 'Beneficios de la Telemedicina en la Atención Médica Moderna',
    lastmod: '2024-02-18',
    priority: '0.9'
  },
  {
    slug: 'nutricion-salud-mental',
    title: 'La Conexión entre Nutrición y Salud Mental',
    lastmod: '2024-02-15',
    priority: '0.8'
  },
  {
    slug: 'tecnologia-diagnostico-medico',
    title: 'Avances en Tecnología para el Diagnóstico Médico',
    lastmod: '2024-02-12',
    priority: '0.8'
  },
  {
    slug: 'prevencion-enfermedades-cardiovasculares',
    title: 'Guía para la Prevención de Enfermedades Cardiovasculares',
    lastmod: '2024-02-10',
    priority: '0.8'
  },
  {
    slug: 'salud-digital-futuro-medicina',
    title: 'La Salud Digital y el Futuro de la Medicina',
    lastmod: '2024-02-08',
    priority: '0.9'
  }
];

// Categorías médicas para SEO
const medicalCategories = [
  'cardiologia',
  'neurologia',
  'pediatria',
  'ginecologia',
  'dermatologia',
  'traumatologia',
  'oftalmologia',
  'nutricion-clinica'
].map(category => `/especialidades/${category}`);

// Generar el contenido XML del sitemap
const generateSitemap = () => {
  const allRoutes = [
    ...staticRoutes.map(route => ({
      loc: route,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? '1.0' : '0.8'
    })),
    ...blogPosts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.lastmod,
      changefreq: 'monthly',
      priority: post.priority
    })),
    ...medicalCategories.map(category => ({
      loc: category,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7'
    }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${allRoutes.map(route => `
  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return sitemap;
};

// Escribir el archivo sitemap.xml
const writeSitemap = () => {
  // Crear directorios si no existen
  const publicDir = path.join(__dirname, '../public');
  const dataDir = path.join(__dirname, '../src/data');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generar y escribir sitemap
  const sitemap = generateSitemap();
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Sitemap generado en: ${sitemapPath}`);
  
  // Generar y escribir metadatos del blog
  const blogMetadata = blogPosts.map(post => ({
    ...post,
    url: `${BASE_URL}/blog/${post.slug}`,
    description: `Artículo médico sobre ${post.title.toLowerCase()}`,
    keywords: `medicina, salud, ${post.slug.replace(/-/g, ', ')}`
  }));
  
  const metadataPath = path.join(dataDir, 'blog-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(blogMetadata, null, 2));
  console.log(`✅ Metadatos del blog generados en: ${metadataPath}`);
};

writeSitemap(); 