import { http } from './http'

const BASE_URL = process.env.REST_API_URL!

export const RestClient = {
  get: <T>(url: string) =>
    http<T>(`${BASE_URL}${url}`, { method: 'GET' }),

  post: <T>(url: string, body?: any) =>
    http<T>(`${BASE_URL}${url}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(url: string, body?: any) =>
    http<T>(`${BASE_URL}${url}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string) =>
    http<T>(`${BASE_URL}${url}`, { method: 'DELETE' }),
}
