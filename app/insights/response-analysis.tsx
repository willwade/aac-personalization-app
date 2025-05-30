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
  personalProfile: {
    name: string
    interests: string[]
    preferences: string[]
  }
  knowledgeGraph: {
    entities: Array<{
      type: string
      name: string
      relationship: string
      context: string
    }>
    relationships: Array<{
      from: string
      to: string
      type: string
      frequency?: string
    }>
  }
  communicationContext: {
    primaryEnvironments: string[]
    communicationMethods: string[]
    socialCircles: string[]
  }
  knowledgeGaps: string[]
  passportContent: {
    greeting: string
    aboutMe: string
    communicationTips: string
  }
}

const initialAnalysisState: AnalysisResult = {
  personalProfile: {
    name: "",
    interests: [],
    preferences: [],
  },
  knowledgeGraph: {
    entities: [],
    relationships: [],
  },
  communicationContext: {
    primaryEnvironments: [],
    communicationMethods: [],
    socialCircles: [],
  },
  knowledgeGaps: [],
  passportContent: {
    greeting: "",
    aboutMe: "",
    communicationTips: "",
  },
}

export default function ResponseAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysisState)
  const { toast } = useToast()

  const analyzeResponses = async () => {
    setIsAnalyzing(true)

    try {
      // Get actual questionnaire responses from IndexedDB
      const { loadData } = await import("@/lib/clientDb");
      const actualResponses = await loadData<Record<number, string>>("aac-answers");
      const actualPartners = await loadData<Person[]>("aac-partners");

      // Use actual data if available, otherwise fall back to sample data
      const responses = actualResponses && Object.keys(actualResponses).length > 0
        ? actualResponses
        : sampleResponses;

      // Include partner data in the analysis
      const requestData = {
        responses,
        partners: actualPartners || []
      };

      const response = await fetch("/api/analyze-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
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

  const renderPersonalProfile = () => {
    const { name, interests, preferences } = analysis.personalProfile

    if (!name && interests.length === 0 && preferences.length === 0) {
      return <p className="text-muted-foreground">No personal profile information available.</p>
    }

    return (
      <div className="space-y-4">
        {name && (
          <div>
            <h4 className="font-medium mb-2">Name</h4>
            <Badge variant="outline" className="text-lg px-3 py-1">{name}</Badge>
          </div>
        )}

        {interests.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {preferences.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Communication Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.map((preference, index) => (
                <Badge key={index} variant="outline" className="bg-green-50">
                  {preference}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderKnowledgeGraph = () => {
    const { entities, relationships } = analysis.knowledgeGraph

    if (entities.length === 0 && relationships.length === 0) {
      return <p className="text-muted-foreground">No knowledge graph data available.</p>
    }

    return (
      <div className="space-y-4">
        {entities.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Entities</h4>
            <div className="space-y-2">
              {entities.map((entity, index) => (
                <div key={index} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{entity.type}</Badge>
                    <span className="font-medium">{entity.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Relationship:</span> {entity.relationship}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Context:</span> {entity.context}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {relationships.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Relationships</h4>
            <div className="space-y-2">
              {relationships.map((rel, index) => (
                <div key={index} className="border rounded p-3 bg-blue-50">
                  <div className="text-sm">
                    <span className="font-medium">{rel.from}</span>
                    <span className="mx-2 text-gray-500">→</span>
                    <span className="font-medium">{rel.to}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Type:</span> {rel.type}
                    {rel.frequency && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">Frequency:</span> {rel.frequency}
                      </>
                    )}
                  </div>
                </div>
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
              <CardTitle>Knowledge Graph Analysis</CardTitle>
              <CardDescription>AI-powered knowledge graph building for AAC personalization</CardDescription>
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
              <AccordionItem value="profile">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>Personal Profile</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderPersonalProfile()}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="knowledge-graph">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    <span>Knowledge Graph</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderKnowledgeGraph()}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="context">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>Communication Context</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Primary Environments</h4>
                      {renderBadgeList(analysis.communicationContext.primaryEnvironments, "No environments identified.")}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Communication Methods</h4>
                      {renderBadgeList(analysis.communicationContext.communicationMethods, "No methods identified.")}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Social Circles</h4>
                      {renderBadgeList(analysis.communicationContext.socialCircles, "No social circles identified.")}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gaps">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    <span>Knowledge Gaps</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderListItems(analysis.knowledgeGaps, "No knowledge gaps identified.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="passport">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    <span>Communication Passport</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {analysis.passportContent.greeting && (
                      <div>
                        <h4 className="font-medium mb-2">Greeting</h4>
                        <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                          {analysis.passportContent.greeting}
                        </p>
                      </div>
                    )}
                    {analysis.passportContent.aboutMe && (
                      <div>
                        <h4 className="font-medium mb-2">About Me</h4>
                        <p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-200">
                          {analysis.passportContent.aboutMe}
                        </p>
                      </div>
                    )}
                    {analysis.passportContent.communicationTips && (
                      <div>
                        <h4 className="font-medium mb-2">Communication Tips</h4>
                        <p className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-200">
                          {analysis.passportContent.communicationTips}
                        </p>
                      </div>
                    )}
                    {!analysis.passportContent.greeting && !analysis.passportContent.aboutMe && !analysis.passportContent.communicationTips && (
                      <p className="text-muted-foreground">No passport content available.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>
            This knowledge graph analysis builds personal context from questionnaire responses to enable better AAC personalization and identify areas where more information would be helpful.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
