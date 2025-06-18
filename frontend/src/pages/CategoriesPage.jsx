// frontend/src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService"; // Import service baru
import { useAuth } from "../contexts/AuthContext"; // Untuk otorisasi Admin

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal tambah/edit
  const [editingCategory, setEditingCategory] = useState(null); // Kategori yang sedang diedit

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const { isAdmin } = useAuth(); // Periksa apakah user adalah Admin

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err.detail
          ? Array.isArray(err.detail)
            ? err.detail.map((d) => d.msg).join(", ")
            : err.detail
          : "Gagal memuat kategori. Silakan coba lagi."
      );
      console.error("Fetch categories error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null); // Mode tambah
    setCategoryName("");
    setCategoryDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category); // Mode edit
    setCategoryName(category.nama);
    setCategoryDescription(category.deskripsi || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setError(null); // Bersihkan error saat menutup modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const categoryData = {
        nama: categoryName,
        deskripsi: categoryDescription,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      fetchCategories(); // Refresh daftar kategori
      closeModal();
    } catch (err) {
      setError(
        err.detail
          ? Array.isArray(err.detail)
            ? err.detail.map((d) => d.msg).join(", ")
            : err.detail
          : "Gagal menyimpan kategori. Silakan coba lagi."
      );
      console.error("Save category error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!isAdmin) {
      // Double check for security, though backend also enforces
      setError("Anda tidak memiliki izin untuk menghapus kategori.");
      return;
    }
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus kategori ini? (Soft Delete)"
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(categoryId);
      fetchCategories(); // Refresh daftar kategori
    } catch (err) {
      setError(
        err.detail
          ? Array.isArray(err.detail)
            ? err.detail.map((d) => d.msg).join(", ")
            : err.detail
          : "Gagal menghapus kategori. Anda mungkin tidak memiliki izin."
      );
      console.error("Delete category error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen w-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-base-content mb-6">
            Manajemen Kategori
          </h1>

          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {isAdmin && ( // Tombol tambah hanya untuk Admin
            <div className="mb-6">
              <button onClick={openCreateModal} className="btn btn-primary">
                Tambah Kategori Baru
              </button>
            </div>
          )}

          {/* Tabel Kategori */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {/* Table Header */}
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nama Kategori
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dibuat Oleh
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    {isAdmin && (
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {categories.map((category, index) => (
                    <tr 
                      key={category.id} 
                      className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
                        {category.deskripsi || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {category.created_by_user?.name || category.created_by_user?.username || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.is_deleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                            </svg>
                            Dihapus
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            Aktif
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(category)}
                              disabled={category.is_deleted}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                                category.is_deleted
                                  ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                              Edit
                            </button>
                            {!category.is_deleted && (
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
                              >
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Tambah/Edit Kategori */}
          {isModalOpen && (
            <dialog id="category_modal" className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Nama Kategori</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      placeholder="Nama Kategori"
                      className="input input-bordered w-full"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Deskripsi</span>
                    </label>
                    <textarea
                      name="deskripsi"
                      placeholder="Deskripsi Kategori (opsional)"
                      className="textarea textarea-bordered h-24 w-full"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="modal-action">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner"></span>
                      ) : editingCategory ? (
                        "Simpan Perubahan"
                      ) : (
                        "Tambah Kategori"
                      )}
                    </button>
                    <button type="button" className="btn" onClick={closeModal}>
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </dialog>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
