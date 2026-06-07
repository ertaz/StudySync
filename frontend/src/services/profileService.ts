// src/services/profileService.ts
import axiosInstance from "../api/axiosInstance";
 
export interface StudentProfile {
  student_number: string;
  major: string;
  enrollment_year: number;
  date_of_birth: string | null;
  phone_number: string | null;
}
 
export interface ProfessorProfile {
  title: string | null;
  department: string | null;
  years_of_experience: number;
  phone_number: string | null;
}
 
export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: number;
  created_at: string;
  role: 'student' | 'professor' | 'admin';
  profile?: StudentProfile | ProfessorProfile;
}
 
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  current_password?: string;
  new_password?: string;
  // student
  major?: string;
  date_of_birth?: string;
  phone_number?: string;
  // professor
  title?: string;
  department?: string;
  years_of_experience?: number;
}
 
export const getMyProfile = async (): Promise<UserProfile> => {
  const res = await axiosInstance.get('/profile/me');
  return res.data.data;
};
 
export const updateMyProfile = async (
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  const res = await axiosInstance.put('/profile/me', payload);
  return res.data.data;
};