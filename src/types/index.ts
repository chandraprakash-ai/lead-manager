export type NicheCategory = 'Cafe' | 'Gym' | 'Clinic' | 'Other';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type DealStage = 'New' | 'Contacted' | 'Interested' | 'Proposal' | 'Closed' | 'Lost';
export type WebsiteStatus = 'yes' | 'no' | 'bad';

export interface Lead {
  id: string; // uuid
  created_at: string;

  // Business Info
  business_name: string;
  niche: NicheCategory;
  city: string;
  website?: string | null;
  website_status: WebsiteStatus;
  social_media?: string | null;
  phone?: string | null;

  // Metrics
  rating?: number | null;
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
