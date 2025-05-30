import { NextResponse } from "next/server"
import { readJson, writeJson } from "@/lib/jsonStore"
import type { Place } from "@/lib/types"

const FILENAME = "places.json"

export async function GET() {
  try {
    const places = await readJson<Place[]>(FILENAME)
    return NextResponse.json(places || [])
  } catch (error) {
    console.error("Error reading places:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array if file doesn't exist
  }
}

export async function POST(request: Request) {
  try {
    const newPlace: Place = await request.json()
    const places = (await readJson<Place[]>(FILENAME)) || []
    places.push(newPlace)
    await writeJson(FILENAME, places)
    return NextResponse.json(newPlace, { status: 201 })
  } catch (error) {
    console.error("Error adding place:", error)
    return NextResponse.json({ error: "Failed to add place" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const places: Place[] = await request.json()
    await writeJson(FILENAME, places)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating places:", error)
    return NextResponse.json({ error: "Failed to update places" }, { status: 500 })
  }
}
