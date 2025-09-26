<template>
  <ElDialog
    v-model="dialogMap"
    width="1100px"
    :title="props.type === 'point' ? '请标记场馆位置' : '选择活动范围'"
    @close="clearMap"
  >
    <div class="map" id="map">
      <div class="search-map">
        <span class="label">请输入关键字</span>
        <ElInput
          v-model="keywords"
          id="tipinput"
          :placeholder="currentLocation?.name || '例如：高新区xx大厦xxxxx'"
        />
        <div class="search-result">
          <div
            @click="chooseLocation(item)"
            class="res-item"
            v-for="item in locationTipArr"
            :key="item.id"
          >
            <span class="name">{{ item.name }}</span>
            <p class="address">{{ item.district }}{{ item.address }}</p>
          </div>
        </div>
      </div>
      <!-- <div class="switch-mode">
        <span @click="addTileLayer" :class="tileLayer ? 'is-active' : ''" class="item">卫星</span>
        <span @click="removeTileLayer" :class="!tileLayer ? 'is-active' : ''" class="item"
          >路网</span
        >
      </div> -->
    </div>
    <div class="frm-btns">
      <ElButton @click="dialogMap = false">取消</ElButton>
      <ElButton @click="confirmMapRect" type="primary">确认</ElButton>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { ElDialog, ElInput, ElMessage } from 'element-plus'
import type { Any, LatLng } from '@/types/index'

interface LocationTips {
  name?: string
  id?: string
  district?: string
  address?: string
  lat: number
  lng: number
}

interface IProps {
  type?: 'point' | 'range'
  markerCenter?: LatLng | null
}

type Callback = () => void | null

const dialogMap = defineModel({ default: false })
const pointInfo = defineModel('pointInfo')
const props = defineProps<IProps>()
const emit = defineEmits(['pointCallback'])
const keywords = ref<string>()
const currentLocation = ref<LocationTips | null>()
const locationTipArr = ref<LocationTips[]>([])
const tileLayer = ref<boolean>(false)
const mapPromise = Promise.withResolvers()
let map: Any = null
let autoComplete: Any = null
let polyEditor: Any = null
let polygon: Any = null
let marker: Any = null
const initMapCallback: Callback[] = []
let layer1: Any
let layer2: Any

const chooseLocation = (location: LocationTips) => {
  locationTipArr.value = []
  keywords.value = ''
  currentLocation.value = location
  setMapCenter(currentLocation.value.lng, currentLocation.value.lat)
  if (props.type === 'point') {
    createMarker()
  } else {
    createMapRect()
  }
}

const setMapCenter = async (lng: number, lat: number) => {
  await mapPromise.promise
  map.setCenter([lng, lat])
  map.setZoom(17)
}

const runInitMapCallback = () => {
  while (initMapCallback.length > 0) {
    const fn = initMapCallback.shift()
    fn?.()
  }
}

const initMap = () => {
  if (map) {
    runInitMapCallback?.()
    return
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  AMapLoader.load({
    key: '99bb914101a1ea5da65eeb4068062c18', //申请好的Web端开发者key，调用 load 时必填
    version: '2.0', //指定要加载的 JS API 的版本，缺省时默认为 1.4.15
  })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .then((AMap) => {
      layer1 = new AMap.TileLayer.Satellite()
      layer2 = AMap.createDefaultLayer()
      map = new AMap.Map('map', {
        viewMode: '2D', //默认使用 2D 模式
        layers: [layer2],
        center: [106.445802, 29.570552],
        zoom: 10, //地图级别
      })

      AMap.plugin('AMap.AutoComplete', function () {
        const autoOptions = {
          city: '全国',
          input: 'tipinput',
        }
        autoComplete = new AMap.AutoComplete(autoOptions)
      })
      AMap.plugin('AMap.PolygonEditor', function () {
        // createMapRect()
      })
      mapPromise.resolve(true)
      if (props.type === 'point') {
        addMapClick()
      }

      runInitMapCallback?.()
    })
    .catch((e: unknown) => {
      console.error(e) //加载错误提示
    })
}

const addMapClick = async () => {
  await mapPromise.promise
  map.on('click', (e: Any) => {
    const lng = e.lnglat.getLng()
    const lat = e.lnglat.getLat()
    currentLocation.value = {
      lat,
      lng,
    }
    createMarker()
  })
}

const addTileLayer = () => {
  tileLayer.value = true
  map.setLayers([layer1])
}

const removeTileLayer = () => {
  tileLayer.value = false
  map.setLayers([layer2])
}

const createMarker = async () => {
  await mapPromise.resolve(true)
  if (!marker) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    marker = new AMap.Marker({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      position: new AMap.LngLat(currentLocation.value?.lng, currentLocation.value?.lat),
      draggable: true,
      cursor: 'move',
    })
    marker.setMap(map)
  } else {
    marker.setPosition([currentLocation.value?.lng, currentLocation.value?.lat])
  }
}

const createMapRect = () => {
  if (!currentLocation.value) return
  const path = calculateRectanglePoints(currentLocation?.value.lat, currentLocation?.value.lng, 100)
  if (polygon) {
    map.remove(polygon)
    polyEditor?.close?.()
  }
  // map.setCenter([103.97627999801296, 30.633345315284117])
  // currentLocation.value = { lng: 103.97627999801296, lat: 30.633345315284117 }
  // const path = [
  //   [103.97836800198704, 30.633345315284117], // 2

  //   [103.97627999801296, 30.633345315284117], // 1
  //   [103.97627999801296, 30.63154868471588], // 3
  //   [103.97836800198704, 30.63154868471588], // 4
  // ]
  createRact(path)
}

