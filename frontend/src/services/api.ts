import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

export const fileService = {
  upload: async (file: File, userId: string = 'test_user') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  list: async (userId: string = 'test_user') => {
    const response = await api.get('/files/', { params: { user_id: userId } });
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
};

export default api;
