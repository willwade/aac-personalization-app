"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Save, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConversationLogger() {
  const [isRecording, setIsRecording] = useState(false)
  const [conversationPartner, setConversationPartner] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [transcription, setTranscription] = useState("")
  const { toast } = useToast()

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = () => {
    // In a real app, this would use the Web Audio API and possibly Whisper for transcription
    setIsRecording(true)
    toast({
      title: "Recording started",
      description: "Your conversation is now being recorded.",
    })
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Simulate transcription result
    setTranscription(
      "This is a sample transcription of the conversation. In a real application, this would be generated using speech recognition technology like Whisper.",
    )
    toast({
      title: "Recording stopped",
      description: "Your conversation has been recorded and transcribed.",
    })
  }

  const saveConversation = () => {
    // In a real app, this would save to a database
    console.log({
      partner: conversationPartner,
      location,
      notes,
      transcription,
    })

    toast({
      title: "Conversation saved",
      description: "Your conversation log has been saved successfully.",
    })
  }

  const clearForm = () => {
    setConversationPartner("")
    setLocation("")
    setNotes("")
    setTranscription("")
    toast({
      title: "Form cleared",
      description: "All conversation data has been cleared.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partner">Conversation Partner</Label>
          <Select value={conversationPartner} onValueChange={setConversationPartner}>
            <SelectTrigger id="partner">
              <SelectValue placeholder="Select a person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mom">Mom</SelectItem>
              <SelectItem value="dad">Dad</SelectItem>
              <SelectItem value="teacher">Teacher (Ms. Johnson)</SelectItem>
              <SelectItem value="therapist">Speech Therapist (Dr. Smith)</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="therapy">Therapy Center</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="transcription">Conversation Transcription</Label>
          <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "outline"} size="sm">
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="transcription"
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder="Conversation transcription will appear here after recording"
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          {isRecording ? (
            <span className="text-destructive font-medium">Recording in progress...</span>
          ) : (
            "Record a conversation or manually type the transcription"
          )}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes & Observations</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about the conversation, communication strategies used, etc."
          rows={4}
        />
      </div>

      <div className="flex justify-between">
        <Button onClick={clearForm} variant="outline">
          <Trash className="mr-2 h-4 w-4" />
          Clear Form
        </Button>

        <Button onClick={saveConversation} disabled={!conversationPartner || !location}>
          <Save className="mr-2 h-4 w-4" />
          Save Conversation
        </Button>
      </div>
    </div>
  )
}
