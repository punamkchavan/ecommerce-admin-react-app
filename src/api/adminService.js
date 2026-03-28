import axiosInstance from './axiosInstance';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export const getAdminProfile = async (uid) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/admins/${uid}`);
    // Firestore REST API returns fields in a nested format: { fields: { name: { stringValue: '...' } } }
    const fields = response.data.fields;
    return {
      name: fields?.name?.stringValue || '',
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Profile doesn't exist yet
    }
    throw error;
  }
};

export const updateAdminProfile = async (uid, name) => {
  const data = {
    fields: {
      name: { stringValue: name },
    },
  };
  
  // PATCH will create the document if it doesn't exist
  const response = await axiosInstance.patch(`${BASE_URL}/admins/${uid}?updateMask.fieldPaths=name`, data);
  return response.data;
};
