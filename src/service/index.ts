import http from '@/http/index'
import type {
  ActivityInfo,
  ResponseTemp,
  ResponseList,
  LoginResult,
  Pageing,
  DevicesInfo,
  ActivityUserInfo,
  UserPosition,
  UserHistoryPosition,
  LiveResult,
} from '@/types/index'

export const loginAPI = (data: { username: string; password: string }) => {
  const url = 'mng/account/login'
  return http.post<ResponseTemp<LoginResult>>(url, data)
}

export const addActivityAPI = (activity: ActivityInfo) => {
  const url = 'mng/activity/add'
  return http.post<ResponseTemp<null>>(url, activity)
}

export const editActivityAPI = (activity: ActivityInfo) => {
  const url = 'mng/activity/update'
  return http.post<ResponseTemp<null>>(url, activity)
}

export const deleteActivityAPI = (id: number) => {
  const url = 'mng/activity/delete'
  return http.post<ResponseTemp<null>>(url, { id })
}

export const updateActivityStatusAPI = (id: number, status: string) => {
  const url = 'mng/activity/updateStatus'
  return http.post<ResponseTemp<null>>(url, { id, status })
}

export const getActivityListAPI = (param: Pageing) => {
  const url = 'mng/activity/list'
  return http.post<ResponseList<ActivityInfo[]>>(url, param)
}

export const addGryAPI = (data: DevicesInfo) => {
  const url = 'mng/gry/add'
  return http.post<ResponseTemp<null>>(url, data)
}

export const getGryListAPI = (param: Pageing & { activityId: number }) => {
  const url = 'mng/gry/listAll'
  return http.post<ResponseList<DevicesInfo[]>>(url, param)
}

export const deleteGryAPI = (id: number) => {
  const url = 'mng/gry/delete'
  return http.post<ResponseTemp<null>>(url, { id })
}

export const updateGryAPI = (param: DevicesInfo) => {
  const url = 'mng/gry/update'
  return http.post<ResponseTemp<null>>(url, param)
}

export const updatePasswordAPI = (password: string) => {
  const url = 'mng/account/modifyPassword'
  return http.post<ResponseTemp<null>>(url, { password })
}

export const getUserListAPI = (param: Pageing & { activityId: number }) => {
  const url = 'mng/user/list'
  return http.post<ResponseList<ActivityUserInfo[]>>(url, param)
}

export const endUserActivityAPI = (userId: number) => {
  const url = 'mng/user/end'
  return http.post<ResponseTemp<null>>(url, { userId })
}

export const getAllUserPositionAPI = () => {
  const url = 'mng/position/getAll'
  return http.post<ResponseTemp<UserPosition>>(url, {})
}

export const getUserHistoryPositionAPI = (userId: number) => {
  const url = 'mng/position/history'
  return http.post<ResponseTemp<UserHistoryPosition>>(url, { userId })
}

export const updateGradeAPI = (userId: number, grade: string) => {
  const url = 'mng/user/updateGrade'
  return http.post<ResponseTemp<UserHistoryPosition>>(url, { userId, grade })
}

export const getLiveListAPI = () => {
  const url = 'api/streams'
  return http.get<LiveResult>(url, {})
}

export const getAllLiveListAPI = () => {
  const url = 'all'
  return http.get<Record<string, string[]>>(url, {})
}


export const removeUserAPI = (id: number) => {
  const url = 'mng/user/delete'
  return http.post<ResponseTemp<null>>(url, { id })
}


export const updateGryStatusAPI = (id: number, status: string) => {
  const url = 'mng/gry/updateStatus'
  return http.post<ResponseTemp<null>>(url, { id, status })
}
