import axios, { type AxiosRequestConfig, type Axios, type AxiosResponse } from 'axios'
import { BASE_URL, LIVE_URL, LIVE_ALL_URL } from '@/utils/constant'
import { ElNotification } from 'element-plus'
import { useUserStore } from '@/stores/index'
import type { Any, ResponseTemp } from '@/types'

class Http {
  static instance: Http
  private _axiosInstance: Axios
  private header: AxiosRequestConfig['headers']
  constructor() {
    this.header = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }
    this._axiosInstance = this.init()
    this.addReqInterceptors()
    this.addResInterceptors()
  }

  private init() {
    return axios.create({
      baseURL: BASE_URL,
      headers: this.header,
      timeout: 1000 * 10,
    })
  }

  private addReqInterceptors() {
    this._axiosInstance.interceptors.request.use(
      (config) => {
        const userStore = useUserStore()

        const liveUrls = ['api/streams', 'all']
        if (liveUrls.includes(config.url + '')) {
          if (config.url === 'all') {
            config.baseURL = LIVE_ALL_URL
          } else {
            config.baseURL = LIVE_URL
          }
          config.headers['authorization'] = userStore.user?.authorization
        } else {
          config.headers['token'] = userStore.user?.token
        }
        return config
      },
      (err) => {
        return Promise.reject(err)
      },
    )
  }

  private addResInterceptors() {
    this._axiosInstance.interceptors.response.use(
      (res) => {
        if (res.status !== 200) {
          ElNotification({
            title: '系统提示',
            message: res.statusText || '网络错误，请检查配置',
            type: 'error',
          })
          return Promise.reject(new Error(res.statusText))
        }
        if (res.config?.headers?.requestType === 'upload') {
          return res
        }
        const data = res.data as ResponseTemp
        const ignoreRequest = ['api/streams', 'all']
        const next = ignoreRequest.some((item) => res.config?.url === item)
        if (next) {
          return res
        }
        if (data.code === 1000) {
          const userStore = useUserStore()
          ElNotification({
            title: '系统提示',
            message: data.msg || '网络错误，请检查配置',
            type: 'error',
          })
          userStore.clearUserToken()
          return Promise.reject(new Error(data.msg || '系统错误，请联系管理员'))
        }

        if (data.code !== 200) {
          ElNotification({
            title: '系统提示',
            message: data.msg || '网络错误，请检查配置',
            type: 'error',
          })
          return Promise.reject(new Error(data.msg || '系统错误，请联系管理员'))
        }
        return res
      },
      (err) => {
        return Promise.reject(err)
      },
    )
  }

  get<T>(url: string, data: Any): Promise<T> {
    return new Promise((resolve, reject) => {
      this._axiosInstance
        .get<T>(url, { params: data })
        .then((res) => {
          resolve(res.data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  post<T>(url: string, data: Any, config?: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this._axiosInstance
        .post<T>(url, data, config)
        .then((res) => {
          const data = res.data
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  static getInstance() {
    if (!Http.instance) {
      Http.instance = new Http()
    }
    return Http.instance
  }
}

export default Http.getInstance()
