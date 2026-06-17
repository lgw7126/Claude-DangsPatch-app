function ShelterCard({ shelter }) {
  const distanceText =
    shelter.distance < 1
      ? `${Math.round(shelter.distance * 1000)}m`
      : `${shelter.distance.toFixed(1)}km`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{shelter.name}</h3>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {distanceText}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{shelter.area}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{shelter.address}</p>
        </div>
      </div>

      <a
        href={`tel:${shelter.phone}`}
        className="mt-3 flex items-center justify-center gap-2 bg-blue-500 active:bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-colors active:scale-95 transform"
      >
        <span>📞</span>
        <span>{shelter.phone || '번호 없음'}</span>
        <span className="font-normal text-blue-100 text-xs">전화하기</span>
      </a>
    </div>
  )
}

export default function ShelterList({ status, shelters }) {
  return (
    <div className="mx-4 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏥</span>
        <h2 className="font-bold text-gray-700">가까운 동물보호소</h2>
      </div>

      {status === 'loading' && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 flex items-center justify-center gap-3 text-gray-400 text-sm">
          <span className="inline-block w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          보호소 정보를 불러오는 중...
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-red-500 text-sm">
          보호소 정보를 불러오지 못했습니다. API 키를 확인해 주세요.
        </div>
      )}

      {status === 'success' && shelters.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-gray-400 text-sm text-center">
          주변 보호소 정보가 없습니다.
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
