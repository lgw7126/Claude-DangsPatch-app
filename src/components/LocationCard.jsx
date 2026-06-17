export default function LocationCard({ status, address, onRefresh }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 mx-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="font-semibold text-gray-700 text-sm">현재 위치</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={status === 'loading'}
          className="text-xs text-orange-500 font-medium disabled:opacity-40 active:scale-95 transition-transform"
        >
          {status === 'loading' ? '위치 파악 중...' : '새로고침'}
        </button>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-1">
          <span className="inline-block w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
          GPS 신호를 받는 중입니다...
        </div>
      )}

      {status === 'error' && (
        <div className="text-red-500 text-sm py-1">
          위치를 가져오지 못했습니다. 브라우저 위치 권한을 확인해 주세요.
        </div>
      )}

      {status === 'success' && address && (
        <p className="text-gray-800 font-medium text-base leading-snug">{address}</p>
      )}

      {status === 'idle' && (
        <p className="text-gray-400 text-sm py-1">위치 파악 전입니다.</p>
      )}
    </div>
  )
}
