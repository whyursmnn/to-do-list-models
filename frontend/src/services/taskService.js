// frontend/src/services/taskService.js
import api from '../utils/api';

export const getTasks = async () => {
  try {
    const response = await api.get('/tasks'); // GET /api/tasks
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData); // POST /api/tasks
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData); // PUT /api/tasks/{id}
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const deleteTask = async (taskId) => {
  try {
    await api.delete(`/tasks/${taskId}`); // DELETE /api/tasks/{id} (soft delete)
    return true;
  } catch (error) {
    console.error('Error deleting task:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

// --- NEW/UPDATED FUNCTIONS ---

// Mendapatkan riwayat status untuk tugas tertentu
export const getTaskStatusHistory = async (taskId) => {
  try {
    // --- PERBAIKI URL ---
    const response = await api.get(`/status-history/task/${taskId}`); // Hapus '/status-history' di akhir
    // --- AKHIR PERBAIKAN ---
    return response.data;
  } catch (error) {
    console.error(`Error fetching status history for task ${taskId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

// Mendapatkan semua pengguna (akan digunakan untuk fitur penugasan)
// Ini adalah duplikat dari getUsers di userService.js, namun saya menempatkannya di sini
// agar TaskService memiliki semua yang diperlukan untuk fitur tugas terkait.
// Alternatif: impor getUsers dari userService.js di TasksPage.jsx
export const getUsers = async () => {
  try {
    const response = await api.get('/users'); // GET /api/users
    return response.data;
  } catch (error) {
    console.error('Error fetching users for assignment:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};