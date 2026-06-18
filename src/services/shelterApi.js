const API_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY

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

// API 키 없을 때 사용할 샘플 데이터 (전국 대표 보호소)
const SAMPLE_SHELTERS = [
  { id: 's1', name: '서울특별시 동물보호센터', address: '서울시 마포구 상암동 267', phone: '02-791-3481', area: '서울특별시', lat: 37.5665, lng: 126.978 },
  { id: 's2', name: '경기도 동물위생시험소', address: '경기도 수원시 권선구 수인로 137', phone: '031-8008-6800', area: '경기도', lat: 37.2636, lng: 127.0286 },
  { id: 's3', name: '부산광역시 동물보호센터', address: '부산시 기장군 철마면 와여로 207', phone: '051-720-6624', area: '부산광역시', lat: 35.2100, lng: 129.0751 },
]

export async function fetchNearbyShelters({ lat, lng }, count = 3) {
  if (!API_KEY || API_KEY === 'your_public_data_api_key_here') {
    // 샘플 데이터에 거리 계산 적용
    const withDistance = SAMPLE_SHELTERS.map((s) => ({
      ...s,
      distance: haversine(lat, lng, s.lat, s.lng),
      isSample: true,
    })).sort((a, b) => a.distance - b.distance)
    return withDistance.slice(0, count)
  }

  const url =
    `https://apis.data.go.kr/1543061/animalShelterSrvc/shelterInfo` +
    `?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=100&pageNo=1&_type=json`

  const res = await fetch(url)
  if (!res.ok) throw new Error('보호소 정보를 불러오지 못했습니다.')

  const json = await res.json()
  const items = json?.response?.body?.items?.item
  if (!items) throw new Error('보호소 데이터가 없습니다.')

  const list = Array.isArray(items) ? items : [items]

  const withDistance = list
    .filter((s) => s.lat && s.lng)
    .map((s) => ({
      id: s.careRegNo,
      name: s.careNm,
      address: s.careAddr,
      phone: s.careTel,
      area: s.orgNm,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lng),
      distance: haversine(lat, lng, parseFloat(s.lat), parseFloat(s.lng)),
    }))
    .sort((a, b) => a.distance - b.distance)

  return withDistance.slice(0, count)
}
