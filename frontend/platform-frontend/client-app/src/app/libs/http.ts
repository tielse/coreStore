import axios from "axios"

export const http = axios.create()

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message ||
      "Something went wrong"

    return Promise.reject(new Error(msg))
  }
)
