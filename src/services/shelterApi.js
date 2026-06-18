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

// Overpass API: 반경 30km 내 동물보호소 검색 (OSM 실데이터)
async function queryOverpass(lat, lng, radiusMeters = 30000) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="animal_shelter"](around:${radiusMeters},${lat},${lng});
      way["amenity"="animal_shelter"](around:${radiusMeters},${lat},${lng});
      node["office"="government"]["name"~"동물|보호소|보호센터",i](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `.trim()

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  if (!res.ok) throw new Error('Overpass API 오류')
  const data = await res.json()
  return data.elements || []
}

// 공공데이터포털 API (API 키가 있을 때)
const PUBLIC_API_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY

async function queryPublicApi(lat, lng) {
  const url =
    `https://apis.data.go.kr/1543061/animalShelterSrvc/shelterInfo` +
    `?serviceKey=${encodeURIComponent(PUBLIC_API_KEY)}&numOfRows=100&pageNo=1&_type=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('공공데이터 API 오류')
  const json = await res.json()
  const items = json?.response?.body?.items?.item
  if (!items) return []
  const list = Array.isArray(items) ? items : [items]
  return list
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
  let shelters = []

  // 1순위: 공공데이터 API (키 있는 경우)
  const hasPublicKey =
    PUBLIC_API_KEY && PUBLIC_API_KEY !== 'your_public_data_api_key_here'

  if (hasPublicKey) {
    try {
      const apiResults = await queryPublicApi(lat, lng)
      shelters = apiResults
    } catch {
      // 실패 시 Overpass로 fallback
    }
  }

  // 2순위: Overpass API (OSM 실데이터, 무료)
  if (shelters.length === 0) {
    try {
      const elements = await queryOverpass(lat, lng)
      shelters = elements.map((el) => {
        const elLat = el.lat ?? el.center?.lat
        const elLng = el.lon ?? el.center?.lon
        const tags = el.tags || {}
        return {
          id: String(el.id),
          name: tags.name || tags['name:ko'] || '동물보호소',
          address: tags['addr:full'] || tags['addr:street'] || '',
          phone: tags.phone || tags['contact:phone'] || '',
          area: tags.operator || '',
          lat: elLat,
          lng: elLng,
          source: 'osm',
        }
      })
    } catch {
      // Overpass도 실패하면 빈 배열
    }
  }

  // 거리 계산 후 정렬
  const withDistance = shelters
    .filter((s) => s.lat && s.lng)
    .map((s) => ({
      ...s,
      distance: haversine(lat, lng, s.lat, s.lng),
    }))
    .sort((a, b) => a.distance - b.distance)

  return withDistance.slice(0, count)
}
