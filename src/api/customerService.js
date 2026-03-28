import axiosInstance from './axiosInstance';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/customers`;

const transformDoc = (doc) => {
  const fields = doc.fields;
  const id = doc.name.split('/').pop();
  
  return {
    id,
    name: fields?.name?.stringValue || '',
    email: fields?.email?.stringValue || '',
    phone: fields?.phone?.stringValue || '',
    totalOrders: Number(fields?.totalOrders?.integerValue || 0),
    totalSpent: Number(fields?.totalSpent?.doubleValue || fields?.totalSpent?.integerValue || 0),
    status: fields?.status?.stringValue || 'active',
    createdAt: fields?.createdAt?.timestampValue || ''
  };
};

export const getCustomers = async (pageSize = 10, pageToken = '') => {
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

export const getCustomerById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return transformDoc(response.data);
};
