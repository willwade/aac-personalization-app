"use client"

import { useEffect, useRef } from "react"

// Sample data - in a real app, this would come from the database
const sampleData = {
  innerCircle: [
    { name: "Mom", role: "Parent" },
    { name: "Dad", role: "Parent" },
    { name: "Sarah", role: "Sibling" },
  ],
  middleCircle: [
    { name: "Ms. Johnson", role: "Teacher" },
    { name: "Dr. Smith", role: "Therapist" },
    { name: "Grandma", role: "Family" },
    { name: "Grandpa", role: "Family" },
  ],
  outerCircle: [
    { name: "Coach Tim", role: "Coach" },
    { name: "Aunt Lisa", role: "Family" },
    { name: "Uncle Bob", role: "Family" },
    { name: "Neighbor Joe", role: "Neighbor" },
    { name: "Classmate Emma", role: "Peer" },
  ],
}

export default function CommunicationCircles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const container = canvas.parentElement
      if (!container) return

      const { width } = container.getBoundingClientRect()
      const height = Math.min(500, width)

      // Set actual size in memory (scaled to account for extra pixel density)
      const scale = window.devicePixelRatio
      canvas.width = width * scale
      canvas.height = height * scale

      // Normalize coordinate system to use CSS pixels
      ctx.scale(scale, scale)

      // Set the CSS size
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      return { width, height }
    }

    const dimensions = setCanvasDimensions()
    if (!dimensions) return

    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw circles
    const outerRadius = Math.min(width, height) * 0.45
    const middleRadius = outerRadius * 0.7
    const innerRadius = outerRadius * 0.4

    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)" // Light blue
    ctx.fill()
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw middle circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, middleRadius, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)" // Medium blue
    ctx.fill()
    ctx.strokeStyle = "rgba(59, 130, 246, 0.6)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)" // Darker blue
    ctx.fill()
    ctx.strokeStyle = "rgba(59, 130, 246, 0.7)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw center point (AAC user)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(59, 130, 246, 1)"
    ctx.fill()
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.stroke()

    // Label for center
    ctx.font = "14px sans-serif"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("AAC", centerX, centerY)

    // Draw people in inner circle
    const placePersonInCircle = (
      person: { name: string; role: string },
      index: number,
      total: number,
      radius: number,
      color: string,
    ) => {
      const angle = (index / total) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Draw person dot
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "white"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw name
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "black"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Position text based on angle to avoid overlapping with circles
      const textX = centerX + Math.cos(angle) * (radius + 20)
      const textY = centerY + Math.sin(angle) * (radius + 20)

      ctx.fillText(person.name, textX, textY)
    }

    // Place people in circles
    sampleData.innerCircle.forEach((person, i) => {
      placePersonInCircle(
        person,
        i,
        sampleData.innerCircle.length,
        innerRadius * 0.7,
        "rgba(59, 130, 246, 0.9  i, sampleData.innerCircle.length, innerRadius * 0.7, 'rgba(59, 130, 246, 0.9)",
      )
    })

    sampleData.middleCircle.forEach((person, i) => {
      placePersonInCircle(person, i, sampleData.middleCircle.length, middleRadius * 0.85, "rgba(59, 130, 246, 0.7)")
    })

    sampleData.outerCircle.forEach((person, i) => {
      placePersonInCircle(person, i, sampleData.outerCircle.length, outerRadius * 0.85, "rgba(59, 130, 246, 0.5)")
    })

    // Add labels for circles
    ctx.font = "bold 14px sans-serif"
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.textAlign = "center"

    ctx.fillText("Daily Communication", centerX, centerY - innerRadius - 10)
    ctx.fillText("Weekly Communication", centerX, centerY - middleRadius - 10)
    ctx.fillText("Occasional Communication", centerX, centerY - outerRadius - 10)

    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ maxHeight: "500px" }} />
    </div>
  )
}
