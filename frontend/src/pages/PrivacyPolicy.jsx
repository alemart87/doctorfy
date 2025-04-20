import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Política de Privacidad
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Última actualización: {new Date().toLocaleDateString()}
          </Typography>

          <Typography paragraph>
            En Doctorfy, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe cómo recopilamos, usamos y protegemos su información personal.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Información que recopilamos
          </Typography>
          <Typography paragraph>
            • Información de la cuenta (email, nombre)
            • Información médica proporcionada voluntariamente
            • Datos de uso del servicio
            • Información de inicio de sesión con Google
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. Cómo usamos su información
          </Typography>
          <Typography paragraph>
            • Para proporcionar nuestros servicios médicos y de análisis
            • Para mejorar nuestros servicios
            • Para comunicarnos con usted
            • Para procesar pagos y gestionar su cuenta
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Compartir información
          </Typography>
          <Typography paragraph>
            No vendemos ni compartimos su información personal con terceros, excepto:
            • Con su consentimiento explícito
            • Para cumplir con requisitos legales
            • Con proveedores de servicios que nos ayudan a operar
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Seguridad
          </Typography>
          <Typography paragraph>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o alteración.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Sus derechos
          </Typography>
          <Typography paragraph>
            Usted tiene derecho a:
            • Acceder a su información personal
            • Corregir información inexacta
            • Solicitar la eliminación de sus datos
            • Retirar su consentimiento
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Contacto
          </Typography>
          <Typography paragraph>
            Para cualquier pregunta sobre esta política o sus datos personales, contáctenos en:
            info@marketeapy.com
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;