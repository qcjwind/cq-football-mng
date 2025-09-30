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
} from '@/types/index'

export const loginAPI = (data: { username: string; password: string }) => {
  const url = 'mng/account/login'
  return http.post<ResponseTemp<LoginResult>>(url, data)
}

export const addActivityAPI = (activity: ActivityInfo) => {
  const url = 'mng/match/add'
  return http.post<ResponseTemp<null>>(url, activity)
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
  return http.post<ResponseTemp<{
    match: ActivityInfo,
    skuList: SkuInfo[],
    ticket: TicketInfo,
    venue: VenueInfo
  }>>(url, { matchId: id })
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

export const uploadOssAPI = (url: string, formData: FormData) => {
  return http.post<ResponseTemp<null>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      requestType: 'upload',
    },
  })
}
