import { useRef, useState, useEffect, useCallback } from 'react'

export default function CameraCapture({ photo, onPhotoTaken }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [cameraError, setCameraError] = useState(null)

  const stopStream = useCallback((s) => {
    (s || stream)?.getTracks().forEach((t) => t.stop())
  }, [stream])

  // 비디오 스트림 연결 (iOS 포함 안정적 동작)
  useEffect(() => {
    if (!isOpen || !stream || !videoRef.current) return
    const video = videoRef.current
    video.srcObject = stream
    // iOS Safari: play() 호출 필요
    video.play().catch(() => {})
    return () => { video.srcObject = null }
  }, [isOpen, stream])

  useEffect(() => () => stopStream(stream), [stream, stopStream])

  async function openCamera() {
    setCameraError(null)
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
      const s = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(s)
      setIsOpen(true)
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? '카메라 권한이 거부되었습니다. 브라우저 주소창의 자물쇠 아이콘을 눌러 허용해 주세요.'
          : '카메라를 열 수 없습니다. 아래 버튼으로 사진을 선택해 주세요.'
      setCameraError(msg)
    }
  }

  async function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    stopStream(stream)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: next } },
        audio: false,
      })
      setStream(s)
    } catch {
      setCameraError('카메라를 전환하지 못했습니다.')
    }
  }

  function closeCamera() {
    stopStream(stream)
    setStream(null)
    setIsOpen(false)
  }

  function takePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob)
        onPhotoTaken({ blob, url })
        closeCamera()
      },
      'image/jpeg',
      0.92,
    )
  }

  // 파일 선택 폴백 (갤러리 or 카메라)
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onPhotoTaken({ blob: file, url })
    e.target.value = ''
  }

  function retake() {
    if (photo?.url) URL.revokeObjectURL(photo.url)
    onPhotoTaken(null)
  }

  return (
    <>
      {/* 전체화면 카메라 뷰파인더 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="relative flex-1 overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 상단 버튼 */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button
                onClick={closeCamera}
                className="bg-black/60 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl font-bold"
              >
                ✕
              </button>
              <button
                onClick={flipCamera}
                className="bg-black/60 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl"
              >
                🔄
              </button>
            </div>
            {/* 가이드 박스 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/50 rounded-2xl w-72 h-56" />
            </div>
          </div>

          {/* 촬영 버튼 */}
          <div className="bg-black flex items-center justify-center py-10">
            <button
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white active:scale-90 transition-transform flex items-center justify-center"
            >
              <span className="w-15 h-15 w-14 h-14 rounded-full bg-white block" />
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* 사진 미리보기 */}
      {photo ? (
        <div className="relative rounded-xl overflow-hidden">
          <img
            src={photo.url}
            alt="촬영된 사진"
            className="w-full object-cover max-h-52 rounded-xl"
          />
          <button
            onClick={retake}
            className="absolute bottom-2 right-2 bg-black/65 text-white text-xs px-3 py-1.5 rounded-full font-medium"
          >
            📷 다시 찍기
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 인앱 카메라 버튼 */}
          <button
            onClick={openCamera}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl py-5 text-orange-500 font-semibold text-sm active:bg-orange-100 transition-colors"
          >
            <span className="text-2xl">📷</span>
            <span>지금 바로 사진 찍기</span>
          </button>

          {/* 파일 입력 폴백 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white rounded-xl py-3 text-gray-500 text-xs active:bg-gray-50 transition-colors"
          >
            <span>🖼️</span>
            <span>갤러리에서 선택 / 기기 카메라</span>
          </button>

          {cameraError && (
            <p className="text-xs text-red-500 text-center px-2">{cameraError}</p>
          )}
        </div>
      )}
    </>
  )
}
