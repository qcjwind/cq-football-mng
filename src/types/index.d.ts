import type { server } from "typescript"

export interface ActivityInfo {
  id?: number
  name: string
  detail?: string
  startTime: string
  endTime: string
  type: ActivityEnum
  mapInfo?: {
    center: LatLng
    info: number[][]
  }
  startPointLng?: number;
  startPointLat?: number;
  gryInfo?: string
  delLoading?: boolean
}

export type ActivityEnum = 'SINGLE' | 'TEAM'

export type ActivityStatusEnum = 'DISABLE' | 'ENABLE'

export interface LatLng {
  lat: number
  lng: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export interface ResponseTemp<T = Any> {
  code: number
  msg: string
  data: T
  traceId: string
}

export interface ResponseList<T = Any> {
  code: number
  msg: string
  data: T
  pageNumber: number
  pageSize: number
  total: number
  traceId: string
}

export interface LoginResult {
  authorization?: string
  token: string
  username: string
}

export interface Pageing {
  pageNumber: number
  pageSize: number
  total?: number
}

export type DevicesEnum = 'HE_FA' | 'FEI_FA' | 'YOU_DAO'

export type DevicesStatusEnum = 'ONLINE' | 'OFFLINE'

export interface DevicesInfo {
  id?: number
  activityId?: number
  name: string
  lat: string | number
  lng: string | number
  status?: DevicesStatusEnum
  type: DevicesEnum
  delLoading?: boolean
}

export type ContestType = 'INIT' | 'ENDED' | 'ING'

export interface ActivityUserInfo {
  activityId: number
  beginGryInfo: string
  beginTime: string
  endGryInfo: string
  endTime: string
  grade: string
  id: number
  name: string
  serialNo: number
  team: string
  status: ContestType
}

export interface UserPosition {
  [key: string]: LatLng & { time: number }
}

export type UserHistoryPosition = (LatLng & { time: number })[]

export interface LiveItem {
  publisher: {
    app: string
    stream: string
    clientId: string
    bytes: number
    ip: string
    video: {
      codec: string
      width: number
      height: number
      profile: string
      level: number
      fps: number
    }
  }
}

export interface LiveResult {
  live: {
    [ket: string]: LiveItem
  }
}