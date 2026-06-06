import api from './axiosInstance';

export interface ChatMessage {
  _id:         string;
  course_id:   number;
  sender_id:   number;
  sender_name: string;
  message:     string;
  is_edited:   boolean;
  is_deleted:  boolean;
  createdAt:   string;
}

export const fetchChatHistory = (courseId: number): Promise<ChatMessage[]> =>
  api.get(`/chat/${courseId}/history`).then((r) => r.data.data);