const createRact = async (path: number[][]) => {
  await mapPromise.promise
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  polygon = new AMap.Polygon({
    path,
    strokeColor: '#FF33FF',
    strokeWeight: 6,
    strokeOpacity: 0.2,
    fillOpacity: 0.4,
    fillColor: '#1791fc',
    zIndex: 50,
    bubble: true,
    draggable: true,
  })
  map.add([polygon])
  // 缩放地图到合适的视野级别
  map.setFitView()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  polyEditor = new AMap.PolygonEditor(map, polygon)
  polyEditor.open()
  if (props.type === 'point') {
    polyEditor?.close?.()
  }
}

const calculateRectanglePoints = (centerLat: number, centerLng: number, distance: number) => {
  // 地球半径，单位为米
  const earthRadius = 6378137
  // 计算纬度偏移（南北方向）
  const deltaLat = (distance / earthRadius) * (180 / Math.PI)
  // 计算经度偏移（东西方向），需要考虑纬度对经度的影响
  const deltaLng =
    (distance / (earthRadius * Math.cos((Math.PI * centerLat) / 180))) * (180 / Math.PI)
  return [
    [centerLng + deltaLng, centerLat + deltaLat],
    [centerLng - deltaLng, centerLat + deltaLat],
    [centerLng - deltaLng, centerLat - deltaLat],
    [centerLng + deltaLng, centerLat - deltaLat],
  ]
}

const confirmMapRect = () => {
  if (props.type === 'point') {
    if (!marker) {
      ElMessage.warning('请选择标记点')
      return
    }
    const pos = marker?.getPosition()
    dialogMap.value = false
    emit('pointCallback', { lng: pos.lng, lat: pos.lat })
    return
  }
  if (!polyEditor) {
    ElMessage.warning('请标记活动范围')
    return
  }
  pointInfo.value = {
    lng: currentLocation.value?.lng,
    lat: currentLocation.value?.lat,
  }

  dialogMap.value = false
  emit('pointCallback')
}

const clearMap = () => {
  if (polygon) {
    map.remove(polygon)
    polyEditor?.close?.()
    polygon = null
  }
  if (marker) {
    map.remove(marker)
    marker = null
  }
  currentLocation.value = null
}

watch(dialogMap, (newValue) => {
  if (newValue) {
    initMap()
  }
})

watch(
  () => props.markerCenter,
  (val) => {
    if (val && val.lng) {
      initMapCallback.push(() => {
        currentLocation.value = { ...val }
        setMapCenter(val.lng, val.lat)
        createMarker()
      })
      ;(async () => {
        await mapPromise.promise
        initMap()
      })()
    }
  },
)

watch(
  () => props.ract,
  async (val) => {
    if (val && val.center) {
      initMapCallback.push(() => {
        if (polygon) {
          map.remove(polygon)
          polyEditor?.close?.()
        }
        currentLocation.value = val.center
        setMapCenter(val.center.lng, val.center.lat)
        createRact(val.info)
      })
      ;(async () => {
        await mapPromise.promise
        initMap()
      })()
    }
  },
)

watch(keywords, (newValue) => {
  if (!newValue) return
  autoComplete.search(keywords.value, (status: string, result: Any) => {
    if (status === 'complete' && result.info === 'OK') {
      // 搜索成功时，result即是对应的匹配数据
      const arr: LocationTips[] = []
      result?.tips?.forEach((item: Any) => {
        arr.push({
          id: item.id,
          name: item.name,
          district: item.district,
          address: item.address,
          lng: item?.location?.lng,
          lat: item?.location?.lat,
        })
      })
      locationTipArr.value = arr
    }
  })
})

watch(
  () => props.type,
  (newVal) => {
    if (newVal === 'point') {
      addMapClick()
    } else if (newVal === 'range') {
      map.off('click')
    }
  },
)
</script>

<style lang="less">
.map {
  position: relative;
  height: 70vh;

  .search-map {
    position: absolute;
    display: flex;
    width: 400px;
    top: 10px;
    left: 10px;
    z-index: 9999;

    .label {
      display: inline-block;
      padding: 5px 10px;
      width: 140px;
      background-color: #e9ecef;
      border: 1px solid #ced4da;
    }

    .search-result {
      position: absolute;
      width: 290px;
      left: 110px;
      top: 32px;
      background: #fff;
      max-height: 300px;
      overflow-y: auto;
      z-index: 999;

      .res-item {
        display: flex;
        flex-direction: column;
        padding: 5px 10px;
        justify-content: space-between;
        cursor: pointer;
        border-bottom: 0.5px solid #a2a8b1;

        .name {
          font-size: 14px;
        }
        .address {
          font-size: 12px;
          color: #aab1bb;
          margin: 5px 0 0 0;
        }
      }
    }
  }

  .switch-mode {
    position: absolute;
    z-index: 999;
    right: 5px;
    bottom: 50px;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    overflow: hidden;

    .item {
      font-size: 12px;
      background-color: #fff;
      padding: 10px 8px;
      cursor: pointer;
      border-bottom: 1px solid #f1f1f1;

      &:last-child {
        border: none;
      }
    }

    .is-active {
      background-color: #409eff;
      color: #fff;
    }
  }
}
</style>
