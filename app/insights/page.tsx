import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import ResponseAnalysis from "./response-analysis"

export default function InsightsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Communication Insights</h1>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>AI-Powered Analysis</AlertTitle>
          <AlertDescription>
            Our AI analyzes questionnaire responses to identify patterns and provide personalized recommendations.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Response Analysis</TabsTrigger>
            <TabsTrigger value="patterns">Communication Patterns</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="analysis" className="mt-6">
            <ResponseAnalysis />
          </TabsContent>
          <TabsContent value="patterns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Patterns</CardTitle>
                <CardDescription>
                  Visualizations of communication patterns identified from questionnaire responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <p>Complete the questionnaire to see communication pattern visualizations.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>AI-generated recommendations for personalizing the AAC experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <p>Complete the questionnaire to receive personalized recommendations.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
