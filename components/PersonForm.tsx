"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Person } from "@/lib/types"
import VoiceInput from "@/components/VoiceInput"

const circleOptions = [
  { value: 1, label: "1 - Family" },
  { value: 2, label: "2 - Friends" },
  { value: 3, label: "3 - Acquaintances" },
  { value: 4, label: "4 - Paid Workers" },
  { value: 5, label: "5 - Unfamiliar Partners" },
]

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "rarely", label: "Rarely" },
]

interface PersonFormProps {
  initial?: Partial<Person>
  onSave: (person: Omit<Person, "id">) => void
  onCancel?: () => void
}

export default function PersonForm({ initial = {}, onSave, onCancel }: PersonFormProps) {
  const [form, setForm] = useState<Partial<Person>>({
    name: "",
    role: "",
    circle: undefined,
    communicationFrequency: "",
    communicationStyle: "",
    commonTopics: [],
    notes: "",
    ...initial,
  })

  const handleChange = (field: keyof Person, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleTopicsChange = (value: string) => {
    const topics = value.split(",").map((s) => s.trim()).filter(Boolean)
    handleChange("commonTopics", topics)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.circle) {
      return // Basic validation
    }
    onSave(form as Omit<Person, "id">)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., John Smith"
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
          <Label htmlFor="role">Role/Relationship</Label>
          <div className="flex gap-2">
            <Input
              id="role"
              value={form.role || ""}
              onChange={(e) => handleChange("role", e.target.value)}
              placeholder="e.g., friend, teacher, mother"
              className="flex-1"
            />
            <VoiceInput
              onTranscript={(text) => {
                const currentValue = form.role || ""
                const newValue = currentValue ? `${currentValue} ${text}` : text
                handleChange("role", newValue)
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="circle">Communication Circle *</Label>
          <Select
            value={form.circle?.toString() || ""}
            onValueChange={(value) => handleChange("circle", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select circle" />
            </SelectTrigger>
            <SelectContent>
              {circleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Communication Frequency</Label>
          <Select
            value={form.communicationFrequency || ""}
            onValueChange={(value) => handleChange("communicationFrequency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="style">Communication Style</Label>
        <div className="flex gap-2">
          <Input
            id="style"
            value={form.communicationStyle || ""}
            onChange={(e) => handleChange("communicationStyle", e.target.value)}
            placeholder="e.g., Informal, affectionate, professional"
            className="flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              const currentValue = form.communicationStyle || ""
              const newValue = currentValue ? `${currentValue} ${text}` : text
              handleChange("communicationStyle", newValue)
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topics">Common Topics</Label>
        <div className="flex gap-2">
          <Input
            id="topics"
            value={form.commonTopics?.join(", ") || ""}
            onChange={(e) => handleTopicsChange(e.target.value)}
            placeholder="e.g., Family, Sports, Work (comma separated)"
            className="flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              const currentValue = form.commonTopics?.join(", ") || ""
              const newValue = currentValue ? `${currentValue}, ${text}` : text
              handleTopicsChange(newValue)
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <div className="flex gap-2 items-start">
          <Textarea
            id="notes"
            value={form.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Any additional notes about communication with this person..."
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

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Save Person
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
