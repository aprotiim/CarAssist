export interface Preferences {
  budgetMin: number;
  budgetMax: number;
  bodyTypes: string[];
  fuelTypes: string[];
  yearMin: number;
  yearMax: number;
  maxMileage: number;
  transmissions: string[];
  drivetrains: string[];
  features: string[];
  brands: string[];
  zip: string;
  radius: number;
}

export interface Listing {
  id: number;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  fuel: string;
  body: string;
  transmission: string;
  drivetrain: string;
  color: string;
  source: string;
  url: string;
  dealer: string;
  dealerType: "dealer" | "private";
  score: number;
  img: string;
  zip: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface RagTopic {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export type SortOption = "score" | "priceLow" | "priceHigh" | "mileage" | "newest";
