import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Breadcrumbs, Link, Divider, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import api from '../api/axios';
import { UPLOADS_URL } from '../config';
import DOMPurify from 'dompurify'; // Para sanitizar HTML

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/blog/${slug}`);
        setPost(response.data);
      } catch (err) {
        console.error(`Error fetching post ${slug}:`, err);
        if (err.response && err.response.status === 404) {
          setError("Artículo no encontrado.");
        } else {
          setError("No se pudo cargar el artículo.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const getBannerUrl = (bannerPath) => {
    if (!bannerPath) return null; // No mostrar banner si no hay
    return `${UPLOADS_URL}/${bannerPath}`;
  };

  // Sanitizar HTML antes de renderizar
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to="/blog" sx={{ mt: 2 }}>
          Volver al Blog
        </Button>
      </Container>
    );
  }

  if (!post) {
    return null; // O mostrar un mensaje de "Post no disponible"
  }

  const bannerUrl = getBannerUrl(post.banner_url);

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | Blog Doctorfy</title>
        <meta name="description" content={post.meta_description} />
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords} />
        )}
        <link rel="canonical" href={`https://doctorfy.app/blog/${post.slug}`} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://doctorfy.app/blog/${post.slug}`} />
        {bannerUrl && <meta property="og:image" content={bannerUrl} />}
      </Helmet>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={RouterLink} underline="hover" color="inherit" to="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Inicio
          </Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/blog" sx={{ display: 'flex', alignItems: 'center' }}>
            <BookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Blog
          </Link>
          <Typography color="text.primary">{post.title}</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 700 }}>
            {post.title}
          </Typography>
          {post.subtitle && (
            <Typography variant="h5" component="p" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              {post.subtitle}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
             <Typography variant="caption" color="text.secondary">
               {/* Por {post.author_name || 'Equipo Doctorfy'} */}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               Publicado el: {new Date(post.created_at).toLocaleDateString()}
               {post.created_at !== post.updated_at && ` (Actualizado: ${new Date(post.updated_at).toLocaleDateString()})`}
             </Typography>
          </Box>

          {bannerUrl && (
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <img
                src={bannerUrl}
                alt={`Banner para ${post.title}`}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                onError={(e) => { e.target.style.display='none'; }} // Ocultar si hay error
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Renderizar contenido HTML sanitizado */}
          <Box
            component="article"
            dangerouslySetInnerHTML={createMarkup(post.content)}
            sx={{
              '& h2': { mt: 4, mb: 2, fontSize: '1.8rem' },
              '& h3': { mt: 3, mb: 1.5, fontSize: '1.5rem' },
              '& p': { mb: 2, lineHeight: 1.7 },
              '& ul, & ol': { pl: 3, mb: 2 },
              '& li': { mb: 1 },
              '& a': { color: 'primary.main', textDecoration: 'underline' },
              '& strong': { fontWeight: 600 },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: '4px', my: 2 }, // Estilos básicos para imágenes en el contenido
            }}
          />
        </Paper>
         <Button component={RouterLink} to="/blog" sx={{ mt: 4 }}>
          ← Volver al Blog
        </Button>
      </Container>
    </>
  );
};

export default BlogPost; 