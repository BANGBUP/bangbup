'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Suggestion = { id: string; title: string; methodCount?: number }

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  max?: number
  suggestUrl?: string // 예: /api/contexts
}

export function TagInput({
  value,
  onChange,
  placeholder,
  max = 8,
  suggestUrl,
}: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!suggestUrl || !input.trim()) {
      setSuggestions([])
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${suggestUrl}?q=${encodeURIComponent(input.trim())}`)
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.items ?? [])
      } catch {
        // ignore
      }
    }, 200)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [input, suggestUrl])

  function commitTag(raw: string) {
    const tag = raw.trim()
    if (!tag) return
    if (value.includes(tag)) {
      setInput('')
      return
    }
    if (value.length >= max) return
    onChange([...value, tag])
    setInput('')
    setSuggestions([])
  }

  function removeTag(t: string) {
    onChange(value.filter((x) => x !== t))
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag(input)
    } else if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="relative">
      <div className="border-input bg-background flex flex-wrap gap-1.5 rounded-md border p-2">
        {value.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1">
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          className="h-6 w-auto flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
          value={input}
          placeholder={value.length === 0 ? placeholder : ''}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKey}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-popover absolute z-10 mt-1 w-full rounded-md border p-1 shadow-md">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="hover:bg-muted flex w-full items-center justify-between rounded-sm px-2 py-1 text-sm"
              onMouseDown={(e) => {
                e.preventDefault()
                commitTag(s.title)
              }}
            >
              <span>{s.title}</span>
              {s.methodCount != null && (
                <span className="text-muted-foreground text-xs">
                  {s.methodCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
