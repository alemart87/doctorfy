import axios from 'axios';
import api from '../api/axios';

const apiServices = {
  auth: authService,
  medicalStudies: medicalStudiesService,
  nutrition: nutritionService,
  doctors: doctorsService,
};

export default apiServices; 