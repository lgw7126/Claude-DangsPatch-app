import { useState } from 'react'

export default function DaanggnPanel({ address, dong }) {
  const [copied, setCopied] = useState(false)

  const title = `[${dong || '우리 동네'}] 유기견 발견 / 도움 요청`
  const body = `방금 ${address || '근처'}에서 유기견을 발견했습니다.\n\n⚠️ 혼자 있고 다친 것 같습니다. 근처에 계신 분들의 도움이 필요합니다.\n임시보호나 제보 가능하신 분은 댓글 남겨주세요!`
  const fullText = `제목: ${title}\n\n${body}`

  async function handleCopyAndOpen() {
    try {
      await navigator.clipboard.writeText(fullText)
    } catch {
      // clipboard API 미지원 시 fallback
      const ta = document.createElement('textarea')
      ta.value = fullText
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)

    // 딥링크: 당근마켓 앱 실행 (앱 미설치 시 스토어로 fallback)
    window.location.href = 'daangn://home'
    setTimeout(() => {
      // 앱이 없으면 웹으로 이동
      window.location.href = 'https://www.daangn.com/kr'
    }, 1500)
  }

  const hasLocation = !!address

  return (
    <div className="mx-4 mt-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🥕</span>
        <h2 className="font-bold text-gray-700">당근마켓 동네생활 글쓰기</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">자동 생성된 글 템플릿</p>

        <div className="bg-orange-50 rounded-xl p-3 mb-4 space-y-1">
          <p className="text-xs font-bold text-gray-500">제목</p>
          <p className="text-sm font-medium text-gray-800 leading-snug">{title}</p>
          <p className="text-xs font-bold text-gray-500 pt-2">내용</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>
        </div>

        {!hasLocation && (
          <p className="text-xs text-orange-400 mb-3 text-center">
            ⚠️ 위치를 먼저 파악하면 더 정확한 주소로 채워집니다.
          </p>
        )}

        <button
          onClick={handleCopyAndOpen}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 transform flex items-center justify-center gap-2 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 active:bg-orange-600 text-white'
          }`}
        >
          {copied ? (
            <>
              <span>✅</span>
              <span>복사 완료! 당근마켓 열리는 중...</span>
            </>
          ) : (
            <>
              <span>🥕</span>
              <span>내용 복사하고 당근마켓 열기</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
