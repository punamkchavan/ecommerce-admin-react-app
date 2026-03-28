import axiosInstance from './axiosInstance';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders`;

const transformDoc = (doc) => {
  const fields = doc.fields;
  const id = doc.name.split('/').pop();
  
  return {
    id,
    orderNumber: fields?.orderNumber?.stringValue || '',
    customerId: fields?.customerId?.stringValue || '',
    customerName: fields?.customerName?.stringValue || '',
    customerEmail: fields?.customerEmail?.stringValue || '',
    totalAmount: Number(fields?.totalAmount?.doubleValue || fields?.totalAmount?.integerValue || 0),
    status: fields?.status?.stringValue || 'pending',
    paymentStatus: fields?.paymentStatus?.stringValue || 'pending',
    createdAt: fields?.createdAt?.timestampValue || '',
    items: fields?.items?.arrayValue?.values?.map(v => {
      const f = v.mapValue.fields;
      return {
        productId: f.productId?.stringValue || '',
        name: f.name?.stringValue || '',
        price: Number(f.price?.doubleValue || f.price?.integerValue || 0),
        quantity: Number(f.quantity?.integerValue || 0),
        thumbnail: f.thumbnail?.stringValue || ''
      };
    }) || [],
    shippingAddress: {
      fullName: fields?.shippingAddress?.mapValue?.fields?.fullName?.stringValue || '',
      addressLine1: fields?.shippingAddress?.mapValue?.fields?.addressLine1?.stringValue || '',
      city: fields?.shippingAddress?.mapValue?.fields?.city?.stringValue || '',
      state: fields?.shippingAddress?.mapValue?.fields?.state?.stringValue || '',
      postalCode: fields?.shippingAddress?.mapValue?.fields?.postalCode?.stringValue || '',
      country: fields?.shippingAddress?.mapValue?.fields?.country?.stringValue || '',
      phone: fields?.shippingAddress?.mapValue?.fields?.phone?.stringValue || ''
    }
  };
};

export const getOrders = async (pageSize = 10, pageToken = '') => {
  try {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize);
    if (pageToken) params.append('pageToken', pageToken);
    params.append('orderBy', 'createdAt desc');
    
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

export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return transformDoc(response.data);
};

export const updateOrderStatus = async (id, status) => {
  const payload = {
    fields: {
      status: { stringValue: status }
    }
  };
  
  const response = await axiosInstance.patch(`${BASE_URL}/${id}?updateMask.fieldPaths=status`, payload);
  return transformDoc(response.data);
};

export const updatePaymentStatus = async (id, status) => {
  const payload = {
    fields: {
      paymentStatus: { stringValue: status }
    }
  };
  
  const response = await axiosInstance.patch(`${BASE_URL}/${id}?updateMask.fieldPaths=paymentStatus`, payload);
  return transformDoc(response.data);
};
