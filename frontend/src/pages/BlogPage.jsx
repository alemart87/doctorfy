import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Cómo la IA está revolucionando la psicología online",
      excerpt: "Descubre cómo la inteligencia artificial está transformando la atención psicológica...",
      image: "/images/blog/ai-psychology.jpg",
      slug: "ia-revolucionando-psicologia-online"
    },
    {
      id: 2,
      title: "5 beneficios de analizar tus estudios médicos con inteligencia artificial",
      excerpt: "La interpretación de estudios médicos mediante IA ofrece ventajas significativas...",
      image: "/images/blog/medical-studies-ai.jpg",
      slug: "beneficios-analisis-estudios-medicos-ia"
    }
    // Más artículos
  ];

  return (
    <>
      <Helmet>
        <title>Blog de Salud Digital | Doctorfy</title>
        <meta 
          name="description" 
          content="Artículos sobre salud digital, psicología online, análisis médicos con IA y bienestar. Información actualizada por expertos en salud." 
        />
        <link rel="canonical" href="https://doctorfy.onrender.com/blog" />
      </Helmet>
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Blog de Salud Digital
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {blogPosts.map(post => (
            <Grid item xs={12} md={6} key={post.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {post.title}
                  </Typography>
                  <Typography>
                    {post.excerpt}
                  </Typography>
                </CardContent>
                <Button 
                  size="small" 
                  sx={{ m: 2 }}
                  href={`/blog/${post.slug}`}
                >
                  Leer más
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default BlogPage; 