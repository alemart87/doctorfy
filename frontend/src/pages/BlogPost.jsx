import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Divider, Skeleton, Button, Box, Chip, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '../data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const post = blogPosts[slug];

  const getBanner = (b) => {
    if (!b) return process.env.PUBLIC_URL + '/images/blog/default.jpg';
    if (b.startsWith('http')) return b;
    return process.env.PUBLIC_URL + b;
  };

  useEffect(() => {
    // Simular tiempo de carga
    const timer = setTimeout(() => {
      setLoading(false);
      if (!blogPosts[slug]) {
        navigate('/blog');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, navigate]);

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Skeleton height={400} />
        <Skeleton height={60} sx={{ mt: 2 }} />
        <Skeleton height={30} width="60%" sx={{ mt: 1 }} />
        <Skeleton height={400} sx={{ mt: 4 }} />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Artículo no encontrado
        </Typography>
        <Button component={Link} to="/blog" variant="contained">
          Volver al Blog
        </Button>
      </Container>
    );
  }

  // Schema.org structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.date,
    "publisher": {
      "@type": "Organization",
      "name": "Doctorfy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://doctorfy.onrender.com/logo.png"
      }
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://doctorfy.onrender.com/blog/${post.slug}`
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Doctorfy - Innovación en Salud con IA`}</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.tags.join(', ')}, salud digital, IA médica, Doctorfy, Anthropic Claude, OpenAI`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://doctorfy.onrender.com/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <link rel="canonical" href={`https://doctorfy.onrender.com/blog/${post.slug}`} />
      </Helmet>

      <Container component="article" sx={{ py: 6 }}>
        <Button 
          component={Link} 
          to="/blog" 
          sx={{ mb: 3 }}
          startIcon={<ArrowBackIcon />}
        >
          Volver al Blog
        </Button>

        <Box component="header" sx={{ mb: 4 }}>
          <Typography 
            variant="overline" 
            component="p"
            color="primary"
          >
            {post.category}
          </Typography>
          
          <Typography 
            variant="h1" 
            sx={{
              my: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700
            }}
          >
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Avatar src={post.authorImage} alt={post.author}>
              {post.author[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" component="p">
                {post.author}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box 
          component="figure" 
          sx={{ 
            my: 4, 
            position: 'relative',
            width: '100%',
            height: { xs: '300px', md: '400px' }
          }}
        >
          <img
            src={getBanner(post.banner)}
            alt={post.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box 
          className="blog-content"
          sx={{
            '& p': { mb: 2, lineHeight: 1.8 },
            '& h2': { mt: 4, mb: 2, fontWeight: 600 },
            '& h3': { mt: 3, mb: 2 },
            '& ul, & ol': { mb: 2, pl: 3 },
            '& li': { mb: 1 },
            '& img': { 
              maxWidth: '100%', 
              height: 'auto',
              borderRadius: '4px',
              my: 2
            }
          }}
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Etiquetas:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                variant="outlined" 
                size="small"
                clickable
              />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
} 