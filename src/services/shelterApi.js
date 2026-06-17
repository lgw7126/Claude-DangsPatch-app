const API_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY

// Haversine 공식으로 두 좌표 사이 거리(km) 계산
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

export async function fetchNearbyShelters({ lat, lng }, count = 3) {
  if (!API_KEY) throw new Error('공공데이터 API 키가 설정되지 않았습니다.')

  // 공공데이터포털 동물보호센터 정보 서비스
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
