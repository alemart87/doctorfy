import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Box, Typography, Paper, CircularProgress, Alert, Switch, FormControlLabel, Divider } from '@mui/material';
import api from '../../api/axios';
import DOMPurify from 'dompurify'; // Para preview
import { UPLOADS_URL } from '../../config'; // <-- Añadir esta línea

// Opcional: Importar un editor Rich Text
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

const BlogPostForm = ({ isEditMode = false }) => {
  const { postId } = useParams(); // Para modo edición
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState(null); // Para mostrar banner actual en edición
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos del post si estamos en modo edición
  useEffect(() => {
    if (isEditMode && postId) {
      setLoading(true);
      api.get(`/api/blog/id/${postId}`)
        .then(response => {
          const post = response.data;
          setTitle(post.title);
          setSubtitle(post.subtitle || '');
          setContent(post.content);
          setMetaDescription(post.meta_description || '');
          setMetaTitle(post.meta_title || '');
          setMetaKeywords(post.meta_keywords || '');
          setCurrentBannerUrl(post.banner_url);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching post for edit:", err);
          setError("No se pudo cargar el post para editar.");
          setLoading(false);
        });
    }
  }, [isEditMode, postId]);

  // Endpoint GET /blog/id/:id (Añadir al backend si no existe)
  /* En routes/blog.py:
  @blog_bp.route('/id/<int:post_id>', methods=['GET'])
  @admin_required # Opcional si solo admin edita
  def get_post_by_id(post_id):
      post = db.session.get(BlogPost, post_id)
      if not post:
          abort(404, description="Post no encontrado.")
      return jsonify(post.to_dict(full=True))
  */

  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null); // Limpiar error si había uno de tipo de archivo
    } else if (file) {
      setError('Por favor, selecciona un archivo de imagen válido (JPG, PNG, GIF, WEBP).');
      setBannerFile(null);
      setBannerPreview(null);
    } else {
        // Si deselecciona el archivo
        setBannerFile(null);
        setBannerPreview(null);
    }
  };

  const handleGenerateAI = async () => {
    if (!title) {
      setAiError("Por favor, introduce un título o tema para generar el contenido.");
      return;
    }
    setGeneratingAI(true);
    setAiError(null);
    try {
      const response = await api.post('/api/blog/generate-content', { prompt: title });
      setContent(response.data.content);
      setMetaDescription(response.data.meta_description);
    } catch (err) {
      console.error("Error generating AI content:", err);
      setAiError(`Error al generar contenido: ${err.response?.data?.error || err.message}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !content) {
      setError("El título y el contenido son obligatorios.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('content', content);
    formData.append('meta_description', metaDescription);
    formData.append('meta_title', metaTitle);
    formData.append('meta_keywords', metaKeywords);
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    try {
      let response;
      if (isEditMode) {
        response = await api.put(`/api/blog/${postId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess("Post actualizado con éxito.");
      } else {
        response = await api.post('/api/blog', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess("Post creado con éxito.");
      }

      // Redirigir a la gestión del blog después de un breve retraso
      setTimeout(() => {
        navigate('/admin/blog');
      }, 1500);

    } catch (err) {
      console.error("Error saving post:", err);
      setError(`Error al guardar el post: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sanitizar HTML para preview
   const createPreviewMarkup = useCallback(() => {
    return { __html: DOMPurify.sanitize(content) };
  }, [content]);

  if (loading && isEditMode && !title) { // Muestra loading solo al cargar para editar
      return <CircularProgress />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Editar Post' : 'Crear Nuevo Post'}
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Título del Post"
            name="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || generatingAI}
          />
          <TextField
            margin="normal"
            fullWidth
            id="subtitle"
            label="Subtítulo (Opcional)"
            name="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            disabled={loading || generatingAI}
          />
          <TextField
            margin="normal"
            fullWidth
            id="meta_description"
            label="Meta Descripción SEO (Máx 160 caracteres)"
            name="meta_description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
            inputProps={{ maxLength: 160 }}
            helperText={`${metaDescription.length}/160`}
            disabled={loading || generatingAI}
          />
          <TextField
            margin="normal"
            fullWidth
            id="meta_title"
            label="Título SEO (Máx 70 caracteres)"
            name="meta_title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value.slice(0, 70))}
            inputProps={{ maxLength: 70 }}
            helperText={`${metaTitle.length}/70`}
            disabled={loading || generatingAI}
          />
          <TextField
            margin="normal"
            fullWidth
            id="meta_keywords"
            label="Keywords SEO (separadas por comas)"
            name="meta_keywords"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value.slice(0, 300))}
            inputProps={{ maxLength: 300 }}
            disabled={loading || generatingAI}
          />

          <Box sx={{ my: 2 }}>
            <Button
              variant="outlined"
              onClick={handleGenerateAI}
              disabled={loading || generatingAI || !title}
            >
              {generatingAI ? <CircularProgress size={24} /> : 'Generar Contenido y Meta Desc. con IA'}
            </Button>
            {aiError && <Alert severity="warning" sx={{ mt: 1 }}>{aiError}</Alert>}
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Contenido del Post</Typography>
          {/* Opcional: Reemplazar TextField con ReactQuill u otro editor */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="content"
            label="Contenido (HTML permitido)"
            name="content"
            multiline
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading || generatingAI}
            variant="outlined"
          />
           {/* <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '400px', marginBottom: '50px' }}/> */}


          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Banner</Typography>
          <Button
            variant="outlined"
            component="label"
            disabled={loading || generatingAI}
          >
            {bannerFile ? "Cambiar Banner" : "Subir Banner"}
            <input
              type="file"
              hidden
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleBannerChange}
            />
          </Button>
          {bannerPreview && (
            <Box sx={{ mt: 2, maxWidth: 300 }}>
              <Typography variant="caption">Nuevo Banner (Preview):</Typography>
              <img src={bannerPreview} alt="Preview del banner" style={{ width: '100%', height: 'auto', marginTop: '8px' }} />
            </Box>
          )}
          {!bannerPreview && currentBannerUrl && isEditMode && (
             <Box sx={{ mt: 2, maxWidth: 300 }}>
               <Typography variant="caption">Banner Actual:</Typography>
               <img src={`${UPLOADS_URL}/${currentBannerUrl}`} alt="Banner actual" style={{ width: '100%', height: 'auto', marginTop: '8px' }} />
             </Box>
          )}


          <Box sx={{ my: 3 }}>
            <FormControlLabel
                control={<Switch checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />}
                label="Mostrar Preview del Contenido"
            />
            {showPreview && (
                <Paper variant="outlined" sx={{ p: 2, mt: 1, maxHeight: '400px', overflowY: 'auto', '& img': { maxWidth: '100%', height: 'auto' } }}>
                     <Typography variant="h6" gutterBottom>Preview:</Typography>
                     <Divider sx={{mb: 1}}/>
                     <div dangerouslySetInnerHTML={createPreviewMarkup()} />
                </Paper>
            )}
          </Box>


          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
             <Button
                variant="outlined"
                onClick={() => navigate('/admin/blog')}
                disabled={loading}
             >
                Cancelar
             </Button>
             <Button
              type="submit"
              variant="contained"
              disabled={loading || generatingAI}
            >
              {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Actualizar Post' : 'Crear Post')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BlogPostForm; 