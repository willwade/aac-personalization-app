"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Sparkles, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { saveData, loadData } from "@/lib/clientDb"
import VoiceInput from "@/components/VoiceInput"

type QuestionType = {
  id: number
  question: string
  type: "text" | "textarea" | "radio" | "info" | "select"
  options?: string[]
  placeholder?: string
  isAdaptive?: boolean
}
const initialQuestions: QuestionType[] = [
  // Passport: Personal Details
  {
    id: 1,
    question: "What is the AAC user's full name?",
    type: "text",
    placeholder: "e.g., John Smith",
  },
  {
    id: 2,
    question: "Does the AAC user have a preferred nickname?",
    type: "text",
    placeholder: "e.g., Johnny or leave blank",
  },
  {
    id: 3,
    question: "Write a short greeting or introduction for the passport.",
    type: "textarea",
    placeholder: "e.g., Hi! I'm Johnny. I love chatting about football, movies, and family.",
  },
  // Partner questions (as before)
  {
    id: 4,
    question: "Who are the primary caregivers or family members that interact with the AAC user daily?",
    type: "textarea",
    placeholder: "List names and relationships (e.g., Jane - mother, John - father)",
  },
  {
    id: 5,
    question: "For each person listed above, what is their relationship to the AAC user? (e.g., mother, brother)",
    type: "text",
    placeholder: "e.g., Jane - mother, John - father",
  },
  {
    id: 6,
    question: "For each person, which communication circle do they belong to?",
    type: "select",
    options: [
      "1 - Family",
      "2 - Friends",
      "3 - Acquaintances",
      "4 - Paid Workers",
      "5 - Unfamiliar Partners"
    ],
    placeholder: "Select circle for each person",
  },
  {
    id: 7,
    question: "How often does the AAC user communicate with each person?",
    type: "select",
    options: ["Daily", "Weekly", "Monthly", "Rarely"],
    placeholder: "Select frequency for each person",
  },
  {
    id: 8,
    question: "What is the usual communication style with each person?",
    type: "text",
    placeholder: "e.g., Informal, affectionate, professional",
  },
  {
    id: 9,
    question: "What are common topics discussed with each person? (comma separated)",
    type: "text",
    placeholder: "e.g., Family, Sports, Work",
  },
  {
    id: 10,
    question: "Any additional notes about communication with each person?",
    type: "textarea",
    placeholder: "Optional notes",
  },
  // Passport: Communication Preferences
  {
    id: 11,
    question: "What are the AAC user's preferred modes of communication?",
    type: "textarea",
    placeholder: "e.g., AAC device, gestures, yes/no responses",
  },
  {
    id: 12,
    question: "Describe the user's preferred communication speed and style.",
    type: "textarea",
    placeholder: "e.g., I prefer slow, clear questions. Short sentences work best.",
  },
  {
    id: 13,
    question: "Are there any specific communication needs or barriers?",
    type: "textarea",
    placeholder: "e.g., Needs extra time to respond, difficulty with background noise, etc.",
  },
  // Passport: Tips for Partners
  {
    id: 14,
    question: "List any tips for new communication partners (bullet points).",
    type: "textarea",
    placeholder: "e.g., Please speak slowly. Ask yes/no questions when possible.",
  },
  // Passport: Medical/Accessibility Info
  {
    id: 15,
    question: "Any critical medical or accessibility information? (optional)",
    type: "textarea",
    placeholder: "e.g., Requires eye-gaze technology, tires easily, etc.",
  },
  // Passport: Likes/Dislikes
  {
    id: 16,
    question: "List any likes/dislikes, hobbies, or interests useful for conversation starters.",
    type: "textarea",
    placeholder: "e.g., Likes: football, gardening. Dislikes: loud noises.",
  },
];

import { Person } from "@/lib/types";
import PersonForm from "@/components/PersonForm";

