export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 기기는 위치 서비스를 지원하지 않습니다.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.',
          2: '현재 위치를 가져올 수 없습니다.',
          3: '위치 요청 시간이 초과되었습니다.',
        }
        reject(new Error(messages[err.code] || '위치를 가져오는 데 실패했습니다.'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  })
}
