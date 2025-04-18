import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent,
  Typography, Skeleton, Box, Alert
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import axios from 'axios';
import SpotlightCard from '../components/SpotlightCard';

// Configuración de timeout más corto para axios
axios.defaults.timeout = 5000; // 5 segundos

// Datos de fallback por si la API falla
const FALLBACK_POSTS = [
  {
    slug: "ia-medicina-2024",
    title: "Avances de la IA en Medicina 2024",
    subtitle: "Diagnóstico asistido, genómica y salud preventiva",
    date: "2024-12-01"
  },
  {
    slug: "nutricion-ia",
    title: "Contar calorías con una foto: ¿mito o realidad?",
    subtitle: "Cómo funcionan los modelos de visión de alimentos",
    date: "2024-11-20"
  },
  {
    slug: "psicologia-virtual",
    title: "Psicología virtual 24/7",
    subtitle: "Cómo la IA está transformando la salud mental",
    date: "2024-10-15"
  },
  {
    slug: "futuro-medicina",
    title: "El futuro de la medicina personalizada",
    subtitle: "Tratamientos a medida basados en IA y genómica",
    date: "2024-09-30"
  }
];

const Blog = () => {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mostrar inmediatamente los datos de fallback
    setPosts(FALLBACK_POSTS);
    setLoading(false);
    
    // Intentar cargar datos reales en segundo plano
    setLoading(true);
    axios.get('/api/blog')
      .then(r => {
        console.log("API response:", r.data);
        if (r.data && r.data.length > 0) {
          setPosts(r.data);
        } else {
          console.warn("API returned empty data, using fallback");
          // Ya tenemos los datos de fallback
        }
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching blog posts:", err);
        setError("No se pudieron cargar los artículos del servidor. Mostrando datos de ejemplo.");
        // Ya tenemos los datos de fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const iconProps = { sx: { fontSize: 32, color: '#00e5ff' } };
  const icons = [
    <AutoAwesomeRoundedIcon {...iconProps} />,
    <LockRoundedIcon {...iconProps} />,
    <PsychologyAltRoundedIcon {...iconProps} />,
    <LocalDiningRoundedIcon {...iconProps} />
  ];

  return (
    <Container sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}
      >
        Blog Doctorfy
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {loading
          ? [1, 2].map(i => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
          : (posts || []).map((p, index) => (
            <Grid item xs={12} md={6} key={p.slug || index}>
              <SpotlightCard spotlightColor="rgba(0,229,255,.20)">
                <Card
                  component={Link}
                  to={`/blog/${p.slug}`}
                  sx={{
                    textDecoration: 'none',
                    height: '100%',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    p: 3
                  }}
                >
                  {/* Icono centrado */}
                  <Box sx={{
                    mb: 2, width: 48, height: 48, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(0,229,255,.12)', borderRadius: 1
                  }}>
                    {icons[index % icons.length]}
                  </Box>

                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                      {p.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.subtitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {p.date}
                    </Typography>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export default Blog; 