import axiosInstance from './axiosInstance';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

const transformDoc = (doc) => {
  const fields = doc.fields;
  const id = doc.name.split('/').pop();
  
  return {
    id,
    name: fields?.name?.stringValue || '',
    description: fields?.description?.stringValue || '',
    price: Number(fields?.price?.doubleValue || fields?.price?.integerValue || 0),
    stock: Number(fields?.stock?.integerValue || 0),
    categoryId: fields?.categoryId?.stringValue || '',
    subcategory: fields?.subcategory?.stringValue || '',
    thumbnail: fields?.thumbnail?.stringValue || '',
    images: fields?.images?.arrayValue?.values?.map(v => v.stringValue) || [],
    createdAt: doc.createTime,
    updatedAt: doc.updateTime,
  };
};

export const getProductById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return transformDoc(response.data);
};

export const getProducts = async (pageSize = 10, pageToken = '') => {
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
    if (error.response?.status === 404 || error.message?.includes('404')) {
      return { documents: [], nextPageToken: null };
    }
    throw error;
  }
};

export const createProduct = async (data) => {
  const payload = {
    fields: {
      name: { stringValue: data.name },
      description: { stringValue: data.description },
      price: { doubleValue: Number(data.price) },
      stock: { integerValue: Number(data.stock) },
      categoryId: { stringValue: data.categoryId },
      subcategory: { stringValue: data.subcategory },
      thumbnail: { stringValue: data.thumbnail || '' },
      images: {
        arrayValue: {
          values: data.images?.map(img => ({ stringValue: img })) || []
        }
      }
    }
  };
  
  const response = await axiosInstance.post(BASE_URL, payload);
  return transformDoc(response.data);
};

export const updateProduct = async (id, data) => {
  const payload = {
    fields: {
      name: { stringValue: data.name },
      description: { stringValue: data.description },
      price: { doubleValue: Number(data.price) },
      stock: { integerValue: Number(data.stock) },
      categoryId: { stringValue: data.categoryId },
      subcategory: { stringValue: data.subcategory },
      thumbnail: { stringValue: data.thumbnail || '' },
      images: {
        arrayValue: {
          values: data.images?.map(img => ({ stringValue: img })) || []
        }
      }
    }
  };
  
  const fields = ['name', 'description', 'price', 'stock', 'categoryId', 'subcategory', 'thumbnail', 'images'];
  const updateMask = fields.map(f => `updateMask.fieldPaths=${f}`).join('&');
  
  const response = await axiosInstance.patch(`${BASE_URL}/${id}?${updateMask}`, payload);
  return transformDoc(response.data);
};

export const deleteProduct = async (id) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
  return id;
};
