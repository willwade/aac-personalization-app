// Social Network Types
// Communication Partner (Person) for Circles of Communication
export type Person = {
  id: string;
  name: string;
  role: string; // e.g. "wife", "friend", "physiotherapist"
  relationship: string;
  circle?: 1 | 2 | 3 | 4 | 5; // 1=Family, 2=Friends, 3=Acquaintances, 4=Paid Workers, 5=Unfamiliar
  communicationFrequency?: "daily" | "weekly" | "monthly" | "rarely";
  communicationStyle?: string; // e.g. "Informal, affectionate"
  commonTopics?: string[]; // e.g. ["Family events", "Sports"]
  communicationPreferences?: string[];
  topics?: string[];
  notes?: string;
};

export type Place = {
  id: string
  name: string
  type: string
  frequency: "daily" | "weekly" | "monthly" | "rarely"
  communicationPartners: string[] // IDs of people
  notes: string
}

export type Topic = {
  id: string
  name: string
  interest: "high" | "medium" | "low"
  relatedPeople: string[] // IDs of people
  notes: string
}

// Communication Passport Types
export type PassportSection = {
  id: string
  title: string
  content: string
  order: number
}

export type Passport = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  sections: PassportSection[]
}

// Conversation Log Types
export type Conversation = {
  id: string
  partnerId: string
  partnerName: string
  location: string
  date: string
  transcription: string
  notes: string
  topics: string[]
  duration: number // in seconds
}
