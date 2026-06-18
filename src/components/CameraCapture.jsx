import { useRef, useState, useEffect, useCallback } from 'react'

export default function CameraCapture({ photo, onPhotoTaken }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 후면 카메라

  const stopStream = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
  }, [stream])

  async function openCamera() {
    setCameraError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      setStream(s)
      setIsOpen(true)
    } catch {
      setCameraError('카메라 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.')
    }
  }

  function closeCamera() {
    stopStream()
    setIsOpen(false)
  }

  function takePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob)
        onPhotoTaken({ blob, url })
        closeCamera()
      },
      'image/jpeg',
      0.9,
    )
  }

  async function flipCamera() {
    stopStream()
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next },
        audio: false,
      })
      setStream(s)
    } catch {
      setCameraError('카메라를 전환하지 못했습니다.')
    }
  }

  useEffect(() => {
    if (isOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [isOpen, stream])

  // 언마운트 시 스트림 정리
  useEffect(() => () => stopStream(), [stopStream])

  return (
    <>
      {/* 전체화면 카메라 뷰파인더 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="relative flex-1 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 상단 컨트롤 */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
              <button
                onClick={closeCamera}
                className="bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl"
              >
                ✕
              </button>
              <button
                onClick={flipCamera}
                className="bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg"
              >
                🔄
              </button>
            </div>
            {/* 촬영 가이드 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/40 rounded-2xl w-64 h-64" />
            </div>
          </div>

          {/* 하단 촬영 버튼 */}
          <div className="bg-black flex items-center justify-center py-8">
            <button
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 active:bg-white/40 transition-all active:scale-90 flex items-center justify-center"
            >
              <span className="w-16 h-16 rounded-full bg-white block" />
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* 카메라 버튼 / 사진 미리보기 */}
      {photo ? (
        <div className="relative">
          <img
            src={photo.url}
            alt="촬영된 유기견 사진"
            className="w-full rounded-xl object-cover max-h-56"
          />
          <button
            onClick={openCamera}
            className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium"
          >
            📷 다시 찍기
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={openCamera}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 rounded-xl py-4 text-orange-500 font-medium text-sm active:bg-orange-50 transition-colors"
          >
            <span className="text-2xl">📷</span>
            <span>유기견 사진 찍기</span>
          </button>
          {cameraError && (
            <p className="text-red-500 text-xs mt-2 text-center">{cameraError}</p>
          )}
        </div>
      )}
    </>
  )
}
