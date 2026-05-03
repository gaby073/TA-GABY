import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchUsers = () => api.get('/users.php');
export const addUser = (data) => api.post('/users.php', data);
export const updateUser = (data) => api.put('/users.php', data);
export const deleteUser = (id) => api.delete(`/users.php?id=${id}`);
export const login = (data) => api.post('/login.php', data);
export const fetchBarang = () => api.get('/barang.php?_t=' + Date.now());
export const fetchPenjualan = (params) => api.get('/penjualan.php', { params });
export const addPenjualan = (data) => api.post('/penjualan.php', data);

export default api;
