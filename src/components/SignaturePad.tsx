import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckIcon from '@mui/icons-material/Check'

interface SignaturePadProps {
  onSave: (file: File) => void
  onCancel?: () => void
  width?: number
  height?: number
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  width = 450,
  height = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  // Initialize canvas with high-DPI scaling (window.devicePixelRatio)
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    const displayWidth = rect.width || width
    const displayHeight = rect.height || height

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2.5
      ctx.strokeStyle = '#0f172a'
    }
  }, [width, height])

  useEffect(() => {
    setupCanvas()
    window.addEventListener('resize', setupCanvas)
    return () => window.removeEventListener('resize', setupCanvas)
  }, [setupCanvas])

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    const pt = getCanvasCoordinates(e)
    lastPointRef.current = pt

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(pt.x, pt.y)
      ctx.lineTo(pt.x, pt.y)
      ctx.stroke()
    }
    setHasDrawn(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const currentPt = getCanvasCoordinates(e)

    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
      ctx.lineTo(currentPt.x, currentPt.y)
      ctx.stroke()
    }

    lastPointRef.current = currentPt
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPointRef.current = null
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Pointer capture release safeguard
      }
    }
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setHasDrawn(false)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return

    const dataUrl = canvas.toDataURL('image/png')
    const arr = dataUrl.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    const blob = new Blob([u8arr], { type: mime })
    const file = new File([blob], 'signature.png', { type: 'image/png' })

    onSave(file)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: width, my: 1 }}>
      <Box
        sx={{
          border: '2px dashed rgba(143, 0, 255, 0.3)',
          borderRadius: 2,
          bgcolor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            touchAction: 'none',
            width: '100%',
            height: height,
            display: 'block',
            cursor: 'crosshair',
          }}
        />
        {!hasDrawn && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              pointerEvents: 'none',
              color: 'text.secondary',
              opacity: 0.6,
              userSelect: 'none',
            }}
          >
            Draw your signature here using finger, stylus, or mouse
          </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} alignItems="center">
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<DeleteOutlineIcon />}
          onClick={handleClear}
          disabled={!hasDrawn}
        >
          Clear
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<CheckIcon />}
          onClick={handleSave}
          disabled={!hasDrawn}
        >
          Apply Signature
        </Button>
        {onCancel && (
          <Button size="small" variant="text" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default SignaturePad
