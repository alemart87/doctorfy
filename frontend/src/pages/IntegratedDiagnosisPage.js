import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Container, Typography, Button, Box, Paper, CircularProgress,
    Checkbox, List, ListItem, /* ListItemText, ListItemIcon, */ TextField, // ListItemText y ListItemIcon no se usan directamente ahora
    Alert, Grid, Chip, Tooltip, Divider, IconButton,
    Fade // Para transiciones suaves
} from '@mui/material';
import { 
    FaBrain, FaNotesMedical, FaUserMd, FaListOl, 
    FaXRay, FaFileMedicalAlt, FaVial, FaDotCircle, FaCalendarAlt,
    FaShareAlt, FaCopy, FaImage, FaChevronRight, FaExclamationTriangle, FaCheckCircle // Nuevos íconos
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Asumiendo que tienes un contexto de autenticación
import api from '../api/axios'; // Tu instancia configurada de Axios
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas'; // Importar html2canvas

// Helper para formatear fechas (puedes moverlo a un archivo utils si lo usas en más sitios)
const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric', // 'numeric' en lugar de '2-digit' para evitar ceros iniciales si se prefiere
        month: 'long',
        year: 'numeric',
    });
};

// Helper para obtener un ícono simple basado en el tipo de estudio (opcional)
const getStudyIcon = (studyType, selected) => {
    const type = studyType?.toLowerCase() || 'general';
    const iconProps = { size: 22, color: selected ? '#00bfff' : '#AEAEB2' }; // Color dinámico
    if (type.includes('ray') || type.includes('radiografía') || type.includes('x-ray')) return <FaXRay {...iconProps} />;
    if (type.includes('blood') || type.includes('sangre') || type.includes('hemograma')) return <FaVial {...iconProps} />;
    if (type.includes('resonancia') || type.includes('mri')) return <FaDotCircle {...iconProps} />;
    if (type.includes('tomografía') || type.includes('ct scan') || type.includes('tac')) return <FaDotCircle {...iconProps} />;
    if (type.includes('ecografía') || type.includes('ultrasonido') || type.includes('ultrasound')) return <FaDotCircle {...iconProps} />;
    return <FaFileMedicalAlt {...iconProps} />; 
};

