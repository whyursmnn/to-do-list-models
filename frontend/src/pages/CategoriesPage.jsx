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
    <div className="flex h-screen bg-base-200">
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

          <div className="overflow-x-auto">
            <table className="table w-full bg-base-100 shadow-xl rounded-lg">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Kategori</th>
                  <th>Deskripsi</th>
                  <th>Dibuat Oleh</th>
                  <th>Status</th>
                  {isAdmin && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.nama}</td>
                    <td>{category.deskripsi || "-"}</td>
                    <td>
                      {category.created_by_user?.name ||
                        category.created_by_user?.username ||
                        "N/A"}
                    </td>
                    <td>
                      {category.is_deleted ? (
                        <span className="badge badge-error">Dihapus</span>
                      ) : (
                        <span className="badge badge-success">Aktif</span>
                      )}
                    </td>
                    {isAdmin && (
                      // Pastikan tidak ada spasi di antara <td> dan {isAdmin && (...)}
                      <td>
                        <button
                          onClick={() => openEditModal(category)}
                          className="btn btn-sm btn-warning mr-2"
                          disabled={category.is_deleted}
                        >
                          Edit
                        </button>
                        {!category.is_deleted && (
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="btn btn-sm btn-error"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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
