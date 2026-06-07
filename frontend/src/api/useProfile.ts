import { useState, useEffect, useCallback } from 'react';
import {
  getMyProfile,
  updateMyProfile,
  UserProfile,
  UpdateProfilePayload,
} from '../services/profileService';
 
interface UseProfileReturn {
  profile:       UserProfile | null;
  loading:       boolean;
  saving:        boolean;
  error:         string | null;
  successMsg:    string | null;
  fetchProfile:  () => Promise<void>;
  saveProfile:   (payload: UpdateProfilePayload) => Promise<boolean>;
  clearMessages: () => void;
}
 
export const useProfile = (): UseProfileReturn => {
  const [profile,    setProfile]    = useState<UserProfile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
 
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
 
  const saveProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setSuccessMsg('Profile updated successfully!');
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
      return false;
    } finally {
      setSaving(false);
    }
  };
 
  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };
 
  return {
    profile,
    loading,
    saving,
    error,
    successMsg,
    fetchProfile,
    saveProfile,
    clearMessages,
  };
};