import axios from 'https://cdn.skypack.dev/axios';

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    'Content-Type': 'application/json',
    'Authorization':`bearer ${localStorage.getItem("token")}`
  }
});

export default api;