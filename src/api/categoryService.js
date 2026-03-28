import axiosInstance from './axiosInstance';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/categories`;

const transformDoc = (doc) => {
  const fields = doc.fields;
  const id = doc.name.split('/').pop();
  
  return {
    id,
    name: fields?.name?.stringValue || '',
    description: fields?.description?.stringValue || '',
    subcategories: fields?.subcategories?.arrayValue?.values?.map(v => v.stringValue) || [],
  };
};

export const getCategories = async (pageSize = 10, pageToken = '') => {
  try {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize);
    if (pageToken) params.append('pageToken', pageToken);
    
    const response = await axiosInstance.get(`${BASE_URL}?${params.toString()}`);
    return {
      documents: response.data.documents?.map(transformDoc) || [],
      nextPageToken: response.data.nextPageToken || null
    };
  } catch (error) {
    if (error.response?.status === 404) return { documents: [], nextPageToken: null };
    throw error;
  }
};

export const createCategory = async (data) => {
  const payload = {
    fields: {
      name: { stringValue: data.name },
      description: { stringValue: data.description || '' },
      subcategories: {
        arrayValue: {
          values: data.subcategories?.map(s => ({ stringValue: s })) || []
        }
      }
    }
  };
  
  const response = await axiosInstance.post(BASE_URL, payload);
  return transformDoc(response.data);
};

export const updateCategory = async (id, data) => {
  const payload = {
    fields: {
      name: { stringValue: data.name },
      description: { stringValue: data.description || '' },
      subcategories: {
        arrayValue: {
          values: data.subcategories?.map(s => ({ stringValue: s })) || []
        }
      }
    }
  };
  
  const updateMask = 'updateMask.fieldPaths=name&updateMask.fieldPaths=description&updateMask.fieldPaths=subcategories';
  const response = await axiosInstance.patch(`${BASE_URL}/${id}?${updateMask}`, payload);
  return transformDoc(response.data);
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
  return id;
};
