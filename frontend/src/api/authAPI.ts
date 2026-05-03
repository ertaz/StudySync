import api from './axiosInstance';

export interface RegisterData {
  first_name:       string;
  last_name:        string;
  email:            string;
  password:         string;
  student_number:   string;
  major:            string;
  enrollment_year?: number;
  date_of_birth?:   string;
  phone_number?:    string;
}

export interface LoginData {
  email:    string;
  password: string;
}

// Auth API functions — no token storage here.
// Token is stored and managed by AuthContext (React state).

export const registerAPI = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginAPI = async (data: LoginData) => {
  const response = await api.post('/auth/login', data);
  return response.data; // AuthContext stores the token from response
};

export const logoutAPI = async () => {
  await api.post('/auth/logout');
};

export const refreshTokenAPI = async () => {
  const response = await api.post('/auth/refresh');
  return response.data; // AuthContext stores the token from response
};

export const getMeAPI = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};