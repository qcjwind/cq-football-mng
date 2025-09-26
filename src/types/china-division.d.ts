declare module 'china-division' {
  interface RegionItem {
    code: string
    name: string
    provinceCode?: string
    cityCode?: string
  }

  export const provinces: RegionItem[]
  export const cities: RegionItem[]
  export const areas: RegionItem[]
}
