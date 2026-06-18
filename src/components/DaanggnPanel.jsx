import { useState } from 'react'
import CameraCapture from './CameraCapture.jsx'

export default function DaanggnPanel({ address, dong }) {
  const [photo, setPhoto] = useState(null)
  const [toast, setToast] = useState(null) // { msg, type }
  const [copyStatus, setCopyStatus] = useState('idle')

  const title = `[${dong || '우리 동네'}] 유기견 발견 / 도움 요청`
  const body = `방금 ${address || '근처'}에서 유기견을 발견했습니다.\n\n⚠️ 혼자 있고 도움이 필요한 상태입니다.\n임시보호나 제보 가능하신 분은 댓글 남겨주세요!`
  const fullText = `제목: ${title}\n\n${body}`

  function showToast(msg, type = 'info') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(fullText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = fullText
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyStatus('copied')
    setTimeout(() => setCopyStatus('idle'), 2500)
  }

  // 이미지를 클립보드에 복사 (ClipboardItem API)
  async function copyImageToClipboard() {
    if (!photo?.blob) return false
    try {
      const blob = photo.blob instanceof File
        ? photo.blob
        : new Blob([photo.blob], { type: 'image/jpeg' })
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/jpeg': blob }),
      ])
      return true
    } catch {
      return false
    }
  }

  // 당근마켓
  async function openDaangn() {
    await copyText()
    window.location.href = 'daangn://home'
    setTimeout(() => { window.location.href = 'https://www.daangn.com/kr' }, 1500)
  }

  // Instagram: 이미지 클립보드 복사 → instagram:// 딥링크
  async function shareInstagram() {
    const copied = await copyImageToClipboard()
    if (copied) {
      showToast('📸 사진이 복사됐습니다! 인스타그램에서 붙여넣기 하세요.', 'success')
    } else {
      // 사진 없거나 ClipboardItem 미지원 → 텍스트만 복사
      await copyText()
      showToast('📋 글이 복사됐습니다! 인스타그램에 붙여넣기 하세요.', 'info')
    }
    // 딥링크로 Instagram 앱 실행
    window.location.href = 'instagram://'
    setTimeout(() => {
      // 앱 미설치 시 스토어로
      window.open('https://www.instagram.com/', '_blank')
    }, 1800)
  }

  // Threads: 웹 인텐트 (텍스트) + Web Share로 사진
  async function shareThreads() {
    const file = photo?.blob
      ? new File([photo.blob], 'stray-dog.jpg', { type: 'image/jpeg' })
      : null

    // 사진 있고 Web Share API 지원하면 파일 포함 공유
    if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title, text: body, files: [file] })
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }
    // 텍스트만 Threads 웹 인텐트
    const encoded = encodeURIComponent(`${title}\n\n${body}`)
    window.open(`https://www.threads.net/intent/post?text=${encoded}`, '_blank')
  }

  // 더 보내기 (카카오톡, SMS 등 네이티브 공유)
  async function shareGeneral() {
    const file = photo?.blob
      ? new File([photo.blob], 'stray-dog.jpg', { type: 'image/jpeg' })
      : null
    if (!navigator.share) {
      await copyText()
      return
    }
    try {
      const shareData = { title, text: body }
      if (file && navigator.canShare?.({ files: [file] })) shareData.files = [file]
      await navigator.share(shareData)
    } catch (e) {
      if (e.name !== 'AbortError') await copyText()
    }
  }

  return (
    <div className="mx-4 mt-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📢</span>
        <h2 className="font-bold text-gray-700">도움 요청 글 공유</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 space-y-4">
        {/* 카메라 */}
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">📷 사진</p>
          <CameraCapture photo={photo} onPhotoTaken={setPhoto} />
        </div>

        {/* 글 미리보기 */}
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">✏️ 글 템플릿 (자동 생성)</p>
          <div className="bg-orange-50 rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-gray-500">제목</p>
            <p className="text-sm font-medium text-gray-800 leading-snug">{title}</p>
            <p className="text-xs font-bold text-gray-500 pt-1">내용</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="space-y-2">
          {/* 당근마켓 */}
          <button
            onClick={openDaangn}
            className="w-full py-4 rounded-xl font-bold text-base bg-orange-500 active:bg-orange-600 text-white active:scale-95 transform transition-all flex items-center justify-center gap-2"
          >
            <span>🥕</span><span>내용 복사 후 당근마켓 열기</span>
          </button>

          {/* Instagram + Threads */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareInstagram}
              className="py-3.5 rounded-xl font-bold text-sm active:scale-95 transform transition-all flex items-center justify-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)' }}
            >
              <span className="text-lg">📸</span><span>Instagram</span>
            </button>

            <button
              onClick={shareThreads}
              className="py-3.5 rounded-xl font-bold text-sm bg-black active:bg-gray-900 text-white active:scale-95 transform transition-all flex items-center justify-center gap-2"
            >
              <ThreadsIcon /><span>Threads</span>
            </button>
          </div>

          {/* 더 보내기 */}
          <button
            onClick={shareGeneral}
            className={`w-full py-3 rounded-xl font-medium text-sm active:scale-95 transform transition-all flex items-center justify-center gap-2 border ${
              copyStatus === 'copied'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 active:bg-gray-100'
            }`}
          >
            {copyStatus === 'copied'
              ? <><span>✅</span><span>클립보드에 복사됨</span></>
              : <><span>↗️</span><span>더 보내기 (카카오톡, SMS 등)</span></>}
          </button>
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div
          className={`mt-3 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-md transition-all ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function ThreadsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 192 192" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96v.078c.223 28.685 6.88 51.515 19.787 67.92C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.944-24.723-24.553zm-41.2 45.379c-10.426.57-21.258-4.099-21.82-14.078-.412-7.714 5.482-16.322 23.366-17.35 2.043-.117 4.048-.174 6.02-.174 6.19 0 11.975.6 17.271 1.746-1.966 24.58-15.146 29.173-24.837 29.856z"/>
    </svg>
  )
}
