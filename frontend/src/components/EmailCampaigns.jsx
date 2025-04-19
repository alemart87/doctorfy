import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { Email as EmailIcon, Send as SendIcon, Preview as PreviewIcon } from '@mui/icons-material';
import axios from 'axios';

const EMAIL_TEMPLATES = {
  ceo_welcome: "Mensaje de Bienvenida del CEO",
  platform_benefits: "Beneficios de la Plataforma",
  follow_up: "Seguimiento de Satisfacción",
  custom: "Plantilla Personalizada"
};

const EmailCampaigns = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleSendEmails = async () => {
    try {
      setSending(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post('/api/admin/send-mass-email', {
        template: selectedTemplate,
        customSubject: customSubject,
        customBody: customBody
      }, {
        timeout: 300000 // 5 minutos de timeout
      });
      
      setSuccess(`${response.data.message}`);
      
      // Mostrar detalles adicionales si hay fallos
      if (response.data.failed > 0) {
        setError(`No se pudo enviar a: ${response.data.failed_emails.join(', ')}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al enviar los correos. Por favor, intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EmailIcon sx={{ mr: 1 }} />
        Campañas de Email
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Seleccionar Plantilla</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              label="Seleccionar Plantilla"
            >
              {Object.entries(EMAIL_TEMPLATES).map(([key, name]) => (
                <MenuItem key={key} value={key}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {selectedTemplate === 'custom' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asunto del Correo"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Contenido del Correo (HTML permitido)"
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreview(true)}
              disabled={!selectedTemplate || sending}
            >
              Vista Previa
            </Button>
            <Button
              variant="contained"
              startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleSendEmails}
              disabled={!selectedTemplate || sending}
              sx={{ position: 'relative' }}
            >
              {sending ? 'Enviando correos...' : 'Enviar a Todos los Usuarios'}
            </Button>
          </Box>
        </Grid>

        {sending && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Enviando correos masivos. Este proceso puede tomar varios minutos...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Grid>

      {/* Modal de Vista Previa (puedes implementarlo con un Dialog de MUI) */}
    </Paper>
  );
};

export default EmailCampaigns; 