export default function SocialNetworkQuestionnaire() {
  const [questions, setQuestions] = useState<QuestionType[]>(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [partners, setPartners] = useState<Person[]>([]);

  // Load saved answers and partners on mount
  useEffect(() => {
    (async () => {
      const savedAnswers = await loadData<Record<number, string>>("aac-answers");
      if (savedAnswers) setAnswers(savedAnswers);
      const savedPartners = await loadData<Person[]>("aac-partners");
      if (savedPartners) setPartners(savedPartners);
    })();
  }, []);

  // Load available people from the people database
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const response = await fetch("/api/people");
        if (response.ok) {
          const people = await response.json();
          setAvailablePeople(people);
        }
      } catch (error) {
        console.error("Error loading people:", error);
      }
    };
    loadPeople();
  }, []);

  // Auto-save answers when they change
  useEffect(() => {
    saveData("aac-answers", answers);
  }, [answers]);
  // Auto-save partners when they change
  useEffect(() => {
    saveData("aac-partners", partners);
  }, [partners]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [suggestedAnswers, setSuggestedAnswers] = useState<string[]>([]);
  const [showPersonSelection, setShowPersonSelection] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const { toast } = useToast();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Handler for selecting an existing person
  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    setShowPersonSelection(false);
    // Start adaptive questions for this person
    startAdaptiveQuestionsForPerson(person);
  };

  // Handler for creating a new person
  const handlePersonSave = async (personData: Omit<Person, "id">) => {
    try {
      const newPerson = {
        ...personData,
        id: Date.now().toString(),
      };

      const response = await fetch("/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPerson),
      });

      if (!response.ok) {
        throw new Error("Failed to save person");
      }

      // Add to available people and select
      setAvailablePeople(prev => [...prev, newPerson]);
      setSelectedPerson(newPerson);
      setShowPersonForm(false);

      toast({
        title: "Person added successfully",
        description: `${personData.name} has been added to your network.`,
      });

      // Start adaptive questions for this person
      startAdaptiveQuestionsForPerson(newPerson);
    } catch (error) {
      console.error("Error saving person:", error);
      toast({
        title: "Error",
        description: "Failed to save person. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Start adaptive questions for a specific person
  const startAdaptiveQuestionsForPerson = (person: Person) => {
    // Reset to start of questionnaire but with person context
    setCurrentQuestion(0);
    setIsReviewing(false);
    // Clear previous answers to start fresh for this person
    setAnswers({});

    toast({
      title: "Starting adaptive questions",
      description: `Now generating personalized questions for ${person.name}.`,
    });
  };

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

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
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
          selectedPerson: selectedPerson, // Include person context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate adaptive question")
      }
    const data = await response.json()

      // Check if questionnaire is complete
      if (data.isComplete) {
        toast({
          title: "Questionnaire Complete!",
          description: "You've provided enough information for personalized vocabulary recommendations.",
        });
        return;
      }

      // Add the new adaptive question
      const newQuestion: QuestionType = {
        id: questions.length + 1,
        question: `[ADAPTIVE] ${data.followUpQuestion}`,
        type: "textarea",
        placeholder: "Your answer here...",
        isAdaptive: true,
      }
    setQuestions(prevQuestions => {
      const updated = [...prevQuestions, newQuestion];
      setCurrentQuestion(updated.length - 1);
      return updated;
    });
    setSuggestedAnswers(data.suggestedAnswers || []);

    toast({
      title: "Follow-up question generated",
      description: "The AI has created a personalized follow-up question based on your previous answers.",
    });
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
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={question.placeholder}
                  rows={4}
                />
              </div>
              <VoiceInput
                onTranscript={(text) => {
                  const currentValue = answers[question.id] || "";
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleAnswerChange(newValue);
                }}
                disabled={isGeneratingQuestion}
              />
            </div>

            {question.isAdaptive && suggestedAnswers.length > 0 && (
              <div className="space-y-2">
                <Label>Suggested answers:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedAnswers.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => setSelectedSuggestion(suggestion)}
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

if (isReviewing) {
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
      </Card>
    </div>
  );
}

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

      <div className="flex gap-2 items-center">
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

        {/* Adaptive question counter */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {questions.filter(q => q.isAdaptive).length >= 8 ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Adaptive questions complete!
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span>
                {questions.filter(q => q.isAdaptive).length}/8 adaptive questions
              </span>
            </>
          )}
        </div>
      </div>
    </div>

    <ul className="space-y-2">
      {partners.map((p, idx) => (
        <li key={p.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <strong>{p.name}</strong> ({p.role || "-"}) — Circle {p.circle || "-"}, {p.communicationFrequency || "-"}
          <br />Style: {p.communicationStyle || "-"}
          <br />Topics: {p.commonTopics?.join(", ") || "-"}
          <br />Notes: {p.notes || "-"}
        </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => {
              // Edit: load partner into answers and resume Q&A
              setAnswers({
                2: p.name || "",
                3: p.role || "",
                4: p.circle?.toString() || "",
                5: p.communicationFrequency ? p.communicationFrequency.charAt(0).toUpperCase() + p.communicationFrequency.slice(1) : "",
                6: p.communicationStyle || "",
                7: p.commonTopics?.join(", ") || "",
                8: p.notes || "",
              });
              setCurrentQuestion(1);
              setIsReviewing(false);
              // Remove partner temporarily; will be re-added on save
              setPartners(prev => prev.filter((_, i) => i !== idx));
            }}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={async () => {
              // Delete: remove and persist
              const updated = partners.filter((_, i) => i !== idx);
              setPartners(updated);
              try {
                await saveData("aac-partners", updated);
                toast({ title: "Partner deleted", description: `${p.name} was removed.` });
              } catch {
                toast({ title: "Delete error", description: "Could not delete partner.", variant: "destructive" });
              }
          }}>Delete</Button>
          </div>
        </li>
      ))}
  </ul>
    <div className="flex gap-4 mt-6">
      <Button onClick={() => { setShowPersonSelection(true); }}>
        Add Communication Partner
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await saveData("aac-partners", partners);
            toast({
              title: "Partners saved",
              description: "All partners have been securely saved.",
            });
          } catch {
            toast({
              title: "Save error",
              description: "Failed to save partners. Please try again.",
              variant: "destructive",
            });
          }
        }}
      >
        Finish & Save All
      </Button>
    </div>

    {/* Person Selection Modal */}
    {showPersonSelection && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Select Communication Partner</h3>

          <div className="space-y-4">
            {availablePeople.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Choose from existing people:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePeople.map((person) => (
                    <div
                      key={person.id}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => handlePersonSelect(person)}
                    >
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm text-gray-600">
                        {person.role} • Circle {person.circle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Button
                onClick={() => {
                  setShowPersonSelection(false);
                  setShowPersonForm(true);
                }}
                className="w-full"
              >
                Create New Person
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPersonSelection(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Person Form Modal */}
    {showPersonForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Add New Communication Partner</h3>

          <PersonForm
            onSave={handlePersonSave}
            onCancel={() => setShowPersonForm(false)}
          />
        </div>
      </div>
    )}
  </div>
);
}