"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, MessageSquare, Clock, Navigation } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LocationCapture, { LocationData, calculateDistance, isAtLocation } from "@/components/LocationCapture"
import VoiceInput from "@/components/VoiceInput"
import { Person, Place } from "@/lib/types"

interface ConversationLog {
  id: string
  timestamp: number
  participants: string[] // Person IDs
  location?: string // Place ID
  topic: string
  notes: string
  duration?: number // minutes
  // GPS data
  latitude?: number
  longitude?: number
  locationAccuracy?: number
  detectedPlace?: string // Auto-detected place ID
}

interface ConversationLoggerProps {
  people: Person[]
  places: Place[]
  onSave: (log: ConversationLog) => void
  onCancel?: () => void
}

export default function ConversationLogger({ people, places, onSave, onCancel }: ConversationLoggerProps) {
  const [form, setForm] = useState<Partial<ConversationLog>>({
    participants: [],
    topic: "",
    notes: "",
    timestamp: Date.now(),
  })
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [detectedPlaces, setDetectedPlaces] = useState<Place[]>([])
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const { toast } = useToast()

  // Auto-detect location on component mount
  useEffect(() => {
    autoDetectLocation()
  }, [places])

  const handleChange = (field: keyof ConversationLog, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleParticipantsChange = (value: string) => {
    const participantIds = value.split(",").map((s) => s.trim()).filter(Boolean)
    handleChange("participants", participantIds)
  }

  const autoDetectLocation = async () => {
    if (!navigator.geolocation || places.length === 0) return

    setIsAutoDetecting(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        }

        setCurrentLocation(location)

        // Find nearby places
        const nearby = places.filter(place => {
          if (!place.latitude || !place.longitude) return false

          // Use a margin based on GPS accuracy + place accuracy + base margin
          const margin = Math.max(
            100, // Minimum 100m margin
            (location.accuracy || 50) + (place.locationAccuracy || 50) + 50
          )

          return isAtLocation(
            location.latitude,
            location.longitude,
            place.latitude,
            place.longitude,
            margin
          )
        })

        setDetectedPlaces(nearby)
        setIsAutoDetecting(false)

        if (nearby.length > 0) {
          // Auto-select the closest place
          const closest = nearby.reduce((prev, current) => {
            const prevDistance = calculateDistance(
              location.latitude, location.longitude,
              prev.latitude!, prev.longitude!
            )
            const currentDistance = calculateDistance(
              location.latitude, location.longitude,
              current.latitude!, current.longitude!
            )
            return currentDistance < prevDistance ? current : prev
          })

          handleChange("location", closest.id)
          handleChange("detectedPlace", closest.id)
          handleChange("latitude", location.latitude)
          handleChange("longitude", location.longitude)
          handleChange("locationAccuracy", location.accuracy)

          toast({
            title: "Location detected",
            description: `You appear to be at ${closest.name}`,
          })
        } else {
          // Save GPS coordinates even if no place detected
          handleChange("latitude", location.latitude)
          handleChange("longitude", location.longitude)
          handleChange("locationAccuracy", location.accuracy)
        }
      },
      (error) => {
        setIsAutoDetecting(false)
        console.log("Auto-detection failed:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    )
  }

  const handleLocationCapture = (location: LocationData) => {
    setCurrentLocation(location)
    handleChange("latitude", location.latitude)
    handleChange("longitude", location.longitude)
    handleChange("locationAccuracy", location.accuracy)

    // Check for nearby places
    const nearby = places.filter(place => {
      if (!place.latitude || !place.longitude) return false
      const margin = Math.max(100, (location.accuracy || 50) + (place.locationAccuracy || 50) + 50)
      return isAtLocation(location.latitude, location.longitude, place.latitude, place.longitude, margin)
    })

    setDetectedPlaces(nearby)

    if (nearby.length > 0 && !form.location) {
      const closest = nearby[0]
      handleChange("location", closest.id)
      toast({
        title: "Nearby place found",
        description: `${closest.name} is nearby. Auto-selected.`,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.topic || !form.participants || form.participants.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one participant and a topic.",
        variant: "destructive",
      })
      return
    }

    const log: ConversationLog = {
      id: Date.now().toString(),
      timestamp: form.timestamp || Date.now(),
      participants: form.participants || [],
      location: form.location,
      topic: form.topic || "",
      notes: form.notes || "",
      duration: form.duration,
      latitude: form.latitude,
      longitude: form.longitude,
      locationAccuracy: form.locationAccuracy,
      detectedPlace: form.detectedPlace,
    }

    onSave(log)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Log Conversation
        </CardTitle>
        <CardDescription>
          Record details about a communication interaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Detection */}
          <div className="space-y-2">
            <Label>Location Detection</Label>
            <div className="p-3 border rounded-lg bg-muted/50">
              {isAutoDetecting ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Navigation className="h-4 w-4 animate-pulse" />
                  Auto-detecting your location...
                </div>
              ) : detectedPlaces.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <MapPin className="h-4 w-4" />
                    Detected nearby places:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedPlaces.map((place) => (
                      <Badge
                        key={place.id}
                        variant={form.location === place.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleChange("location", place.id)}
                      >
                        {place.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <LocationCapture
                  onLocationCapture={handleLocationCapture}
                  buttonText="Detect Current Location"
                  showAccuracy={false}
                />
              )}
            </div>
          </div>

          {/* Manual Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="location">Place (Optional)</Label>
            <Select
              value={form.location || "none"}
              onValueChange={(value) => handleChange("location", value === "none" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a place or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific place</SelectItem>
                {places.map((place) => (
                  <SelectItem key={place.id} value={place.id}>
                    {place.name} {place.type && `(${place.type})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label htmlFor="participants">Participants *</Label>
            <div className="space-y-2">
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !form.participants?.includes(value)) {
                    const newParticipants = [...(form.participants || []), value]
                    handleChange("participants", newParticipants)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a participant" />
                </SelectTrigger>
                <SelectContent>
                  {people
                    .filter(person => !form.participants?.includes(person.id))
                    .map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} {person.role && `(${person.role})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Show selected participants */}
              {form.participants && form.participants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.participants.map((participantId) => {
                    const person = people.find(p => p.id === participantId)
                    return person ? (
                      <Badge
                        key={participantId}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const newParticipants = form.participants?.filter(id => id !== participantId) || []
                          handleChange("participants", newParticipants)
                        }}
                      >
                        {person.name} ✕
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                value={form.topic || ""}
                onChange={(e) => handleChange("topic", e.target.value)}
                placeholder="What was discussed?"
                required
                className="flex-1"
              />
              <VoiceInput
                onTranscript={(text) => {
                  const currentValue = form.topic || ""
                  const newValue = currentValue ? `${currentValue} ${text}` : text
                  handleChange("topic", newValue)
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <div className="flex gap-2 items-start">
              <Textarea
                id="notes"
                value={form.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional details about the conversation..."
                rows={3}
                className="flex-1"
              />
              <VoiceInput
                onTranscript={(text) => {
                  const currentValue = form.notes || ""
                  const newValue = currentValue ? `${currentValue} ${text}` : text
                  handleChange("notes", newValue)
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={form.duration || ""}
              onChange={(e) => handleChange("duration", parseInt(e.target.value) || undefined)}
              placeholder="How long did it last?"
              min="1"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Save Conversation
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
