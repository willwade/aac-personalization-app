import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import SocialNetworkQuestionnaire from "./questionnaire"

export default function SocialNetworksPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Social Networks</h1>
          <Button asChild>
            <Link href="/social-networks/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Person
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="questionnaire" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="places">Places</TabsTrigger>
          </TabsList>
          <TabsContent value="questionnaire" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Network Questionnaire</CardTitle>
                <CardDescription>Answer questions to build a comprehensive social network map</CardDescription>
              </CardHeader>
              <CardContent>
                <SocialNetworkQuestionnaire />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="people" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>People in Network</CardTitle>
                <CardDescription>View and manage people in the social network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <p>No people added yet. Complete the questionnaire or add people manually.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="places" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Places in Network</CardTitle>
                <CardDescription>View and manage places in the social network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <p>No places added yet. Complete the questionnaire or add places manually.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
