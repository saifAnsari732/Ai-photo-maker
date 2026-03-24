import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import ToastContainer, { showToast } from '../components/Toast';

const AuthContext = createContext(null);

// ✅ JWT decode helper (no library needed)
const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // ms mein
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Auto-logout function
  const logout = (showMessage = false) => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    if (showMessage) showToast('⏰ Session expired. Please login again.');
  };

  // ✅ Token expiry timer set karo
  const scheduleAutoLogout = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const remaining = expiry - Date.now();
    if (remaining <= 0) {
      logout(true);
      return;
    }

    // Timer set karo exact expiry pe
    const timer = setTimeout(() => logout(true), remaining);
    return timer; // cleanup ke liye
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    let timer;

    if (token) {
      // ✅ Pehle check karo — token already expire hua?
      const expiry = getTokenExpiry(token);
      if (!expiry || expiry < Date.now()) {
        logout(true);
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data.user);
          timer = scheduleAutoLogout(token); // ✅ Timer start
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // ✅ Axios interceptor — server se 401 aaye toh logout
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          logout(true);
        }
        return Promise.reject(err);
      }
    );

    return () => {
      clearTimeout(timer);
      axios.interceptors.response.eject(interceptor); // cleanup
    };
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    showToast('✅ Login Successful');
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    scheduleAutoLogout(token); // ✅ Login ke baad timer start
    return user;
  };

  const register = async (name, shopName, email, password) => {
    const res = await axios.post('/api/auth/register', { name, shopName, email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    scheduleAutoLogout(token); // ✅ Register ke baad bhi timer
    return user;
  };

  const updateTokens = (newCount) => {
    setUser(prev => ({ ...prev, tokens: newCount }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);