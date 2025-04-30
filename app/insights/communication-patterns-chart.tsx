"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "@/components/ui/chart"

// Sample data - in a real app, this would come from the analysis results
const sampleData = {
  communicationPartners: {
    family: 3,
    professionals: 3,
    peers: 1,
  },
  communicationContexts: {
    home: 40,
    school: 30,
    therapy: 20,
    other: 10,
  },
  topicFrequency: [
    { topic: "Dinosaurs", frequency: 8 },
    { topic: "Trains", frequency: 6 },
    { topic: "Swimming", frequency: 5 },
    { topic: "Movies", frequency: 4 },
    { topic: "Music", frequency: 3 },
  ],
}

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]

export default function CommunicationPatternsChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Patterns</CardTitle>
        <CardDescription>Visual analysis of communication patterns based on questionnaire responses</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="partners">Communication Partners</TabsTrigger>
            <TabsTrigger value="contexts">Communication Contexts</TabsTrigger>
            <TabsTrigger value="topics">Topics of Interest</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Family", value: sampleData.communicationPartners.family },
                      { name: "Professionals", value: sampleData.communicationPartners.professionals },
                      { name: "Peers", value: sampleData.communicationPartners.peers },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: "Family", value: sampleData.communicationPartners.family },
                      { name: "Professionals", value: sampleData.communicationPartners.professionals },
                      { name: "Peers", value: sampleData.communicationPartners.peers },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="contexts" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Home", value: sampleData.communicationContexts.home },
                      { name: "School", value: sampleData.communicationContexts.school },
                      { name: "Therapy", value: sampleData.communicationContexts.therapy },
                      { name: "Other", value: sampleData.communicationContexts.other },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: "Home", value: sampleData.communicationContexts.home },
                      { name: "School", value: sampleData.communicationContexts.school },
                      { name: "Therapy", value: sampleData.communicationContexts.therapy },
                      { name: "Other", value: sampleData.communicationContexts.other },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sampleData.topicFrequency}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
