// frontend/src/services/userService.js
import api from '../utils/api';

export const getUsers = async () => {
  try {
    const response = await api.get('/users'); // GET /api/users
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData); // POST /api/users
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData); // PUT /api/users/{id}
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const deleteUser = async (userId) => { // This is a soft delete on backend
  try {
    await api.delete(`/users/${userId}`); // DELETE /api/users/{id}
    return true;
  } catch (error) {
    console.error('Error deleting user:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};