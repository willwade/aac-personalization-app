import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, MessageSquare } from "lucide-react"
import ConversationLogger from "./conversation-logger"

export default function ConversationLogPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Conversation Log</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <Tabs defaultValue="logger" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logger">Log Conversation</TabsTrigger>
            <TabsTrigger value="history">Conversation History</TabsTrigger>
            <TabsTrigger value="insights">Communication Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="logger" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Logger</CardTitle>
                <CardDescription>Record and annotate conversations with communication partners</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationLogger />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>View past conversations and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>No conversation history yet. Start logging conversations to see them here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insights" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Insights</CardTitle>
                <CardDescription>Analyze communication patterns and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <p>Communication insights will be generated after logging multiple conversations.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
