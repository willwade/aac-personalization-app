"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          onTranscript(transcript)
          setIsRecording(false)
          toast({
            title: "Voice input captured",
            description: "Your speech has been converted to text.",
          })
        }

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          toast({
            title: "Voice input error",
            description: "Could not capture voice input. Please try again.",
            variant: "destructive",
          })
        }

        recognitionInstance.onend = () => {
          setIsRecording(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [onTranscript, toast])

  const startRecording = () => {
    if (recognition && !isRecording) {
      setIsRecording(true)
      recognition.start()
      toast({
        title: "Listening...",
        description: "Speak now. Click the microphone again to stop.",
      })
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return null // Don't show the button if not supported
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="sm"
      onClick={toggleRecording}
      disabled={disabled}
      className="ml-2"
    >
      {isRecording ? (
        <>
          <MicOff className="h-4 w-4 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-1" />
          Voice
        </>
      )}
    </Button>
  )
}
