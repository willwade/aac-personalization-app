"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ConversationLogger from "@/components/ConversationLogger"
import { Person, Place } from "@/lib/types"

export default function ConversationLogPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [peopleResponse, placesResponse] = await Promise.all([
        fetch("/api/people"),
        fetch("/api/places"),
      ])

      if (peopleResponse.ok) {
        const peopleData = await peopleResponse.json()
        setPeople(peopleData)
      }

      if (placesResponse.ok) {
        const placesData = await placesResponse.json()
        setPlaces(placesData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load people and places data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLog = (log: any) => {
    // Save to localStorage for now (you might want to create an API endpoint)
    const existingLogs = JSON.parse(localStorage.getItem("conversation-logs") || "[]")
    const updatedLogs = [...existingLogs, log]
    localStorage.setItem("conversation-logs", JSON.stringify(updatedLogs))

    toast({
      title: "Conversation logged",
      description: "Your conversation has been recorded with location data.",
    })
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Conversation Log</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <Tabs defaultValue="logger" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logger">Log Conversation</TabsTrigger>
            <TabsTrigger value="history">Conversation History</TabsTrigger>
            <TabsTrigger value="insights">Communication Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="logger" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Logger</CardTitle>
                <CardDescription>Record and annotate conversations with communication partners</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationLogger
                  people={people}
                  places={places}
                  onSave={handleSaveLog}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>View past conversations and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>No conversation history yet. Start logging conversations to see them here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insights" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Insights</CardTitle>
                <CardDescription>Analyze communication patterns and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <p>Communication insights will be generated after logging multiple conversations.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
