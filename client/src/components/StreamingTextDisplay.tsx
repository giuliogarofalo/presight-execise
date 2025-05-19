import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function StreamingTextDisplay() {
  const [streamedText, setStreamedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true;
    
    const fetchStream = async () => {
      if (!mounted) return;
      setLoading(true);
      
      try {
        await api.stream.text.subscribe((text) => {
          if (mounted) {
            setStreamedText(text);
          }
        });
        
        if (mounted) {
          setIsComplete(true);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error fetching stream:', error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStream();

    // Cleanup function that runs when component unmounts
    return () => {
      mounted = false;
      setStreamedText('');
      setIsComplete(false);
      setLoading(false);
    };
  }, [])

  return (
    <div className="p-4">
      <div className="bg-gray-50 p-4 rounded min-h-[200px]">
        {streamedText || (loading && <div>Loading...</div>)}
        {isComplete && <div>Stream complete</div>}
        
      </div>
    </div>
  )
}