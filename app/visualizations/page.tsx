import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import CommunicationCircles from "./communication-circles"

export default function VisualizationsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Visualizations</h1>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Visualization Preview</AlertTitle>
          <AlertDescription>
            Complete the social network questionnaire to generate more detailed visualizations.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="circles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="circles">Circles of Communication</TabsTrigger>
            <TabsTrigger value="network">Network Graph</TabsTrigger>
          </TabsList>
          <TabsContent value="circles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Circles of Communication</CardTitle>
                <CardDescription>Visualize communication partners by frequency and closeness</CardDescription>
              </CardHeader>
              <CardContent>
                <CommunicationCircles />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="network" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Graph</CardTitle>
                <CardDescription>
                  Interactive graph showing relationships between people, places, and topics
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Network graph visualization will appear here after completing the questionnaire.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
