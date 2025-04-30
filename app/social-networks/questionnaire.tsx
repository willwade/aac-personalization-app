"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, ArrowLeft, Save, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type QuestionType = {
  id: number
  question: string
  type: "text" | "textarea" | "radio" | "info"
  options?: string[]
  placeholder?: string
  isAdaptive?: boolean
}

const initialQuestions: QuestionType[] = [
  {
    id: 1,
    question: "Let's start building a social network map. This will help personalize AAC experiences.",
    type: "info",
  },
  {
    id: 2,
    question: "Who are the primary caregivers or family members that interact with the AAC user daily?",
    type: "textarea",
    placeholder: "List names and relationships (e.g., Jane - mother, John - father)",
  },
  {
    id: 3,
    question: "What professionals regularly interact with the AAC user? (teachers, therapists, etc.)",
    type: "textarea",
    placeholder: "List names and roles (e.g., Ms. Smith - teacher, Dr. Jones - speech therapist)",
  },
  {
    id: 4,
    question: "What are the main locations where the AAC user communicates?",
    type: "textarea",
    placeholder: "List places (e.g., home, school, therapy center)",
  },
  {
    id: 5,
    question: "How would you describe the AAC user's comfort level with new communication partners?",
    type: "radio",
    options: ["Very comfortable", "Somewhat comfortable", "Neutral", "Somewhat uncomfortable", "Very uncomfortable"],
  },
  {
    id: 6,
    question: "What topics or activities does the AAC user enjoy discussing or participating in?",
    type: "textarea",
    placeholder: "List topics and activities (e.g., dinosaurs, swimming, music)",
  },
]

export default function SocialNetworkQuestionnaire() {
  const [questions, setQuestions] = useState<QuestionType[]>(initialQuestions)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [suggestedAnswers, setSuggestedAnswers] = useState<string[]>([])
  const { toast } = useToast()
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  const handleAnswerChange = useCallback(
    (value: string) => {
      setAnswers({
        ...answers,
        [questions[currentQuestion].id]: value,
      })
    },
    [answers, currentQuestion, questions],
  )

  useEffect(() => {
    if (selectedSuggestion) {
      handleAnswerChange(selectedSuggestion)
      toast({
        title: "Suggestion applied",
        description: "You can edit this answer further if needed.",
      })
      setSelectedSuggestion(null) // Reset after applying
    }
  }, [selectedSuggestion, toast, handleAnswerChange])

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // We're at the last question, generate a follow-up if it's not an info type
      if (questions[currentQuestion].type !== "info") {
        await generateAdaptiveQuestion()
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log("Saving answers:", answers)
    toast({
      title: "Questionnaire saved",
      description: "Your social network information has been saved successfully.",
    })
  }

  const generateAdaptiveQuestion = async () => {
    try {
      setIsGeneratingQuestion(true)

      // Get previous questions and answers to provide context
      const previousQuestions = questions.slice(0, currentQuestion + 1).map((q) => q.question)
      const previousAnswers = previousQuestions.map((_, index) => answers[questions[index].id] || "")

      const currentQuestionText = questions[currentQuestion].question

      const response = await fetch("/api/adaptive-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previousQuestions,
          previousAnswers,
          currentQuestion: currentQuestionText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate adaptive question")
      }

      const data = await response.json()

      // Add the new adaptive question
      const newQuestion: QuestionType = {
        id: questions.length + 1,
        question: data.followUpQuestion,
        type: "textarea",
        placeholder: "Your answer here...",
        isAdaptive: true,
      }

      setQuestions([...questions, newQuestion])
      setSuggestedAnswers(data.suggestedAnswers || [])
      setCurrentQuestion(questions.length) // Move to the new question

      toast({
        title: "Follow-up question generated",
        description: "The AI has created a personalized follow-up question based on your previous answers.",
      })
    } catch (error) {
      console.error("Error generating adaptive question:", error)
      toast({
        title: "Error",
        description: "Failed to generate a follow-up question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  const useSuggestedAnswer = (answer: string) => {
    setSelectedSuggestion(answer)
  }

  const renderQuestionInput = () => {
    const question = questions[currentQuestion]

    switch (question.type) {
      case "text":
        return (
          <Input
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={question.placeholder}
          />
        )
      case "textarea":
        return (
          <div className="space-y-4">
            <Textarea
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={question.placeholder}
              rows={4}
            />

            {question.isAdaptive && suggestedAnswers.length > 0 && (
              <div className="space-y-2">
                <Label>Suggested answers:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedAnswers.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => useSuggestedAnswer(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case "radio":
        return (
          <RadioGroup value={answers[question.id] || ""} onValueChange={handleAnswerChange}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "info":
        return (
          <p className="text-muted-foreground">
            This questionnaire will guide you through creating a social network map for the AAC user. The information
            collected will help personalize communication experiences.
          </p>
        )
      default:
        return null
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-primary">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-secondary">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
          ></div>
        </div>
      </div>

      <Card className="p-6">
        {questions[currentQuestion].isAdaptive && (
          <Badge className="mb-2" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-generated follow-up
          </Badge>
        )}

        <h3 className="text-lg font-medium mb-4">{questions[currentQuestion].question}</h3>

        {isGeneratingQuestion ? (
          <div className="space-y-3">
            <Skeleton className="h-[20px] w-full" />
            <Skeleton className="h-[20px] w-[80%]" />
            <Skeleton className="h-[20px] w-[60%]" />
            <p className="text-sm text-muted-foreground mt-2">Generating personalized follow-up question...</p>
          </div>
        ) : (
          renderQuestionInput()
        )}
      </Card>

      <div className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={generateAdaptiveQuestion}
              disabled={isGeneratingQuestion || questions[currentQuestion].type === "info"}
            >
              {isGeneratingQuestion ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Follow-up
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
