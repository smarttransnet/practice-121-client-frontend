import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export function useOutsideClick<T extends HTMLElement>(
  callback: () => void
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [callback])

  return ref
}
