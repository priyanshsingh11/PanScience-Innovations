import axios from 'axios';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include auth token (Disabled for now)
/*
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
*/

export const fileService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // user_id is now handled by the backend from the token
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  list: async () => {
    const response = await api.get('/files/');
    return response.data;
  },
};

export const chatService = {
  query: async (fileIds: string[], message: string, chatHistory: any[] = []) => {
    const response = await api.post('/chat/query', {
      file_ids: fileIds,
      message,
      chat_history: chatHistory,
    });
    return response.data;
  },
  getHistory: async (fileId?: string) => {
    const response = await api.get('/chat/history', {
      params: fileId ? { file_id: fileId } : {},
    });
    return response.data;
  },
};

export default api;
