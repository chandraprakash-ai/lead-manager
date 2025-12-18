export type NicheCategory = 'Cafe' | 'Gym' | 'Clinic' | 'Other';
export type PriorityLevel = 'High' | 'Medium' | 'Low' | number;
export type DealStage = 'New' | 'Contacted' | 'Interested' | 'Proposal' | 'Closed' | 'Lost';
export type WebsiteStatus = 'yes' | 'no' | 'bad';

export interface Lead {
  id: string; // uuid
  created_at: string;

  // Business Info
  business_name: string;
  contact_name?: string | null;
  email?: string | null;
  niche: NicheCategory;
  city: string;
  website?: string | null;
  website_status?: 'yes' | 'no' | 'bad' | null;
  social_media?: string | null;

  // Custom Fields
  custom_data?: Record<string, any>;
  phone?: string | null;

  // Metrics
  rating?: number | null;
  score?: number | null;
  reviews?: number; // default 0

  // Operational Fields
  contacted: boolean;
  priority: PriorityLevel;
  deal_stage: DealStage;
  follow_up_date?: string | null; // date string YYYY-MM-DD
  notes?: string | null;
}

export interface LeadFilter {
  search?: string;
  niche?: NicheCategory;
  city?: string;
  priority?: PriorityLevel;
  deal_stage?: DealStage;
  contacted?: boolean;
  sortBy?: keyof Lead;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomField {
  id: string; // uuid
  key: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'url';
  created_at: string;
}
