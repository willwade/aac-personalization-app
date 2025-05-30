"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Place } from "@/lib/types"
import VoiceInput from "@/components/VoiceInput"
import LocationCapture, { LocationData } from "@/components/LocationCapture"

const placeTypes = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work/Office" },
  { value: "school", label: "School/Educational" },
  { value: "medical", label: "Medical/Healthcare" },
  { value: "community", label: "Community Center" },
  { value: "recreational", label: "Recreational/Sports" },
  { value: "religious", label: "Religious/Spiritual" },
  { value: "commercial", label: "Store/Commercial" },
  { value: "transport", label: "Transportation" },
  { value: "other", label: "Other" },
]

const accessibilityFeatures = [
  "Wheelchair accessible",
  "Hearing loop system",
  "Visual aids available",
  "Quiet environment",
  "Good lighting",
  "Clear signage",
  "Staff trained in AAC",
  "Accessible parking",
]

interface PlaceFormProps {
  initial?: Partial<Place>
  onSave: (place: Omit<Place, "id">) => void
  onCancel?: () => void
}

export default function PlaceForm({ initial = {}, onSave, onCancel }: PlaceFormProps) {
  const [form, setForm] = useState<Partial<Place>>({
    name: "",
    type: "",
    address: "",
    description: "",
    accessibilityFeatures: [],
    communicationNotes: "",
    frequencyOfVisit: "",
    ...initial,
  })

  const handleChange = (field: keyof Place, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAccessibilityChange = (value: string) => {
    const features = value.split(",").map((s) => s.trim()).filter(Boolean)
    handleChange("accessibilityFeatures", features)
  }

  const handleLocationCapture = (location: LocationData) => {
    handleChange("latitude", location.latitude)
    handleChange("longitude", location.longitude)
    handleChange("locationAccuracy", location.accuracy)
    handleChange("locationTimestamp", location.timestamp)

    // If we got an address from GPS, suggest it for the address field
    if (location.address && !form.address) {
      handleChange("address", location.address)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.type) {
      return // Basic validation
    }
    onSave(form as Omit<Place, "id">)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Place Name *</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Local Library, John's House"
              required
              className="flex-1"
            />
            <VoiceInput
              onTranscript={(text) => {
                const currentValue = form.name || ""
                const newValue = currentValue ? `${currentValue} ${text}` : text
                handleChange("name", newValue)
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Place Type *</Label>
          <Select
            value={form.type || ""}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select place type" />
            </SelectTrigger>
            <SelectContent>
              {placeTypes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            value={form.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="e.g., 123 Main St, City, State"
            className="flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              const currentValue = form.address || ""
              const newValue = currentValue ? `${currentValue} ${text}` : text
              handleChange("address", newValue)
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location (GPS)</Label>
        <div className="p-3 border rounded-lg bg-muted/50">
          <LocationCapture
            onLocationCapture={handleLocationCapture}
            buttonText="Capture Current Location"
            showAccuracy={true}
          />
          {form.latitude && form.longitude && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>📍 Saved location: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>
              {form.locationAccuracy && (
                <p>Accuracy: ±{Math.round(form.locationAccuracy)}m</p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            💡 Capture your current GPS location if you're at this place right now. This helps with automatic location detection later.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency of Visit</Label>
        <Select
          value={form.frequencyOfVisit || ""}
          onValueChange={(value) => handleChange("frequencyOfVisit", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="How often do you visit?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="occasionally">Occasionally</SelectItem>
            <SelectItem value="rarely">Rarely</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <div className="flex gap-2 items-start">
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe this place and what happens there..."
            rows={3}
            className="flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              const currentValue = form.description || ""
              const newValue = currentValue ? `${currentValue} ${text}` : text
              handleChange("description", newValue)
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessibility">Accessibility Features</Label>
        <div className="flex gap-2">
          <Input
            id="accessibility"
            value={form.accessibilityFeatures?.join(", ") || ""}
            onChange={(e) => handleAccessibilityChange(e.target.value)}
            placeholder="e.g., Wheelchair accessible, Hearing loop (comma separated)"
            className="flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              const currentValue = form.accessibilityFeatures?.join(", ") || ""
              const newValue = currentValue ? `${currentValue}, ${text}` : text
              handleAccessibilityChange(newValue)
            }}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Common features: {accessibilityFeatures.slice(0, 4).join(", ")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="communication">Communication Notes</Label>
        <div className="flex gap-2 items-start">
          <Textarea
            id="communication"
            value={form.communicationNotes || ""}
            onChange={(e) => handleChange("communicationNotes", e.target.value)}
            placeholder="Any special communication considerations for this place..."
            rows={3}
            className="flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              const currentValue = form.communicationNotes || ""
              const newValue = currentValue ? `${currentValue} ${text}` : text
              handleChange("communicationNotes", newValue)
            }}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Save Place
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
