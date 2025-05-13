import { useState, useEffect } from 'react'

async function* readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  } finally {
    reader.releaseLock()
  }
}

export default function StreamingTextDisplay() {
  const [streamedText, setStreamedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchStream = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3000/api/stream-text')
        const reader = response.body?.getReader()
        if (!reader) return

        let text = ''
        for await (const chunk of readStream(reader)) {
          text += chunk
          setStreamedText(text)
        }
        setIsComplete(true)
      } catch (error) {
        console.error('Error fetching stream:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStream()
  }, [setLoading, setStreamedText, setIsComplete])

  return (
    <div className="p-4">
      <div className="bg-gray-50 p-4 rounded min-h-[200px]">
        {streamedText || (loading && <div>Loading...</div>)}
        {isComplete && <div>Stream complete</div>}
        
      </div>
    </div>
  )
}