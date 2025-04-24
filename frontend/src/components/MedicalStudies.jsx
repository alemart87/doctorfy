import { Link } from 'react-router-dom';

{studies.map((study) => (
  <Grid item xs={12} sm={6} md={4} key={study.id}>
    <Card>
      <CardContent>
        <Typography variant="h6">{study.study_type}</Typography>
        <Typography variant="body2">
          Fecha: {new Date(study.created_at).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">
          Estado: {
            study.interpretation 
              ? (study.interpretation.includes('[ANÁLISIS AUTOMÁTICO CON IA]') 
                ? 'Analizado por IA' 
                : 'Interpretado por médico')
              : 'Pendiente'
          }
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          component={Link} 
          to={`/medical-studies/${study.id}`}
          size="small" 
          color="primary"
        >
          Ver Detalles
        </Button>
      </CardActions>
    </Card>
  </Grid>
))} 