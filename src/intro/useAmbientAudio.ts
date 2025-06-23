import { useEffect, useRef } from 'react'

export function useAmbientAudio(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (!audioRef.current) {
      const el = new Audio('/intro/audio/ambient.mp3')
      el.loop = true
      el.volume = 0.65
      audioRef.current = el
    }
    const audio = audioRef.current!
    audio.play().catch(() => {/* autoplay blocked until gesture */})
    return () => {
      audio.pause()
    }
  }, [enabled])
} 