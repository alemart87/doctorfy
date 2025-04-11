import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Button, 
  TextField,
  InputAdornment,
  Fade,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import StudyCard from '../components/StudyCard';
import MedicalStudyUploader from '../components/MedicalStudyUploader';
import { medicalStudiesService } from '../services/api';

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const response = await medicalStudiesService.getStudies();
      setStudies(response.data.studies);
    } catch (err) {
      setError('Error al cargar los estudios médicos');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudies = studies.filter(study => 
    (study.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.study_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadSuccess = (updatedStudy) => {
    setUploadDialogOpen(false);
    setSelectedStudy(null);
    if (updatedStudy.id) {
      setStudies(studies.map(study => 
        study.id === updatedStudy.id ? updatedStudy : study
      ));
    } else {
      setStudies([updatedStudy, ...studies]);
    }
  };

  const handleEdit = (study) => {
    setSelectedStudy(study);
    setUploadDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Estudios Médicos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedStudy(null);
              setUploadDialogOpen(true);
            }}
          >
            Nuevo Estudio
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar estudios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredStudies.length > 0 ? (
        <Grid container spacing={3}>
          {filteredStudies.map((study) => (
            <Grid item xs={12} sm={6} md={4} key={study.id}>
              <Fade in timeout={300}>
                <div>
                  <StudyCard 
                    study={study}
                    onEdit={handleEdit}
                  />
                </div>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          No se encontraron estudios médicos. 
          {searchTerm ? ' Intenta con otros términos de búsqueda.' : ''}
        </Alert>
      )}

      <MedicalStudyUploader
        open={uploadDialogOpen}
        onClose={() => {
          setUploadDialogOpen(false);
          setSelectedStudy(null);
        }}
        onSuccess={handleUploadSuccess}
        study={selectedStudy}
      />
    </Container>
  );
};

export default MedicalStudies; 