const IntegratedDiagnosisPage = () => {
    const { user } = useAuth(); // Obtener información del usuario si es necesario para créditos, etc.
    const [availableStudies, setAvailableStudies] = useState([]);
    const [selectedStudyIds, setSelectedStudyIds] = useState([]);
    const [symptomsText, setSymptomsText] = useState('');
    const [diagnosisResult, setDiagnosisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStudies, setIsLoadingStudies] = useState(true); // Estado separado para carga de estudios
    const [error, setError] = useState(null);
    const [userCredits, setUserCredits] = useState(null); // Para mostrar créditos
    const [shareFeedback, setShareFeedback] = useState(''); // Para notificar copia exitosa

    const reportContentRef = useRef(null); // Ref para el contenido del informe
    const symptomsInputRef = useRef(null); // Ref para el campo de síntomas

    const fetchUserCredits = useCallback(async () => {
        try {
            const response = await api.get('/users/me'); // Endpoint para obtener datos del usuario actual
            setUserCredits(response.data.credits);
        } catch (err) {
            console.error('Error al obtener créditos del usuario:', err);
            // No establecer error aquí para no bloquear la funcionalidad principal
        }
    }, []);

    const fetchAvailableStudies = useCallback(async () => {
        setIsLoadingStudies(true); // Usar el nuevo estado
        setError(null);
        try {
            const response = await api.get('/medical-studies/studies'); 
            const interpretableStudies = response.data.studies.filter(study => study.interpretation && study.interpretation.trim() !== '');
            interpretableStudies.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            setAvailableStudies(interpretableStudies);
        } catch (err) {
            console.error('Error al obtener estudios disponibles:', err);
            setError('No se pudieron cargar los estudios disponibles. Inténtalo de nuevo más tarde.');
        } finally {
            setIsLoadingStudies(false); // Usar el nuevo estado
        }
    }, []);

    useEffect(() => {
        fetchUserCredits();
        fetchAvailableStudies();
    }, [fetchUserCredits, fetchAvailableStudies]);

    const handleStudyToggle = (studyId) => {
        setSelectedStudyIds((prevSelected) =>
            prevSelected.includes(studyId)
                ? prevSelected.filter((id) => id !== studyId)
                : [...prevSelected, studyId]
        );
    };

    const handleSubmitDiagnosis = async () => {
        if (selectedStudyIds.length === 0 && !symptomsText.trim()) {
            setError('Debes seleccionar al menos un estudio o ingresar tus síntomas.');
            if (symptomsInputRef.current) { // Enfocar el campo de síntomas si está vacío
                symptomsInputRef.current.focus();
            }
            return;
        }

        // Verificar créditos (asumiendo que el backend también lo hace)
        const requiredCredits = 10; // Sincronizar con el backend
        if (userCredits !== null && userCredits < requiredCredits) {
            setError(`No tienes suficientes créditos para esta acción. Necesitas ${requiredCredits} créditos, pero tienes ${userCredits}.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setDiagnosisResult('');
        setShareFeedback(''); // Limpiar feedback de compartir al generar nuevo diagnóstico

        try {
            const payload = {
                study_ids: selectedStudyIds,
                symptoms_text: symptomsText,
            };
            const response = await api.post('/diagnosis/generate', payload);
            setDiagnosisResult(response.data.diagnosis);
            if (response.data.credits_remaining !== undefined) {
                setUserCredits(response.data.credits_remaining); // Actualizar créditos
            }
        } catch (err) {
            console.error('Error al generar diagnóstico:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Error: ${err.response.data.error}. ${err.response.data.message || ''}`);
            } else {
                setError('Ocurrió un error al generar el diagnóstico. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (diagnosisResult) {
            navigator.clipboard.writeText(diagnosisResult)
                .then(() => {
                    setShareFeedback('¡Informe copiado al portapapeles!');
                    setTimeout(() => setShareFeedback(''), 3000); // Limpiar mensaje después de 3s
                })
                .catch(err => {
                    console.error('Error al copiar el informe: ', err);
                    setShareFeedback('Error al copiar. Inténtalo manualmente.');
                    setTimeout(() => setShareFeedback(''), 3000);
                });
        }
    };

    const handleDownloadAsImage = () => {
        if (reportContentRef.current) {
            html2canvas(reportContentRef.current, { 
                backgroundColor: '#2a2a2a', // Fondo oscuro para la imagen
                scale: 2, // Mejorar resolución
                useCORS: true // Si hay imágenes externas en el markdown (poco probable aquí)
            }).then(canvas => {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = 'diagnostico_integrado.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setShareFeedback('¡Informe descargado como imagen!');
                setTimeout(() => setShareFeedback(''), 3000);
            }).catch(err => {
                console.error('Error al descargar como imagen: ', err);
                setShareFeedback('Error al descargar la imagen.');
                setTimeout(() => setShareFeedback(''), 3000);
            });
        }
    };
    
    const handleNativeShare = async () => {
        if (navigator.share && diagnosisResult) {
            try {
                await navigator.share({
                    title: 'Diagnóstico Integrado - Doctorfy',
                    text: 'He generado un informe de diagnóstico integrado. Aquí están los detalles:\n\n' + diagnosisResult,
                    // url: window.location.href // Podrías compartir la URL si el informe fuera persistente
                });
                setShareFeedback('¡Informe compartido!');
                 setTimeout(() => setShareFeedback(''), 3000);
            } catch (error) {
                console.error('Error al compartir de forma nativa:', error);
                if (error.name !== 'AbortError') { // No mostrar error si el usuario cancela
                    setShareFeedback('Error al intentar compartir.');
                    setTimeout(() => setShareFeedback(''), 3000);
                }
            }
        } else if (diagnosisResult) {
            // Fallback si navigator.share no está disponible (ya cubierto por copiar/descargar)
            // O podrías mostrar un mensaje "La compartición nativa no está disponible en este navegador."
            // Por ahora, nos apoyamos en los otros botones.
            handleCopyToClipboard(); // Como fallback simple
            setShareFeedback('La compartición nativa no está disponible. ¡Informe copiado!');
            setTimeout(() => setShareFeedback(''), 3000);
        }
    };

    // Estilos para el scrollbar de la lista de estudios
    const scrollbarStyles = {
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: '#2a2a2a', // Fondo del track
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#555', // Color del thumb
            borderRadius: '4px',
            border: '2px solid #2a2a2a', // Espacio alrededor del thumb
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#777', // Color del thumb al pasar el cursor
        },
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, backgroundColor: '#101012', color: 'white', minHeight: 'calc(100vh - 64px)' }}>
            <Paper 
                elevation={6} // Sombra más pronunciada
                sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    backgroundColor: '#1C1C1E', // Un poco más claro que el fondo general
                    borderRadius: '12px', // Bordes más redondeados
                    border: '1px solid #38383A', // Borde sutil
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', // Sombra más elaborada
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, borderBottom: '1px solid #38383A', pb: 2.5 }}>
                    <FaBrain size={40} style={{ marginRight: '16px', color: '#0A84FF' }} /> {/* Azul iOS */}
                    <Typography variant="h4" component="h1" sx={{ fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>
                        Análisis Diagnóstico Integrado
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3.5, color: '#AEAEB2', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    Selecciona tus estudios médicos analizados y describe tus síntomas actuales. Nuestra IA integrará esta información para ofrecerte una perspectiva diagnóstica preliminar.
                </Typography>

                {userCredits !== null && (
                    <Chip
                        icon={<FaNotesMedical style={{ color: userCredits >= 10 ? '#30D158' : '#FF9F0A' }}/>} // Icono con color dinámico
                        label={
                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                {`Créditos: ${userCredits}`}
                                <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#8E8E93' }}>
                                    (costo: 10)
                                </Typography>
                            </Typography>
                        }
                        sx={{ 
                            mb: 4, 
                            backgroundColor: '#2C2C2E', 
                            color: 'white', 
                            height: '36px',
                            border: `1px solid ${userCredits >= 10 ? '#30D158' : '#FF9F0A'}`, // Borde con color dinámico
                            p: '0 12px',
                            '.MuiChip-label': { p: '0 8px' }
                        }}
                    />
                )}

                <Grid container spacing={{ xs: 3, md: 5 }}>
                    {/* Columna de Selección de Estudios */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <FaListOl style={{ marginRight: '10px', color: '#8E8E93' }} size={20}/>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: '#E5E5EA' }}>
                                1. Selecciona Estudios
                            </Typography>
                        </Box>
                        {isLoadingStudies ? ( // Usar isLoadingStudies
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, backgroundColor: '#2C2C2E', borderRadius: '8px' }}>
                                <CircularProgress sx={{ color: '#0A84FF' }}/>
                            </Box>
                        ) : availableStudies.length > 0 ? (
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    maxHeight: { xs: 300, md: 420 }, // Altura ajustada
                                    overflow: 'auto', 
                                    backgroundColor: '#2C2C2E', 
                                    borderColor: '#38383A', 
                                    borderRadius: '8px',
                                    p: 0.5, // Padding reducido para que los ListItems se ajusten mejor
                                    ...scrollbarStyles // Aplicar estilos de scrollbar
                                }}
                            >
                                <List dense sx={{ width: '100%', p:0 }}>
                                    {availableStudies.map((study, index) => (
                                        <React.Fragment key={study.id}>
                                            <ListItem
                                                onClick={() => handleStudyToggle(study.id)}
                                                sx={{
                                                    flexDirection: 'column',
                                                    alignItems: 'stretch',
                                                    // my: 0.5, // Eliminado para control con Divider
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedStudyIds.includes(study.id) ? 'rgba(10, 132, 255, 0.15)' : 'transparent',
                                                    border: `1px solid ${selectedStudyIds.includes(study.id) ? '#0A84FF' : 'transparent'}`,
                                                    p: { xs: 1, sm: 1.5 },
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: selectedStudyIds.includes(study.id) ? 'rgba(10, 132, 255, 0.25)' : 'rgba(255,255,255,0.03)',
                                                        borderColor: selectedStudyIds.includes(study.id) ? '#0A84FF' : '#48484A',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.8 }}>
                                                    <Checkbox
                                                        checked={selectedStudyIds.includes(study.id)}
                                                        disableRipple
                                                        icon={<Box sx={{ width: 20, height: 20, border: '2px solid #555', borderRadius: '4px' }} />}
                                                        checkedIcon={<Box sx={{ width: 20, height: 20, backgroundColor: '#0A84FF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheckCircle size={14} color="#1C1C1E" /></Box>}
                                                        sx={{ p: 0, mr: 1.5, alignSelf: 'flex-start', mt: '3px' }}
                                                    />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography
                                                            variant="body1" // Un poco más grande
                                                            sx={{
                                                                color: selectedStudyIds.includes(study.id) ? '#0A84FF' : '#F2F2F7', // Blanco iOS
                                                                fontWeight: selectedStudyIds.includes(study.id) ? '600' : '500',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {getStudyIcon(study.study_type, selectedStudyIds.includes(study.id))}
                                                            <span style={{ marginLeft: '10px' }}>{study.name || `Estudio de ${study.study_type}`}</span>
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#8E8E93', display: 'flex', alignItems: 'center', mt: 0.3, fontSize: '0.8rem' }}>
                                                            <FaCalendarAlt size={11} style={{ marginRight: '5px' }} /> {formatDate(study.updated_at)}
                                                            <span style={{ margin: '0 5px' }}>&bull;</span>
                                                            {study.study_type}
                                                        </Typography>
                                                    </Box>
                                                    {selectedStudyIds.includes(study.id) && <FaChevronRight style={{ color: '#0A84FF', marginLeft: 'auto', alignSelf: 'center' }} />}
                                                </Box>

                                                {study.interpretation && (
                                                    <Fade in={true} timeout={300}>
                                                        <Box sx={{ pl: '38px', width: '100%' }}>
                                                            {/* <Divider sx={{ my: 0.8, borderColor: '#38383A' }} /> */}
                                                            <Tooltip title={study.interpretation} placement="bottom-start" arrow 
                                                                PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 8], },},],}}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: '#AEAEB2',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2, // Reducido a 2 para más concisión
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        lineHeight: 1.5,
                                                                        fontSize: '0.85rem',
                                                                        maxHeight: 'calc(1.5em * 2)',
                                                                        minHeight: 'calc(1.5em * 1)',
                                                                    }}
                                                                >
                                                                    {study.interpretation}
                                                                </Typography>
                                                            </Tooltip>
                                                        </Box>
                                                    </Fade>
                                                )}
                                            </ListItem>
                                            {index < availableStudies.length - 1 && <Divider sx={{ borderColor: '#38383A', mx:1 }} />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        ) : (
                             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 200, backgroundColor: '#2C2C2E', borderRadius: '8px', p:2, textAlign: 'center' }}>
                                <FaExclamationTriangle size={30} style={{ color: '#FF9F0A', marginBottom: '12px' }} />
                                <Typography sx={{ color: '#AEAEB2' }}>
                                    No hay estudios con interpretaciones disponibles.
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#8E8E93', mt:0.5 }}>
                                    Analiza tus estudios en "Estudios Médicos" primero.
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Columna de Descripción de Síntomas */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <FaNotesMedical style={{ marginRight: '10px', color: '#8E8E93' }} size={20}/>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: '#E5E5EA' }}>
                                2. Describe tus Síntomas
                            </Typography>
                        </Box>
                        <TextField
                            inputRef={symptomsInputRef}
                            label="Describe tus síntomas actuales detalladamente"
                            multiline
                            rows={availableStudies.length > 0 ? 10 : 15} // Más filas si no hay estudios
                            value={symptomsText}
                            onChange={(e) => setSymptomsText(e.target.value)}
                            variant="outlined"
                            fullWidth
                            placeholder="Ej: Fiebre de 38.5°C persistente desde hace 3 días, dolor de cabeza punzante en la sien derecha, fatiga extrema que dificulta actividades diarias, tos seca ocasional..."
                            sx={{
                                backgroundColor: '#2C2C2E',
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#38383A' },
                                    '&:hover fieldset': { borderColor: '#58585A' },
                                    '&.Mui-focused fieldset': { borderColor: '#0A84FF', borderWidth: '1px' },
                                    color: '#F2F2F7',
                                    fontSize: '1rem',
                                    '& .MuiOutlinedInput-input': {
                                        ...scrollbarStyles, // Aplicar estilos de scrollbar al textarea
                                        padding: '14px', // Ajustar padding interno
                                    }
                                },
                                '& .MuiInputLabel-root': { color: '#8E8E93' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#0A84FF' },
                            }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                            if (selectedStudyIds.length === 0 && !symptomsText.trim()) {
                                setError('Debes seleccionar al menos un estudio o ingresar tus síntomas.');
                                if (symptomsInputRef.current) { // Enfocar el campo de síntomas si está vacío
                                    symptomsInputRef.current.focus();
                                }
                                return;
                            }
                            handleSubmitDiagnosis();
                        }}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={22} sx={{color: '#1C1C1E'}} /> : <FaUserMd />}
                        sx={{ 
                            minWidth: { xs: '100%', sm: 300 }, 
                            py: 1.5, 
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            backgroundColor: '#0A84FF',
                            color: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)',
                            transition: 'background-color 0.2s ease, transform 0.1s ease',
                            '&:hover': { 
                                backgroundColor: '#007AFF', // Un azul ligeramente más oscuro al pasar el cursor
                                transform: 'scale(1.02)',
                            },
                            '&.Mui-disabled': { 
                                backgroundColor: '#2C2C2E', 
                                color: '#58585A',
                                boxShadow: 'none',
                            }
                        }}
                    >
                        {isLoading ? 'Generando Análisis...' : 'Generar Análisis Integrado'}
                    </Button>
                    {error && !isLoading && ( // Mostrar error solo si no está cargando
                        <Alert 
                            severity="error" 
                            icon={<FaExclamationTriangle fontSize="inherit" />}
                            sx={{ 
                                mt: 2, 
                                backgroundColor: 'rgba(255, 59, 48, 0.15)', // Rojo iOS error
                                color: '#FF3B30', 
                                borderRadius: '8px',
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: 500,
                                '& .MuiAlert-icon': { color: '#FF3B30' }
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                </Box>

                {/* Sección de Resultados del Diagnóstico */}
                {diagnosisResult && !isLoading && (
                    <Fade in={true} timeout={500}>
                        <Paper 
                            elevation={4} 
                            sx={{ 
                                mt: 5, 
                                p: { xs: 2, sm: 3 }, 
                                backgroundColor: '#2C2C2E', 
                                borderRadius: '12px', 
                                border: '1px solid #38383A' 
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, borderBottom: '1px solid #38383A', pb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: '600', color: 'white' }}>
                                    Análisis Diagnóstico Preliminar
                                </Typography>
                                <Box>
                                    {navigator.share && (
                                        <Tooltip title="Compartir">
                                            <IconButton onClick={handleNativeShare} size="medium" sx={{ color: '#0A84FF', '&:hover': { backgroundColor: 'rgba(10, 132, 255, 0.1)'}, mr: 0.5 }}>
                                                <FaShareAlt size={18}/>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Copiar Texto">
                                        <IconButton onClick={handleCopyToClipboard} size="medium" sx={{ color: '#0A84FF', '&:hover': { backgroundColor: 'rgba(10, 132, 255, 0.1)'}, mr: 0.5 }}>
                                            <FaCopy size={18}/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Descargar PNG">
                                        <IconButton onClick={handleDownloadAsImage} size="medium" sx={{ color: '#0A84FF', '&:hover': { backgroundColor: 'rgba(10, 132, 255, 0.1)'} }}>
                                            <FaImage size={18}/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            {shareFeedback && (
                                <Alert 
                                    severity={shareFeedback.startsWith('Error') ? "error" : "success"} 
                                    iconMapping={{
                                        success: <FaCheckCircle fontSize="inherit" />,
                                        error: <FaExclamationTriangle fontSize="inherit" />
                                    }}
                                    sx={{ 
                                        mb: 2.5, 
                                        fontSize: '0.9rem', 
                                        borderRadius: '8px',
                                        backgroundColor: shareFeedback.startsWith('Error') ? 'rgba(255, 59, 48, 0.15)' : 'rgba(48, 209, 88, 0.15)', // Verde iOS
                                        color: shareFeedback.startsWith('Error') ? '#FF3B30' : '#30D158',
                                        '& .MuiAlert-icon': { color: shareFeedback.startsWith('Error') ? '#FF3B30' : '#30D158' }
                                    }}
                                >
                                    {shareFeedback}
                                </Alert>
                            )}
                            <Box 
                                ref={reportContentRef} 
                                sx={{
                                    color: '#E5E5EA',
                                    p: {xs: 0, sm: 1}, // Padding para la captura de imagen
                                    backgroundColor: '#2C2C2E',
                                    fontSize: '0.95rem',
                                    '& h1': { fontSize: '1.7rem', color: 'white', borderBottom: '1px solid #48484A', pb:1, mb:2.5, fontWeight: '600' },
                                    '& h2': { fontSize: '1.4rem', color: '#F2F2F7', mt:3, mb:1.5, fontWeight: '600' },
                                    '& h3': { fontSize: '1.2rem', color: '#E5E5EA', mt:2.5, mb:1, fontWeight: '500' },
                                    '& p': { lineHeight: 1.7, mb: 1.5, color: '#AEAEB2' },
                                    '& ul, & ol': { pl: 3, mb: 1.5, color: '#AEAEB2' },
                                    '& li': { mb: 0.7 },
                                    '& strong': { color: '#F2F2F7', fontWeight: '600' },
                                    '& code': { backgroundColor: '#3A3A3C', color: '#FF9F0A', padding: '3px 6px', borderRadius: '6px', fontSize: '0.85em'},
                                    '& blockquote': { borderLeft: '4px solid #58585A', pl: 2, ml:0, my: 2, fontStyle: 'italic', color: '#8E8E93'},
                                    '& table': { width: '100%', borderCollapse: 'collapse', my: 2 },
                                    '& th, & td': { border: '1px solid #48484A', p: '8px 12px', textAlign: 'left' },
                                    '& th': { backgroundColor: '#3A3A3C', fontWeight: '600', color: '#F2F2F7' }
                                }}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {diagnosisResult}
                                </ReactMarkdown>
                            </Box>
                        </Paper>
                    </Fade>
                )}
            </Paper>
        </Container>
    );
};

export default IntegratedDiagnosisPage; 