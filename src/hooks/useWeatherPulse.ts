import { useState, useEffect, useRef } from 'react'
 
/**
 * Returns a sine-wave pulse value 0.0–1.0, cycling at `speed` Hz.
 * Drives animated alpha on weather H3 cells.
 */
export function useWeatherPulse(active: boolean, speed = 0.5): number {
  const [pulse, setPulse] = useState(0)
  const frameRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
 
  useEffect(() => {
    if (!active) {
      setPulse(0)
      return
    }
 
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = (timestamp - startRef.current) / 1000
      // Remap sin [-1,1] → [0,1]
      setPulse((Math.sin(elapsed * speed * 2 * Math.PI) + 1) / 2)
      frameRef.current = requestAnimationFrame(animate)
    }
 
    frameRef.current = requestAnimationFrame(animate)
 
    return () => {
      cancelAnimationFrame(frameRef.current)
      startRef.current = null
    }
  }, [active, speed])
 
  return pulse
}