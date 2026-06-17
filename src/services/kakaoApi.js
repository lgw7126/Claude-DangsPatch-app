const KAKAO_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

export async function reverseGeocode({ lat, lng }) {
  if (!KAKAO_KEY) throw new Error('카카오 API 키가 설정되지 않았습니다.')

  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  })
  if (!res.ok) throw new Error('주소 변환에 실패했습니다.')

  const data = await res.json()
  const doc = data.documents?.[0]
  if (!doc) throw new Error('해당 좌표의 주소를 찾을 수 없습니다.')

  const roadAddress = doc.road_address?.address_name
  const jibunAddress = doc.address?.address_name
  const address = roadAddress || jibunAddress || '주소 불명'

  // 동네 이름: 법정동 (dong) 또는 행정동
  const dong =
    doc.road_address?.road_name
      ? `${doc.road_address?.region_3depth_name}`
      : doc.address?.region_3depth_h_name || doc.address?.region_3depth_name || ''

  return { address, dong }
}
