// frontend/src/services/attachmentService.js
import api from '../utils/api';

export const getAttachmentsForTask = async (taskId) => {
  try {
    // --- PERBAIKI URL ---
    const response = await api.get(`/attachments/task/${taskId}`); // Hapus '/attachments' di akhir
    // --- AKHIR PERBAIKAN ---
    return response.data;
  } catch (error) {
    console.error(`Error fetching attachments for task ${taskId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const uploadAttachment = async (taskId, file, description) => {
  try {
    const formData = new FormData();
    formData.append('tugas_id', taskId);
    formData.append('file', file);
    if (description) {
      formData.append('deskripsi', description);
    }
    // --- PERBAIKI URL ---
    const response = await api.post('/attachments', formData, { // Ini sudah benar, prefix /attachments + /
    // --- AKHIR PERBAIKAN ---
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading attachment:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const updateAttachment = async (attachmentId, updateData) => {
  try {
    // --- PERBAIKI URL ---
    const response = await api.put(`/attachments/${attachmentId}`, updateData); // Ini sudah benar, prefix /attachments + /{id}
    // --- AKHIR PERBAIKAN ---
    return response.data;
  } catch (error) {
    console.error(`Error updating attachment ${attachmentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const deleteAttachment = async (attachmentId) => {
  try {
    // --- PERBAIKI URL ---
    await api.delete(`/attachments/${attachmentId}`); // Ini sudah benar, prefix /attachments + /{id}
    // --- AKHIR PERBAIKAN ---
    return true;
  } catch (error) {
    console.error(`Error deleting attachment ${attachmentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};