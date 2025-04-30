import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Eye } from "lucide-react"
import Link from "next/link"

export default function PassportsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Communication Passports</h1>
          <Button asChild>
            <Link href="/passports/create">
              <FileText className="mr-2 h-4 w-4" />
              Create New Passport
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sample Passport</CardTitle>
              <CardDescription>A demonstration of what a communication passport looks like</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-secondary rounded-md flex items-center justify-center">
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Communication Passport</h3>
                  <p className="text-sm text-muted-foreground mt-2">Sample passport preview</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Create Your First Passport</CardTitle>
              <CardDescription>Generate a personalized communication passport</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] border-2 border-dashed border-muted rounded-md flex items-center justify-center">
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Complete the social network questionnaire to generate a personalized communication passport.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/passports/create">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Passport
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
