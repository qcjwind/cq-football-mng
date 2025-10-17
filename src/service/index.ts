import http from '@/http/index'
import type {
  ActivityInfo,
  ResponseTemp,
  ResponseList,
  LoginResult,
  Pageing,
  VenueInfo,
  OssSts,
  SkuInfo,
  TicketInfo,
  ActivityDetail,
  MaterialCodeParams,
} from '@/types/index'

export const loginAPI = (data: { username: string; password: string }) => {
  const url = 'mng/account/login'
  return http.post<ResponseTemp<LoginResult>>(url, data)
}

export const addActivityAPI = (activity: ActivityInfo) => {
  const url = 'mng/match/add'
  return http.post<ResponseTemp<null>>(url, activity)
}

export const exportTicketAPI = (matchId: number) => {
  const url = 'mng/ticket/export'
  return http.post<ResponseTemp<null>>(url, { matchId })
}

export const getMatchInfoAPI = (matchId: number) => {
  const url = 'mng/match/info'
  return http.post<ResponseTemp<ActivityDetail>>(url, { matchId })
}

export const editActivityAPI = (activity: ActivityInfo) => {
  const url = 'mng/match/update'
  return http.post<ResponseTemp<null>>(url, activity)
}

export const deleteActivityAPI = (id: number) => {
  const url = 'mng/match/delete'
  return http.post<ResponseTemp<null>>(url, { id })
}

export const getActivityInfoAPI = (id: number) => {
  const url = 'mng/match/info'
  return http.post<
    ResponseTemp<{
      match: ActivityInfo
      skuList: SkuInfo[]
      ticket: TicketInfo
      venue: VenueInfo
      userCount: number
    }>
  >(url, { matchId: id })
}

export const updateActivityStatusAPI = (id: number, status: string) => {
  const url = 'mng/match/updateStatus'
  return http.post<ResponseTemp<null>>(url, { id, status })
}

export const getActivityListAPI = (param: Pageing) => {
  const url = 'mng/match/list'
  return http.post<ResponseList<ActivityInfo[]>>(url, param)
}

export const getVenueListAPI = (param: Pageing) => {
  const url = 'mng/venue/list'
  return http.post<ResponseList<VenueInfo[]>>(url, param)
}

export const addVenueAPI = (venue: VenueInfo) => {
  const url = 'mng/venue/add'
  return http.post<ResponseTemp<null>>(url, venue)
}

export const editVenueAPI = (venue: VenueInfo) => {
  const url = 'mng/venue/update'
  return http.post<ResponseTemp<null>>(url, venue)
}

export const getOssStsAPI = () => {
  const url = 'mng/oss/sts'
  return http.post<ResponseTemp<OssSts>>(url, {})
}

export const uploadBatchAPI = (file: FormData) => {
  const url = '/mng/sku/uploadBatch'
  return http.post<ResponseTemp<OssSts>>(url, file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getMatchSkuLitAPI = (params: { matchId: number } & Pageing) => {
  const url = '/mng/sku/list'
  return http.post<ResponseList<SkuInfo[]>>(url, params)
}

export const editSkuAPI = (sku: Partial<SkuInfo>) => {
  const url = '/mng/sku/update'
  return http.post<ResponseTemp<null>>(url, sku)
}

export const addSkuAPI = (sku: SkuInfo) => {
  const url = '/mng/sku/add'
  return http.post<ResponseTemp<null>>(url, sku)
}

export const uploadOssAPI = (url: string, formData: FormData) => {
  return http.post<ResponseTemp<null>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      requestType: 'upload',
    },
  })
}

export const updateSkuStatusAPI = (id: number, status: string) => {
  const url = '/mng/sku/updateStatus'
  return http.post<ResponseTemp<null>>(url, { id, status })
}

export const deleteSkuAPI = (id: number) => {
  const url = '/mng/sku/delete'
  return http.post<ResponseTemp<null>>(url, { id })
}

export const uploadSeatsAPI = (file: FormData) => {
  const url = '/mng/sku/uploadSeats'
  return http.post<ResponseTemp<null>>(url, file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const generateMaterialCodeAPI = (params: MaterialCodeParams) => {
  const url = '/mng/match/asyncGenerateQrcode'
  return http.post<ResponseTemp<null>>(url, params)
}

export const previewMaterialCodeAPI = (params: MaterialCodeParams) => {
  const url = '/mng/match/previewGenerateQrcode'
  return http.post<ResponseTemp<string>>(url, params)
}
