import { Paper, Button, Box, Typography } from '@mui/material';
import { GetApp } from '@mui/icons-material';

const InstallBanner = ({ onInstall, onClose }) => (
  <Paper 
    sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0,
      p: 2,
      bgcolor: 'primary.main',
      color: 'white',
      zIndex: 1000
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body1">
        ¡Instala Doctorfy para una mejor experiencia!
      </Typography>
      <Box>
        <Button color="inherit" onClick={onClose}>
          Después
        </Button>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onInstall}
          startIcon={<GetApp />}
        >
          Instalar
        </Button>
      </Box>
    </Box>
  </Paper>
);

export default InstallBanner; 