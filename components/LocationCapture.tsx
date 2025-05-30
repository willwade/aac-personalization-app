"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
}

interface LocationCaptureProps {
  onLocationCapture: (location: LocationData) => void
  disabled?: boolean
  buttonText?: string
  showAccuracy?: boolean
}

export default function LocationCapture({ 
  onLocationCapture, 
  disabled = false, 
  buttonText = "Get Current Location",
  showAccuracy = true 
}: LocationCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [lastLocation, setLastLocation] = useState<LocationData | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if geolocation is supported
    setIsSupported('geolocation' in navigator)
  }, [])

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      })
      return
    }

    setIsCapturing(true)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        }

        // Try to get address from coordinates (reverse geocoding)
        try {
          const address = await reverseGeocode(locationData.latitude, locationData.longitude)
          locationData.address = address
        } catch (error) {
          console.log("Reverse geocoding failed:", error)
          // Continue without address
        }

        setLastLocation(locationData)
        onLocationCapture(locationData)
        setIsCapturing(false)

        toast({
          title: "Location captured",
          description: `Accuracy: ±${Math.round(locationData.accuracy)}m${locationData.address ? ` • ${locationData.address}` : ''}`,
        })
      },
      (error) => {
        setIsCapturing(false)
        let message = "Failed to get location"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }

        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        })
      },
      options
    )
  }

  // Simple reverse geocoding using a free service
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AAC-Personalization-App'
          }
        }
      )
      
      if (!response.ok) throw new Error('Geocoding failed')
      
      const data = await response.json()
      
      // Build a readable address
      const address = data.address
      const parts = []
      
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`)
      } else if (address.road) {
        parts.push(address.road)
      }
      
      if (address.suburb || address.neighbourhood) {
        parts.push(address.suburb || address.neighbourhood)
      }
      
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village)
      }
      
      return parts.join(', ') || data.display_name
    } catch (error) {
      throw new Error('Reverse geocoding failed')
    }
  }

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 10) return "Very High"
    if (accuracy < 50) return "High"
    if (accuracy < 100) return "Medium"
    return "Low"
  }

  if (!isSupported) {
    return null // Don't show if not supported
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={captureLocation}
        disabled={disabled || isCapturing}
        className="w-full"
      >
        {isCapturing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting location...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      {lastLocation && showAccuracy && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>
              {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>
              Accuracy: ±{Math.round(lastLocation.accuracy)}m ({formatAccuracy(lastLocation.accuracy)})
            </span>
          </div>
          {lastLocation.address && (
            <div className="text-xs">
              📍 {lastLocation.address}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Utility function to calculate distance between two GPS points
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

// Utility function to check if current location matches a saved place
export const isAtLocation = (
  currentLat: number,
  currentLng: number,
  placeLat: number,
  placeLng: number,
  marginMeters: number = 100
): boolean => {
  const distance = calculateDistance(currentLat, currentLng, placeLat, placeLng)
  return distance <= marginMeters
}
