"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, MapPin, Lightbulb, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample data for demonstration - in a real app, this would come from the database
const sampleResponses = {
  "2": "Jane (mother), John (father), Sarah (sister, 14 years old)",
  "3": "Ms. Smith (speech therapist, weekly), Dr. Johnson (occupational therapist, bi-weekly), Mr. Williams (special education teacher, daily)",
  "4": "Home, school (special education classroom), therapy center, grandmother's house on weekends",
  "5": "Somewhat uncomfortable",
  "6": "Dinosaurs (especially T-Rex), trains, swimming, watching animated movies (Pixar), listening to music",
  "7": "Uses picture cards effectively, responds well to simple direct questions, needs extra time to process verbal instructions, prefers routine and predictability in communication",
}

type AnalysisResult = {
  communicationPartners: {
    family: string[]
    professionals: string[]
    peers: string[]
  }
  communicationContexts: string[]
  topicsOfInterest: string[]
  communicationPatterns: string[]
  strengths: string[]
  challenges: string[]
  recommendations: string[]
}

const initialAnalysisState: AnalysisResult = {
  communicationPartners: {
    family: [],
    professionals: [],
    peers: [],
  },
  communicationContexts: [],
  topicsOfInterest: [],
  communicationPatterns: [],
  strengths: [],
  challenges: [],
  recommendations: [],
}

export default function ResponseAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysisState)
  const { toast } = useToast()

  const analyzeResponses = async () => {
    setIsAnalyzing(true)

    try {
      // In a real app, you would get the actual responses from your database
      const responses = sampleResponses

      const response = await fetch("/api/analyze-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze responses")
      }

      const analysisData = await response.json()
      setAnalysis(analysisData)
      setHasAnalyzed(true)

      toast({
        title: "Analysis complete",
        description: "Your questionnaire responses have been analyzed successfully.",
      })
    } catch (error) {
      console.error("Error analyzing responses:", error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your responses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // For demo purposes, auto-analyze after component mounts
  useEffect(() => {
    // In a real app, you might want to check if there are enough responses first
    if (!hasAnalyzed && Object.keys(sampleResponses).length > 0) {
      analyzeResponses()
    }
  }, [hasAnalyzed])

  const renderPartnerSection = () => {
    const { family, professionals, peers } = analysis.communicationPartners
    const hasPartners = family.length > 0 || professionals.length > 0 || peers.length > 0

    if (!hasPartners) {
      return <p className="text-muted-foreground">No communication partners identified.</p>
    }

    return (
      <div className="space-y-4">
        {family.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Family</h4>
            <div className="flex flex-wrap gap-2">
              {family.map((member, index) => (
                <Badge key={index} variant="outline">
                  {member}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {professionals.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Professionals</h4>
            <div className="flex flex-wrap gap-2">
              {professionals.map((professional, index) => (
                <Badge key={index} variant="outline">
                  {professional}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {peers.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Peers</h4>
            <div className="flex flex-wrap gap-2">
              {peers.map((peer, index) => (
                <Badge key={index} variant="outline">
                  {peer}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBadgeList = (items: string[], emptyMessage: string) => {
    if (items.length === 0) {
      return <p className="text-muted-foreground">{emptyMessage}</p>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    )
  }

  const renderListItems = (items: string[], emptyMessage: string) => {
    if (items.length === 0) {
      return <p className="text-muted-foreground">{emptyMessage}</p>
    }

    return (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Response Analysis</CardTitle>
              <CardDescription>AI-powered analysis of questionnaire responses</CardDescription>
            </div>
            <Button onClick={analyzeResponses} disabled={isAnalyzing} variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Refresh Analysis"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="partners">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>Communication Partners</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderPartnerSection()}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="contexts">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>Communication Contexts</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderBadgeList(analysis.communicationContexts, "No communication contexts identified.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="topics">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    <span>Topics of Interest</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderBadgeList(analysis.topicsOfInterest, "No topics of interest identified.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="patterns">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    <span>Communication Patterns</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderListItems(analysis.communicationPatterns, "No communication patterns identified.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="strengths">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    <span>Communication Strengths</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderListItems(analysis.strengths, "No communication strengths identified.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="challenges">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    <span>Communication Challenges</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderListItems(analysis.challenges, "No communication challenges identified.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="recommendations">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    <span>Recommendations</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderListItems(analysis.recommendations, "No recommendations available.")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>
            This analysis is based on the questionnaire responses and is intended to help personalize the AAC
            experience.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
