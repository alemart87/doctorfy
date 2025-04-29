import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
// import { blogPosts } from '../data/blogPosts'; // Ya no se usa
import api from '../api/axios'; // Asegúrate que es la instancia configurada
import { UPLOADS_URL } from '../config'; // Importa la URL base de uploads

// Iconos (puedes mapearlos si quieres, o usar uno genérico)
import ArticleIcon from '@mui/icons-material/Article';

const BlogPage = () => {
  // const posts = Object.values(blogPosts); // Ya no se usa
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        // --- Log para verificar la baseURL justo antes de la llamada ---
        console.log('Intentando llamar a /blog con baseURL:', api.defaults.baseURL);
        // -------------------------------------------------------------
        const response = await api.get('/blog'); // Usa la instancia importada
        setPosts(response.data);
      } catch (err) {
        // Loguear el error completo puede dar pistas
        console.error("Error fetching blog posts:", err.toJSON ? err.toJSON() : err);
        setError("No se pudieron cargar los artículos del blog.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const getBannerUrl = (bannerPath) => {
    if (!bannerPath) return '/images/blog/default.jpg'; // Fallback
    // Asume que bannerPath es relativo a UPLOADS_URL, ej: "blog_banners/mi-imagen.jpg"
    return `${UPLOADS_URL}/${bannerPath}`;
  };

  return (
    <>
      <Helmet>
        <title>Blog de Salud Digital e IA | Doctorfy - Innovación en Medicina</title>
        <meta
          name="description"
          content="Explora artículos sobre salud digital, psicología online, análisis médicos con IA. Información actualizada por expertos en medicina y tecnología."
        />
        <meta
          name="keywords"
          content="blog médico, salud digital, IA en medicina, Anthropic Claude, OpenAI GPT, diagnóstico IA, psicología online, medicina preventiva"
        />
        <link rel="canonical" href="https://doctorfy.app/blog" /> {/* Actualiza URL si es necesario */}
        <meta property="og:title" content="Blog de Salud Digital e IA | Doctorfy" />
        <meta property="og:description" content="Artículos especializados sobre innovación en salud, IA médica y tecnología sanitaria." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://doctorfy.app/blog" />
      </Helmet>

      <Container component="main" maxWidth="lg" sx={{ py: 8 }}>
        <Box component="header" sx={{ mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            Blog de Salud Digital
          </Typography>
          <Typography
            variant="h2"
            component="p"
            align="center"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Innovación en medicina potenciada por Inteligencia Artificial
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={4} component="section">
            {posts.map(post => {
              // const Icon = post.icon; // Necesitarías mapear slugs a iconos o usar uno genérico
              const Icon = ArticleIcon;
              return (
                <Grid item xs={12} md={6} lg={4} key={post.id}>
                  <Card
                    component="article"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 200, // Altura fija para la imagen
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={getBannerUrl(post.banner_url)}
                        alt={`Banner para ${post.title}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.warn(`Error cargando banner: ${e.target.src}`);
                          e.target.onerror = null; // Previene loops si el fallback falla
                          e.target.src = '/images/blog/default.jpg'; // Asegúrate que esta imagen exista y sea servida
                        }}
                      />
                    </Box>
                    {/* <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 3,
                        bgcolor: 'primary.light', // Puedes basar el color en la categoría si la añades
                        color: 'primary.contrastText'
                      }}
                    >
                      <Icon sx={{ fontSize: 60 }} />
                    </Box> */}
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* <Typography
                        variant="overline"
                        component="p"
                        color="primary"
                        gutterBottom
                      >
                        {post.category || 'Artículo'}
                      </Typography> */}
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        sx={{ fontWeight: 600 }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3, // Limita a 3 líneas
                            WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {/* Usar meta descripción como excerpt si está disponible */}
                        {post.meta_description || post.subtitle || 'Leer más...'}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {/* Por {post.author_name || 'Equipo Doctorfy'} */}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(post.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Button
                      component={Link}
                      to={`/blog/${post.slug}`}
                      size="large"
                      sx={{ m: 2 }}
                      variant="contained"
                      aria-label={`Leer más sobre ${post.title}`}
                    >
                      Leer más
                    </Button>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default BlogPage; 