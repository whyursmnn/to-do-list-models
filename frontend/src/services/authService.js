// frontend/src/services/authService.js
import api from '../utils/api'; 

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/token',
      new URLSearchParams({ username, password }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        responseType: 'json',
        transformResponse: [(data) => {
          console.log('DEBUG: === START RAW RESPONSE DATA ===');
          console.log(typeof data, data);
          console.log('DEBUG: === END RAW RESPONSE DATA ===');
          try {
            const parsedData = JSON.parse(data);
            console.log('DEBUG: Parsed JSON data:', parsedData);
            return parsedData;
          } catch (e) {
            console.error("ERROR: Failed to parse JSON response:", e, "Raw data that failed to parse:", data);
            return null; 
          }
        }]
      }
    );

    console.log('DEBUG: Full Axios Response Object (after transform):', response);
    console.log('DEBUG: Final response.data object (after transform):', response.data);

    if (!response.data || typeof response.data !== 'object') {
      console.error("ERROR: response.data is unexpectedly empty or not an object.", response.data);
      throw new Error("Login response data is empty or malformed after Axios processing.");
    }

    const { 
      access_token, 
      user_role, 
      user_id, 
      username: userUsername, 
      user_name 
    } = response.data;

    console.log('DEBUG: Extracted fields from response.data:', { 
        access_token, user_role, user_id, userUsername, user_name 
    });

    if (!access_token || !user_id || !user_role || !userUsername) {
        console.error("ERROR: Missing critical data for user object (token, id, role, username) from backend response.");
        throw new Error("Missing critical user data in login response.");
    }

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify({
      id: user_id,
      username: userUsername,
      role: user_role,
      name: user_name || userUsername,
    }));

    console.log('DEBUG: User object successfully saved to localStorage:', JSON.parse(localStorage.getItem('user')));

    return { id: user_id, username: userUsername, role: user_role, name: user_name };

  } catch (error) {
    console.error('ERROR: Login failed (frontend catch block triggered):', error);
    if (error.response && error.response.data) {
      console.error('Backend Response Error Details:', error.response.data);
      throw error.response.data;
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
    await api.post('/auth/logout'); 
  } catch (error) {
    console.error('Logout failed on server:', error.response ? error.response.data : error.message);
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

// === DIPERBAIKI: FUNGSI getMe UNTUK MENGAMBIL DATA USER DARI BACKEND ===
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me'); // Memanggil endpoint /api/auth/me
    return response.data; // Mengembalikan objek user
  } catch (error) {
    console.error('Error fetching current user (getMe):', error.response ? error.response.data : error.message);
    // Penting: Jika 401/403, KEMBALIKAN NULL, JANGAN MELEMPAR ERROR
    // Ini agar AuthContext bisa menanganinya tanpa memicu interceptor
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return null; // Mengembalikan null jika tidak terautentikasi/tidak diizinkan
    }
    throw error; // Lempar error lain (misal, network error, 500 internal server error)
  }
};
