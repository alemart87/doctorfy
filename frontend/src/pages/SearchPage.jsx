import React, { useState } from 'react';
import { Container, Typography, TextField, Box, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios'; // Si vas a buscar en el backend

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (query.length < 3) { // No buscar si es muy corto
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // --- AQUÍ IRÍA TU LÓGICA DE BÚSQUEDA ---
      // Ejemplo: Llamada a API
      // const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      // setResults(response.data.results || []);

      // Ejemplo: Datos Ficticios
      console.log("Buscando:", query);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      const mockResults = [
        { id: 1, title: `Resultado para "${query}" 1`, type: 'Doctor' },
        { id: 2, title: `Resultado para "${query}" 2`, type: 'Blog' },
        { id: 3, title: `Otro resultado sobre "${query}"`, type: 'Guía' },
      ];
      setResults(mockResults);
      // --- FIN LÓGICA DE BÚSQUEDA ---

    } catch (err) {
      console.error("Error en la búsqueda:", err);
      setError('Error al realizar la búsqueda.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Buscar en Doctorfy</Typography>
      <TextField
        fullWidth
        label="Escribe tu búsqueda..."
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
      />

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
      {error && <Typography color="error" sx={{ my: 2 }}>{error}</Typography>}

      {!loading && searchTerm.length >= 3 && results.length === 0 && (
        <Typography sx={{ my: 2 }}>No se encontraron resultados para "{searchTerm}".</Typography>
      )}

      <List>
        {results.map((result) => (
          <ListItem key={result.id} divider>
            <ListItemText
              primary={result.title}
              secondary={`Tipo: ${result.type}`}
              // Aquí podrías hacer el ListItem un Link a la página del resultado
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SearchPage; 