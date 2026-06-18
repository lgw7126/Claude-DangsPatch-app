export default function HotlineCard() {
  return (
    <div className="mx-4 mt-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">
          <span>🚨</span> 전국 공식 신고 핫라인 (24시간)
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="tel:1577-0954"
            className="flex items-center justify-between bg-red-500 active:bg-red-600 text-white rounded-xl px-4 py-3 font-bold text-base active:scale-95 transform transition-transform"
          >
            <span>📞 1577-0954</span>
            <span className="text-xs font-normal text-red-100">동물보호 상담전화 (농림부)</span>
          </a>
          <a
            href="tel:120"
            className="flex items-center justify-between bg-white border border-red-200 text-red-600 rounded-xl px-4 py-3 font-bold text-sm active:scale-95 transform transition-transform"
          >
            <span>📞 120</span>
            <span className="text-xs font-normal text-gray-500">다산콜 (서울시 민원)</span>
          </a>
        </div>
      </div>
    </div>
  )
}
