import provinces from 'china-division/dist/provinces.json'
import cities from 'china-division/dist/cities.json'
import areas from 'china-division/dist/areas.json'
import type { CascaderOption } from 'element-plus'

// 省市区数据结构接口
export interface RegionOption {
  value: string
  label: string
  children?: RegionOption[]
}

// 地区信息接口
export interface RegionInfo {
  code: string
  name: string
}

// 创建快速查找的 Map 结构
const createRegionMap = (regionList: RegionInfo[]) => {
  const map = new Map<string, RegionInfo>()
  regionList.forEach(region => {
    map.set(region.code, region)
  })
  return map
}

// 预先生成所有地区的快速查找 Map
const provinceMap = createRegionMap(provinces)
const cityMap = createRegionMap(cities)
const areaMap = createRegionMap(areas)

// 生成省市区三级联动数据
export const generateProvinceCityAreaData = (): CascaderOption[] => {
  return provinces.map(province => {
    // 获取该省下的所有城市
    const provinceCities = cities.filter(city => city.provinceCode === province.code)

    return {
      value: province.code,
      label: province.name,
      children: provinceCities.map(city => {
        // 获取该城市下的所有区县
        const cityAreas = areas.filter(area => area.cityCode === city.code)

        return {
          value: city.code,
          label: city.name,
          children: cityAreas.map(area => ({
            value: area.code,
            label: area.name
          }))
        }
      })
    }
  })
}

// 根据代码获取名称 - 优化版本，使用 Map 快速查找
export const getRegionNameByCode = (code: string): string => {
  // 先查找省份
  const province = provinceMap.get(code)
  if (province) return province.name

  // 再查找城市
  const city = cityMap.get(code)
  if (city) return city.name

  // 最后查找区县
  const area = areaMap.get(code)
  if (area) return area.name

  return ''
}

// 根据代码获取完整的地区信息
export const getRegionInfoByCode = (code: string): RegionInfo | null => {
  // 先查找省份
  const province = provinceMap.get(code)
  if (province) return province

  // 再查找城市
  const city = cityMap.get(code)
  if (city) return city

  // 最后查找区县
  const area = areaMap.get(code)
  if (area) return area

  return null
}

// 批量获取地区名称
export const getRegionNamesByCodes = (codes: string[]): string => {
  return codes.map(code => getRegionNameByCode(code)).join('/')
}
