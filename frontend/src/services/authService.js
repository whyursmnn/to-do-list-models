// frontend/src/services/authService.js
import api from '../utils/api'; 

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/token',
      // Data dikirim sebagai string form-urlencoded, ini sudah benar untuk backend
      new URLSearchParams({ username, password }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // === BARU/DIPERBAIKI: Konfigurasi respons Axios ===
        // Pastikan Axios mencoba mem-parse respons sebagai JSON
        responseType: 'json',
        // Gunakan transformResponse untuk debugging data mentah
        transformResponse: [(data) => {
          console.log('DEBUG: === START RAW RESPONSE DATA ===');
          console.log(typeof data, data); // Tampilkan tipe data dan data string mentah
          console.log('DEBUG: === END RAW RESPONSE DATA ===');
          try {
            const parsedData = JSON.parse(data);
            console.log('DEBUG: Parsed JSON data:', parsedData); // Log objek JSON yang sudah di-parse
            return parsedData;
          } catch (e) {
            console.error("ERROR: Failed to parse JSON response:", e, "Raw data that failed to parse:", data);
            // Penting: Jika parsing gagal, lempar error atau kembalikan null
            // Agar `response.data` menjadi null/undefined dan masuk ke catch block utama
            return null; 
          }
        }]
        // ======================================================
      }
    );

    // Log objek respons lengkap Axios
    console.log('DEBUG: Full Axios Response Object (after transform):', response);
    // Log data yang sudah diproses Axios (ini yang seharusnya jadi objek JSON)
    console.log('DEBUG: Final response.data object (after transform):', response.data);

    // Pastikan response.data tidak null atau undefined
    if (!response.data || typeof response.data !== 'object') {
      console.error("ERROR: response.data is unexpectedly empty or not an object.", response.data);
      throw new Error("Login response data is empty or malformed after Axios processing.");
    }

    // Destrukturisasi data dari response.data
    const { 
      access_token, 
      user_role, 
      user_id, 
      username: userUsername, 
      user_name 
    } = response.data; // Hapus user_email

    // Log setiap variabel yang diekstraksi untuk verifikasi nilai
    console.log('DEBUG: Extracted fields from response.data:', { 
        access_token, user_role, user_id, userUsername, user_name 
    });

    // Verifikasi bahwa data penting ada sebelum disimpan
    if (!access_token || !user_id || !user_role || !userUsername) {
        console.error("ERROR: Missing critical data for user object (token, id, role, username) from backend response.");
        throw new Error("Missing critical user data in login response.");
    }

    // Simpan token dan info user ke local storage
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify({
      id: user_id,
      username: userUsername,
      role: user_role,
      name: user_name // name: user_name || userUsername jika name bisa null
    }));

    console.log('DEBUG: User object successfully saved to localStorage:', JSON.parse(localStorage.getItem('user')));

    // Kembalikan objek user yang sudah terdestrukturisasi
    return { id: user_id, username: userUsername, role: user_role, name: user_name };

  } catch (error) {
    console.error('ERROR: Login failed (frontend catch block triggered):', error);
    // Jika ada error respons dari backend (misal 401, 403, 422, 500)
    if (error.response && error.response.data) {
      console.error('Backend Response Error Details:', error.response.data);
      throw error.response.data; // Lempar error dari backend
    } else if (error.message) {
        console.error('Network or Unknown Error Message:', error.message);
        throw new Error(error.message);
    } else {
        throw new Error('An unknown error occurred during login.');
    }
  }
};

export const logoutUser = async () => {
  try {
    // Panggil endpoint logout di backend
    await api.post('/auth/logout'); 
  } catch (error) {
    console.error('Logout failed on server:', error.response ? error.response.data : error.message);
    // Lanjutkan logout lokal meskipun server error, untuk memastikan UX
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserInfoFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};