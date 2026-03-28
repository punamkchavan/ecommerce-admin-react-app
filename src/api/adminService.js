import axiosInstance from './axiosInstance';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export const getAdminProfile = async (uid) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/admins/${uid}`);
    const fields = response.data.fields;
    return {
      name: fields?.name?.stringValue || '',
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
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
  
  const response = await axiosInstance.patch(`${BASE_URL}/admins/${uid}?updateMask.fieldPaths=name`, data);
  return response.data;
};
