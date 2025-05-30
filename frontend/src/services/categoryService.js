// frontend/src/services/categoryService.js
import api from '../utils/api';

export const getCategories = async () => {
  try {
    const response = await api.get('/kategori'); // GET /api/kategori
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/kategori', categoryData); // POST /api/kategori
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/kategori/${categoryId}`, categoryData); // PUT /api/kategori/{id}
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};

export const deleteCategory = async (categoryId) => { // Soft delete on backend
  try {
    await api.delete(`/kategori/${categoryId}`); // DELETE /api/kategori/{id}
    return true;
  } catch (error) {
    console.error('Error deleting category:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network Error or Unknown Error');
  }
};