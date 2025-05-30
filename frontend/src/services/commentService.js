// frontend/src/services/commentService.js
import api from '../utils/api';

export const getCommentsForTask = async (taskId) => {
  try {
    // --- PERBAIKI URL ---
    const response = await api.get(`/comments/task/${taskId}`); // Hapus '/comments' di akhir
    // --- AKHIR PERBAIKAN ---
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for task ${taskId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const createComment = async (commentData) => {
  try {
    // --- PERBAIKI URL ---
    const response = await api.post('/comments', commentData); // Ini sudah benar, prefix /comments + /
    // --- AKHIR PERBAIKAN ---
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const deleteComment = async (commentId) => {
  try {
    // --- PERBAIKI URL ---
    await api.delete(`/comments/${commentId}`); // Ini sudah benar, prefix /comments + /{id}
    // --- AKHIR PERBAIKAN ---
    return true;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};