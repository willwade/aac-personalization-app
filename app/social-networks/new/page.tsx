"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, MapPin } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import PersonForm from "@/components/PersonForm"
import PlaceForm from "@/components/PlaceForm"
import { Person, Place } from "@/lib/types"

export default function AddNewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("person")

  const handlePersonSave = async (person: Omit<Person, "id">) => {
    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...person,
          id: Date.now().toString(), // Simple ID generation
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save person")
      }

      toast({
        title: "Person added successfully",
        description: `${person.name} has been added to your social network.`,
      })

      router.push("/social-networks")
    } catch (error) {
      console.error("Error saving person:", error)
      toast({
        title: "Error",
        description: "Failed to save person. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePlaceSave = async (place: Omit<Place, "id">) => {
    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...place,
          id: Date.now().toString(), // Simple ID generation
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save place")
      }

      toast({
        title: "Place added successfully",
        description: `${place.name} has been added to your social network.`,
      })

      router.push("/social-networks")
    } catch (error) {
      console.error("Error saving place:", error)
      toast({
        title: "Error",
        description: "Failed to save place. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/social-networks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Social Networks
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add New</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="person" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Add Person
            </TabsTrigger>
            <TabsTrigger value="place" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Add Place
            </TabsTrigger>
          </TabsList>

          <TabsContent value="person" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Person</CardTitle>
                <CardDescription>
                  Add someone to your social network with their communication preferences and relationship details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonForm onSave={handlePersonSave} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="place" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Place</CardTitle>
                <CardDescription>
                  Add a location where communication happens - home, work, school, community centers, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlaceForm onSave={handlePlaceSave} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
