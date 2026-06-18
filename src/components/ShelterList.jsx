function ShelterCard({ shelter }) {
  const distanceText =
    shelter.distance < 1
      ? `${Math.round(shelter.distance * 1000)}m`
      : `${shelter.distance.toFixed(1)}km`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{shelter.name}</h3>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {distanceText}
            </span>
          </div>
          {shelter.area && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{shelter.area}</p>
          )}
          {shelter.address && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{shelter.address}</p>
          )}
          {shelter.source === 'osm' && (
            <p className="text-xs text-gray-400 mt-1">출처: OpenStreetMap</p>
          )}
        </div>
      </div>

      {shelter.phone ? (
        <a
          href={`tel:${shelter.phone.replace(/[^0-9+]/g, '')}`}
          className="mt-3 flex items-center justify-center gap-2 bg-blue-500 active:bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-colors active:scale-95 transform"
        >
          <span>📞</span>
          <span>{shelter.phone}</span>
          <span className="font-normal text-blue-100 text-xs">전화하기</span>
        </a>
      ) : (
        <p className="mt-3 text-center text-xs text-gray-400">전화번호 정보 없음</p>
      )}
    </div>
  )
}

export default function ShelterList({ status, shelters }) {
  return (
    <div className="mx-4 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏥</span>
        <h2 className="font-bold text-gray-700">가까운 동물보호소</h2>
        <span className="text-xs text-gray-400">(OpenStreetMap 실데이터)</span>
      </div>

      {status === 'loading' && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 flex items-center justify-center gap-3 text-gray-400 text-sm">
          <span className="inline-block w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          주변 보호소를 검색 중...
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-red-500 text-sm">
          보호소 정보를 불러오지 못했습니다. 위의 핫라인으로 신고해 주세요.
        </div>
      )}

      {status === 'success' && shelters.length === 0 && (
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4 text-sm text-yellow-800">
          <p className="font-bold mb-1">⚠️ 반경 30km 내 등록된 보호소가 없습니다.</p>
          <p>위의 전국 핫라인 <strong>1577-0954</strong>로 신고하시면 담당 지자체로 연결됩니다.</p>
        </div>
      )}

      {status === 'success' && shelters.length > 0 && (
        <div className="flex flex-col gap-3">
          {shelters.map((s) => (
            <ShelterCard key={s.id || s.name} shelter={s} />
          ))}
        </div>
      )}

      {status === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-gray-400 text-sm text-center">
          위치를 파악하면 가까운 보호소를 보여드립니다.
        </div>
      )}
    </div>
  )
}
