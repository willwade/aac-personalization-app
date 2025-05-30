"use client";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { PlusCircle, User, MapPin, Edit, Trash2 } from "lucide-react"
import SocialNetworkQuestionnaire from "./questionnaire"
import PersonForm from "@/components/PersonForm"
import PlaceForm from "@/components/PlaceForm"
import { Person, Place } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function SocialNetworksPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showAddPlace, setShowAddPlace] = useState(false)
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
        description: "Failed to load social network data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deletePerson = async (id: string) => {
    try {
      const updatedPeople = people.filter((p) => p.id !== id)
      const response = await fetch("/api/people", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPeople),
      })

      if (response.ok) {
        setPeople(updatedPeople)
        toast({
          title: "Person deleted",
          description: "The person has been removed from your social network.",
        })
      }
    } catch (error) {
      console.error("Error deleting person:", error)
      toast({
        title: "Error",
        description: "Failed to delete person.",
        variant: "destructive",
      })
    }
  }

  const deletePlace = async (id: string) => {
    try {
      const updatedPlaces = places.filter((p) => p.id !== id)
      const response = await fetch("/api/places", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlaces),
      })

      if (response.ok) {
        setPlaces(updatedPlaces)
        toast({
          title: "Place deleted",
          description: "The place has been removed from your social network.",
        })
      }
    } catch (error) {
      console.error("Error deleting place:", error)
      toast({
        title: "Error",
        description: "Failed to delete place.",
        variant: "destructive",
      })
    }
  }

  const handlePersonSave = async (person: Omit<Person, "id">) => {
    try {
      const newPerson = {
        ...person,
        id: Date.now().toString(),
      }

      const response = await fetch("/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPerson),
      })

      if (!response.ok) {
        throw new Error("Failed to save person")
      }

      setPeople(prev => [...prev, newPerson])
      setShowAddPerson(false)
      toast({
        title: "Person added successfully",
        description: `${person.name} has been added to your social network.`,
      })
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
      const newPlace = {
        ...place,
        id: Date.now().toString(),
      }

      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlace),
      })

      if (!response.ok) {
        throw new Error("Failed to save place")
      }

      setPlaces(prev => [...prev, newPlace])
      setShowAddPlace(false)
      toast({
        title: "Place added successfully",
        description: `${place.name} has been added to your social network.`,
      })
    } catch (error) {
      console.error("Error saving place:", error)
      toast({
        title: "Error",
        description: "Failed to save place. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCircleLabel = (circle: number) => {
    const labels = {
      1: "Family",
      2: "Friends",
      3: "Acquaintances",
      4: "Paid Workers",
      5: "Unfamiliar Partners"
    }
    return labels[circle as keyof typeof labels] || "Unknown"
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Social Networks</h1>
        </div>

        <Tabs defaultValue="questionnaire" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="places">Places</TabsTrigger>
          </TabsList>
          <TabsContent value="questionnaire" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Network Questionnaire</CardTitle>
                <CardDescription>Answer questions to build a comprehensive social network map</CardDescription>
              </CardHeader>
              <CardContent>
                <SocialNetworkQuestionnaire />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="people" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      People in Network ({people.length})
                    </CardTitle>
                    <CardDescription>View and manage people in your social network</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddPerson(!showAddPerson)}
                    variant={showAddPerson ? "outline" : "default"}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {showAddPerson ? "Cancel" : "Add Person"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddPerson && (
                  <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-semibold mb-4">Add New Person</h3>
                    <PersonForm
                      onSave={handlePersonSave}
                      onCancel={() => setShowAddPerson(false)}
                    />
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-10">Loading...</div>
                ) : people.length === 0 && !showAddPerson ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No people added yet.</p>
                    <p className="text-sm">Complete the questionnaire or add people manually.</p>
                  </div>
                ) : people.length > 0 ? (
                  <div className="space-y-4">
                    {people.map((person) => (
                      <div
                        key={person.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{person.name}</h3>
                              {person.circle && (
                                <Badge variant="secondary">
                                  Circle {person.circle}: {getCircleLabel(person.circle)}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {person.role && <p><strong>Role:</strong> {person.role}</p>}
                              {person.communicationFrequency && (
                                <p><strong>Frequency:</strong> {person.communicationFrequency}</p>
                              )}
                              {person.communicationStyle && (
                                <p><strong>Style:</strong> {person.communicationStyle}</p>
                              )}
                              {person.commonTopics && person.commonTopics.length > 0 && (
                                <p><strong>Topics:</strong> {person.commonTopics.join(", ")}</p>
                              )}
                            </div>
                            {person.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Notes:</strong> {person.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePerson(person.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="places" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Places in Network ({places.length})
                    </CardTitle>
                    <CardDescription>View and manage places in your social network</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddPlace(!showAddPlace)}
                    variant={showAddPlace ? "outline" : "default"}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {showAddPlace ? "Cancel" : "Add Place"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddPlace && (
                  <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-semibold mb-4">Add New Place</h3>
                    <PlaceForm
                      onSave={handlePlaceSave}
                      onCancel={() => setShowAddPlace(false)}
                    />
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-10">Loading...</div>
                ) : places.length === 0 && !showAddPlace ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No places added yet.</p>
                    <p className="text-sm">Add places where communication happens.</p>
                  </div>
                ) : places.length > 0 ? (
                  <div className="space-y-4">
                    {places.map((place) => (
                      <div
                        key={place.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{place.name}</h3>
                              {place.type && (
                                <Badge variant="outline">
                                  {place.type.charAt(0).toUpperCase() + place.type.slice(1)}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {place.address && <p><strong>Address:</strong> {place.address}</p>}
                              {place.frequencyOfVisit && (
                                <p><strong>Visit Frequency:</strong> {place.frequencyOfVisit}</p>
                              )}
                              {place.latitude && place.longitude && (
                                <p><strong>GPS:</strong> {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                                  {place.locationAccuracy && ` (±${Math.round(place.locationAccuracy)}m)`}
                                </p>
                              )}
                              {place.accessibilityFeatures && place.accessibilityFeatures.length > 0 && (
                                <p><strong>Accessibility:</strong> {place.accessibilityFeatures.join(", ")}</p>
                              )}
                            </div>
                            {place.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Description:</strong> {place.description}
                              </p>
                            )}
                            {place.communicationNotes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Communication Notes:</strong> {place.communicationNotes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePlace(place.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
