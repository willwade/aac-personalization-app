import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, PieChart, FileText, MessageSquare, Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">AAC Context-Aware Personalization</h1>
          <p className="text-xl text-muted-foreground">
            Create personalized AAC experiences based on social context and communication patterns
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Social Networks Agent</CardTitle>
              <CardDescription>
                Collect and organize information about communication partners and contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Build a structured representation of the user&apos;s social network through guided questionnaires.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/social-networks">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <PieChart className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Visualizations</CardTitle>
              <CardDescription>Generate interactive &quot;Circles of Communication&quot; visualizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Create visual representations of communication networks to better understand patterns and relationships.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/visualizations">
                  View Visualizations <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Communication Insights</CardTitle>
              <CardDescription>AI-powered analysis of communication patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analyze questionnaire responses to identify patterns and receive personalized recommendations.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/insights">
                  View Insights <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Communication Passports</CardTitle>
              <CardDescription>Generate personalized communication passports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Create shareable documents that help new communication partners understand preferences and contexts. Share your passport with others by clicking &quot;Share&quot; or download a PDF copy.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/passports">
                  Create Passport <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Conversation Logging</CardTitle>
              <CardDescription>Log and analyze communication interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Record conversations and interactions to improve personalization and track communication patterns.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/conversation-log">
                  Log Conversation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
