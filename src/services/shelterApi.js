import { NATIONAL_SHELTERS } from '../data/shelters.js'

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Overpass API — 한국 전체 bbox로 동물보호소 검색
async function queryOverpassKorea(lat, lng) {
  // 한국 전체 영역 bounding box (south, west, north, east)
  const bbox = '33.0,124.0,38.9,132.0'
  const query = `
[out:json][timeout:20];
(
  node["amenity"="animal_shelter"](${bbox});
  way["amenity"="animal_shelter"](${bbox});
  node["animal_shelter"="yes"](${bbox});
);
out center tags;
  `.trim()

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  })
  if (!res.ok) throw new Error('Overpass 오류')
  const data = await res.json()

  return (data.elements || []).map((el) => {
    const elLat = el.lat ?? el.center?.lat
    const elLng = el.lon ?? el.center?.lon
    const tags = el.tags || {}
    return {
      id: `osm-${el.id}`,
      name: tags.name || tags['name:ko'] || '동물보호소',
      address: tags['addr:full'] || tags['addr:street'] || '',
      phone: tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '',
      area: tags.operator || tags['addr:city'] || '',
      lat: elLat,
      lng: elLng,
      source: 'osm',
    }
  })
}

// 공공데이터포털 API (키 있을 때)
const PUBLIC_API_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY

async function queryPublicApi() {
  const url =
    `https://apis.data.go.kr/1543061/animalShelterSrvc/shelterInfo` +
    `?serviceKey=${encodeURIComponent(PUBLIC_API_KEY)}&numOfRows=200&pageNo=1&_type=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('공공데이터 API 오류')
  const json = await res.json()
  const items = json?.response?.body?.items?.item
  if (!items) return []
  return (Array.isArray(items) ? items : [items])
    .filter((s) => s.lat && s.lng)
    .map((s) => ({
      id: s.careRegNo,
      name: s.careNm,
      address: s.careAddr,
      phone: s.careTel,
      area: s.orgNm,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lng),
      source: 'official',
    }))
}

export async function fetchNearbyShelters({ lat, lng }, count = 3) {
  const hasPublicKey =
    PUBLIC_API_KEY && PUBLIC_API_KEY !== 'your_public_data_api_key_here'

  let pool = []

  // 1순위: 공공데이터 API
  if (hasPublicKey) {
    try {
      pool = await queryPublicApi()
    } catch { /* fallthrough */ }
  }

  // 2순위: Overpass (OSM 실데이터)
  if (pool.length === 0) {
    try {
      pool = await queryOverpassKorea(lat, lng)
    } catch { /* fallthrough */ }
  }

  // 3순위: 내장 전국 보호소 데이터
  if (pool.length === 0) {
    pool = NATIONAL_SHELTERS.map((s) => ({ ...s, source: 'bundled' }))
  } else {
    // OSM/공공데이터에 결과가 있어도 내장 데이터를 merge (보완)
    const osmIds = new Set(pool.map((s) => `${s.lat?.toFixed(3)},${s.lng?.toFixed(3)}`))
    const extras = NATIONAL_SHELTERS
      .filter((s) => !osmIds.has(`${s.lat.toFixed(3)},${s.lng.toFixed(3)}`))
      .map((s) => ({ ...s, source: 'bundled' }))
    pool = [...pool, ...extras]
  }

  // 거리 계산 후 정렬 — 거리 제한 없이 항상 가까운 순으로 반환
  return pool
    .filter((s) => s.lat && s.lng)
    .map((s) => ({
      ...s,
      distance: haversine(lat, lng, s.lat, s.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
}
