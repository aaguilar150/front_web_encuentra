/**
 * Cliente HTTP compartido sobre axios. Centraliza base URL y headers.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const httpClient = {
  get: <T>(path: string) => api.get<T>(path).then((res) => res.data),
  post: <T>(path: string, body: unknown) => api.post<T>(path, body).then((res) => res.data),
};
