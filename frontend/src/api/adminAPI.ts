import api from './axiosInstance';
 
export interface CreateProfessorData {
  first_name:           string;
  last_name:            string;
  email:                string;
  password:             string;
  department:           string;
  title?:               string;
  years_of_experience?: number;
  phone_number?:        string;
}
 
export const createProfessorAPI = async (data: CreateProfessorData) => {
  const response = await api.post('/admin/professors', data);
  return response.data;
};
 
export const getAllProfessorsAPI = async () => {
  const response = await api.get('/admin/professors');
  return response.data;
};