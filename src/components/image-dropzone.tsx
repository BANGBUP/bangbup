'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const UPLOAD_ERROR_MSG: Record<string, string> = {
  TOO_LARGE: '5MB 이하 파일만 가능해요',
  INVALID_TYPE: 'JPG/PNG/WEBP만 허용돼요',
  UNAUTHORIZED: '로그인이 필요해요',
  EMPTY_FILE: '빈 파일은 업로드할 수 없어요',
  NO_FILE: '파일이 없어요',
}

type Props = {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageDropzone({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 가능해요')
        return
      }
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(UPLOAD_ERROR_MSG[err.error] ?? err.error ?? '업로드 실패')
          return
        }
        const { url } = await res.json()
        onChange(url)
      } finally {
        setUploading(false)
      }
    },
    [onChange],
  )

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  function onPaste(e: React.ClipboardEvent) {
    const file = Array.from(e.clipboardData.files)[0]
    if (file) {
      e.preventDefault()
      upload(file)
    }
  }

  if (value) {
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="대표 이미지"
          className="max-h-64 w-full rounded-md object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => onChange(null)}
        >
          <X className="size-3.5" /> 제거
        </Button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      onClick={() => inputRef.current?.click()}
      tabIndex={0}
      role="button"
      className={cn(
        'border-input flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition',
        dragging && 'border-foreground bg-muted',
        uploading && 'opacity-60',
      )}
    >
      <Upload className="text-muted-foreground size-6" />
      <p className="text-sm">
        {uploading
          ? '업로드 중...'
          : '클릭하거나 이미지를 여기로 드래그'}
      </p>
      <p className="text-muted-foreground text-xs">
        JPG · PNG · WEBP · 최대 5MB · 붙여넣기(Ctrl+V) 가능
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) upload(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
