import type { Person, Place, Topic } from "./types"

// All CRUD operations now use local JSON API endpoints for privacy-first, persistent storage.

const apiBase = "/api";

export async function addPerson(person: Omit<Person, "id">): Promise<Person> {
  const res = await fetch(`${apiBase}/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(person),
  });
  if (!res.ok) throw new Error("Failed to add person");
  return res.json();
}

export async function addPlace(place: Omit<Place, "id">): Promise<Place> {
  const res = await fetch(`${apiBase}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(place),
  });
  if (!res.ok) throw new Error("Failed to add place");
  return res.json();
}

export async function addTopic(topic: Omit<Topic, "id">): Promise<Topic> {
  const res = await fetch(`${apiBase}/topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(topic),
  });
  if (!res.ok) throw new Error("Failed to add topic");
  return res.json();
}

export async function getPeople(): Promise<Person[]> {
  const res = await fetch(`${apiBase}/people`);
  if (!res.ok) throw new Error("Failed to fetch people");
  return res.json();
}

export async function getPlaces(): Promise<Place[]> {
  const res = await fetch(`${apiBase}/places`);
  if (!res.ok) throw new Error("Failed to fetch places");
  return res.json();
}

export async function getTopics(): Promise<Topic[]> {
  const res = await fetch(`${apiBase}/topics`);
  if (!res.ok) throw new Error("Failed to fetch topics");
  return res.json();
}

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
