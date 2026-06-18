// 카카오 API 대신 Nominatim (OpenStreetMap) 사용 — 무료, API 키 불필요
export async function reverseGeocode({ lat, lng }) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}` +
    `&format=json&accept-language=ko&addressdetails=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'DangSpatch/1.0 (stray-dog-rescue-helper)' },
  })
  if (!res.ok) throw new Error('주소 변환에 실패했습니다.')

  const data = await res.json()
  if (!data || data.error) throw new Error('주소를 찾을 수 없습니다.')

  const addr = data.address || {}

  // 도로명 주소 조합
  const road = addr.road || addr.pedestrian || ''
  const city = addr.city || addr.town || addr.county || addr.province || ''
  const district = addr.city_district || addr.suburb || ''
  const houseNumber = addr.house_number || ''

  const fullAddress = [city, district, road, houseNumber].filter(Boolean).join(' ')

  // 동네 이름 (dong)
  const dong =
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    addr.city_district ||
    addr.town ||
    addr.city ||
    ''

  return { address: fullAddress || data.display_name || '주소 불명', dong }
}
