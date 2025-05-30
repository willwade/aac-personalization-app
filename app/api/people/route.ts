import { NextResponse } from "next/server"
import { readJson, writeJson } from "@/lib/jsonStore"
import type { Person } from "@/lib/types"

const FILENAME = "people.json"

export async function GET() {
  try {
    const people = await readJson<Person[]>(FILENAME)
    return NextResponse.json(people || [])
  } catch (error) {
    console.error("Error reading people:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array if file doesn't exist
  }
}

export async function POST(request: Request) {
  try {
    const newPerson: Person = await request.json()
    const people = (await readJson<Person[]>(FILENAME)) || []
    people.push(newPerson)
    await writeJson(FILENAME, people)
    return NextResponse.json(newPerson, { status: 201 })
  } catch (error) {
    console.error("Error adding person:", error)
    return NextResponse.json({ error: "Failed to add person" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const people: Person[] = await request.json()
    await writeJson(FILENAME, people)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating people:", error)
    return NextResponse.json({ error: "Failed to update people" }, { status: 500 })
  }
}
