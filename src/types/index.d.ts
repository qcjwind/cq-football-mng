export interface ActivityInfo {
  cover: string
  detail: string
  endTime: string
  giftTicketUrl: string
  id: number
  matineeName: string
  name: string
  saleStatus: string
  startTime: string
  endSaleTime: string
  buyLimit: number
  agreementInfo: string
  ticketShowInfo: string
  allowRefund: 'Y' | 'N'
  refundRule: string
  status: string
  venueId: number
  startSaleTime: string
  gateUrl?: string
  editLoading?: boolean
  gateToken?: string
  delLoading?: boolean
}

export interface ActivityDetail {
  match: ActivityInfo
  skuList: SkuInfo[]
  venue: VenueInfo
  userCount: number
}

export type ActivityEnum = 'ENABLE' | 'DISABLE'

export type ActivityStatusEnum = 'NOT_FINISH' | 'FINISH'

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

export interface VenueInfo {
  id?: number
  areaCode: string
  cityCode: string
  codeArr: string[]
  detail: string
  gmtCreate: string
  gmtModify: string
  name: string
  provinceCode: string
  skuInfo: string
  venueAddress: string
  venueLat: number
  venueLng: number
}

export interface SkuInfo {
  area: string
  gmtCreate: string
  gmtModify: string
  id: number
  matchId: number
  skuName: string
  skuType: string
  price: number
  description: string
  skuStatus: string
  stockTicket: number
  totalTicket: number
  venueId: number
}

export interface TicketInfo {
  area: string
  bid: string
  buyerId: number
  gmtCreate: string
  gmtModify: string
  id: number
  idNo: string
  idType: string
  matchId: number
  mobile: string
  name: string
  orderId: number
  price: number
  saleStatus: string
  saleTime: string
  seatNo: number
  seatRow: number
  skuId: number
  subArea: string
  syncStatus: string
  ticketType: string
  venueId: number
}

export interface OssSts {
  dir: string
  host: string
  policy: string
  security_token: string
  signature: string
  version: string
  x_oss_credential: string
  x_oss_date: string
}

export interface MaterialCodeParams {
  matchId: number
  bgImage: string
  textSize: number
  fontColor: string
  qrcodeWidth: number
  qrcodeHeight: number
  qrcodeX: number
  qrcodeY: number
  areaX: number
  areaY: number
  subAreaX: number
  subAreaY: number
  rowX: number
  rowY: number
  seatX: number
  seatY: number
}
