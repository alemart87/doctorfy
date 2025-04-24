import { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LetterGlitch from './LetterGlitch';

const IntroModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const id = setTimeout(()=> setOpen(true), 3000);
    return ()=>clearTimeout(id);
  },[]);

  const handleClose = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      PaperProps={{
        sx:{
          bgcolor:'rgba(0,0,0,0.20)',
          backdropFilter:'blur(4px)',
          borderRadius:3,
          p:3,
          textAlign:'center',
          overflow:'hidden',
          border:'none',
          boxShadow:'none'
        }
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ px:{xs:0}, py:0, overflow:'hidden' }}>
        {/* Contenedor glitch + texto fijo */}
        <Box
          sx={{
            position:'relative',
            width:'100%',
            maxWidth:{ sm:'60vw' },
            height:260,
            overflow:'hidden'
          }}
        >
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
          />
          {/* Texto centrado encima del canvas */}
          <Box
            sx={{
              position:'absolute',
              inset:0,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              px:2,
              textAlign:'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight:800,
                fontSize:{ xs:'1.4rem', sm:'1.8rem' },
                lineHeight:1.3,
                background:`linear-gradient(90deg,#00e5ff, #ffffff)`,
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
              }}
            >
              CONTAR CALORÍAS CON IA,<br/>AHORA CON DOCTORFY
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default IntroModal; 