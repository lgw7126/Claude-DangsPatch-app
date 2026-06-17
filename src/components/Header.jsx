export default function Header() {
  return (
    <header className="bg-orange-500 text-white px-4 py-4 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🐕</span>
        <div>
          <h1 className="text-xl font-bold leading-tight">댕스패치</h1>
          <p className="text-xs text-orange-100">유기견 발견 즉시 신고 도우미</p>
        </div>
      </div>
    </header>
  )
}
