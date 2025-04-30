const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_BACKEND_URL || 'https://doctorfy.onrender.com'
  : process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const API_URL = `${BACKEND_URL}/api`;

export const UPLOADS_URL = `${BACKEND_URL}/uploads`;

export const IMAGE_SIZES = {
  thumbnail: '300w',
  medium: '600w',
  large: '1200w'
};

export const getImageSrcSet = (imagePath) => `
  ${imagePath}-300.webp ${IMAGE_SIZES.thumbnail},
  ${imagePath}-600.webp ${IMAGE_SIZES.medium},
  ${imagePath}-1200.webp ${IMAGE_SIZES.large}
`;

export const endpoints = {
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    me: `${API_URL}/auth/me`,
  },
  medicalStudies: {
    upload: `${API_URL}/medical-studies/upload`,
    interpret: (studyId) => `${API_URL}/medical-studies/interpret/${studyId}`,
    list: `${API_URL}/medical-studies/studies`,
    details: (studyId) => `${API_URL}/medical-studies/studies/${studyId}`,
  },
  nutrition: {
    analyzeFood: `${API_URL}/nutrition/analyze-food`,
  },
  doctors: {
    directory: `${API_URL}/doctors/directory`,
    subscribe: `${API_URL}/doctors/subscribe`,
  },
  profile: {
    uploadPicture: `${API_URL}/profile/upload-profile-picture`,
  }
};

const config = {
  API_URL,
  endpoints,
};

export default config; 