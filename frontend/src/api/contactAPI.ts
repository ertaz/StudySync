import api from './axiosInstance';

export interface ContactFormData {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

export const sendContactMessageAPI = async (data: ContactFormData) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export const getContactMessagesAPI = async () => {
  const response = await api.get('/contact');
  return response.data;
};

export const markMessageAsReadAPI = async (id: number) => {
  const response = await api.patch(`/contact/${id}/read`);
  return response.data;
};