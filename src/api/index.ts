import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { requestInterceptor } from './interceptors/requestInterceptor'
import { responseInterceptor, responseInterceptorError } from './interceptors/responseInterceptor'
import { getBackendUrl } from '../utils/api'
const instance: AxiosInstance = axios.create({
  baseURL: getBackendUrl(),
  timeout: 5000,
})

instance.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))
instance.interceptors.response.use(responseInterceptor, responseInterceptorError)

export default instance
