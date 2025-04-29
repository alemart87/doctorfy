import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext'; // Para verificar admin si es necesario aquí también

const AdminBlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Opcional: doble chequeo

  // Redirigir si no es admin (aunque la ruta debería estar protegida)
  useEffect(() => {
      if (user?.email !== 'alemart87@gmail.com') {
          navigate('/dashboard'); // O a donde corresponda
      }
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/blog'); // Obtiene la lista simplificada
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts for admin:", err);
      setError("No se pudieron cargar los posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId, postTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el post "${postTitle}"? Esta acción no se puede deshacer.`)) {
      try {
        setDeleteError(null);
        await api.delete(`/blog/${postId}`);
        // Refrescar la lista después de eliminar
        setPosts(posts.filter(post => post.id !== postId));
      } catch (err) {
        console.error(`Error deleting post ${postId}:`, err);
        setDeleteError(`No se pudo eliminar el post. ${err.response?.data?.error || ''}`);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Gestionar Blog</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/admin/blog/create" // Ruta para crear nuevo post
        >
          Crear Nuevo Post
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {!loading && !error && (
        <Paper elevation={2}>
          <List>
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <ListItem>
                  <ListItemText
                    primary={post.title}
                    secondary={`Slug: ${post.slug} | Creado: ${new Date(post.created_at).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      component={RouterLink}
                      to={`/admin/blog/edit/${post.id}`} // Ruta para editar
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(post.id, post.title)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < posts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          {posts.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center' }}>No hay posts para mostrar.</Typography>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default AdminBlogManagement; 