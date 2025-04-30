import type { Person, Place, Topic } from "./types"

// This would be replaced with actual database calls in a real application
let people: Person[] = []
let places: Place[] = []
let topics: Topic[] = []

export function addPerson(person: Omit<Person, "id">): Person {
  const newPerson = {
    ...person,
    id: generateId(),
  }
  people.push(newPerson)
  return newPerson
}

export function addPlace(place: Omit<Place, "id">): Place {
  const newPlace = {
    ...place,
    id: generateId(),
  }
  places.push(newPlace)
  return newPlace
}

export function addTopic(topic: Omit<Topic, "id">): Topic {
  const newTopic = {
    ...topic,
    id: generateId(),
  }
  topics.push(newTopic)
  return newTopic
}

export function getPeople(): Person[] {
  return [...people]
}

export function getPlaces(): Place[] {
  return [...places]
}

export function getTopics(): Topic[] {
  return [...topics]
}

export function getPerson(id: string): Person | undefined {
  return people.find((person) => person.id === id)
}

export function getPlace(id: string): Place | undefined {
  return places.find((place) => place.id === id)
}

export function getTopic(id: string): Topic | undefined {
  return topics.find((topic) => topic.id === id)
}

export function updatePerson(id: string, updates: Partial<Person>): Person | null {
  const index = people.findIndex((person) => person.id === id)
  if (index === -1) return null

  people[index] = { ...people[index], ...updates }
  return people[index]
}

export function updatePlace(id: string, updates: Partial<Place>): Place | null {
  const index = places.findIndex((place) => place.id === id)
  if (index === -1) return null

  places[index] = { ...places[index], ...updates }
  return places[index]
}

export function updateTopic(id: string, updates: Partial<Topic>): Topic | null {
  const index = topics.findIndex((topic) => topic.id === id)
  if (index === -1) return null

  topics[index] = { ...topics[index], ...updates }
  return topics[index]
}

export function deletePerson(id: string): boolean {
  const initialLength = people.length
  people = people.filter((person) => person.id !== id)
  return people.length < initialLength
}

export function deletePlace(id: string): boolean {
  const initialLength = places.length
  places = places.filter((place) => place.id !== id)
  return places.length < initialLength
}

export function deleteTopic(id: string): boolean {
  const initialLength = topics.length
  topics = topics.filter((topic) => topic.id !== id)
  return topics.length < initialLength
}

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
