import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const BlogPage = () => {
  const posts = Object.values(blogPosts);

  return (
    <>
      <Helmet>
        <title>Blog de Salud Digital e IA | Doctorfy - Innovación en Medicina</title>
        <meta 
          name="description" 
          content="Explora artículos sobre salud digital, psicología online, análisis médicos con IA de Anthropic y OpenAI. Información actualizada por expertos en medicina y tecnología." 
        />
        <meta
          name="keywords"
          content="blog médico, salud digital, IA en medicina, Anthropic Claude, OpenAI GPT, diagnóstico IA, psicología online, medicina preventiva"
        />
        <link rel="canonical" href="https://doctorfy.onrender.com/blog" />
        <meta property="og:title" content="Blog de Salud Digital e IA | Doctorfy" />
        <meta property="og:description" content="Artículos especializados sobre innovación en salud, IA médica y tecnología sanitaria." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://doctorfy.onrender.com/blog" />
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
            Innovación en medicina potenciada por Anthropic Claude y OpenAI
          </Typography>
        </Box>
        
        <Grid container spacing={4} component="section">
          {posts.map(post => {
            const Icon = post.icon;
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
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 3,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }}
                  >
                    <Icon sx={{ fontSize: 60 }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="overline" 
                      component="p"
                      color="primary"
                      gutterBottom
                    >
                      {post.category}
                    </Typography>
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
                    >
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Por {post.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.date).toLocaleDateString()}
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
      </Container>
    </>
  );
};

export default BlogPage; 