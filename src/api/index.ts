import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
})

export default {
  getMenu: (type: string) => instance.get(`/menu/${type}`),
  updateMenu: (type: string, data: any) => instance.put(`/menu/${type}`, data),
  login: (credentials: { username: string; password: string }) =>
    instance.post('/auth/login', credentials),
}
