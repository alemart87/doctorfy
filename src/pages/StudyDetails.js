import React, { useEffect } from 'react';

const StudyDetails = () => {
  const studyId = 'some-study-id'; // Replace with actual study ID

  useEffect(() => {
    const loadStudyDetails = async () => {
      // ... código de carga
    };
    
    loadStudyDetails();
  }, [studyId]); // Solo depender del ID del estudio

  return (
    // Rest of the component code
  );
};

export default StudyDetails; 