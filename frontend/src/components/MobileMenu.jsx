import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useAuth } from '../context/AuthContext';

const MobileMenu = ({ onClose, items }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (href) => {
    if (href === '/logout') {
      logout();
    } else {
      navigate(href);
    }
    onClose();
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(13, 17, 23, 0.95)',
        backdropFilter: 'blur(10px)',
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        px: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalHospitalIcon sx={{ mr: 1, color: '#00bcd4' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Doctorfy
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Profile */}
      {user && (
        <Box sx={{ 
          p: 2, 
          mb: 2,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar 
            src={user.profilePic} 
            alt={user.name}
            sx={{ 
              width: 40, 
              height: 40,
              border: '2px solid #00bcd4'
            }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
              {user.name || 'Usuario'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {user.email || 'usuario@ejemplo.com'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ width: '100%', flex: 1 }}>
        {items.map((item, index) => (
          <ListItem 
            key={index}
            button
            onClick={() => handleNavigation(item.href)}
            sx={{
              borderRadius: '12px',
              mb: 1,
              p: 1.5,
              background: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  {item.label}
                </Typography>
              } 
            />
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ 
        mt: 'auto', 
        pt: 2, 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          © {new Date().getFullYear()} Doctorfy
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileMenu; 