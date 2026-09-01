// Hand-written to mirror supabase/schema.sql.
// If you change the schema, update this file to match (or generate it with
// `npx supabase gen types typescript` once you have the Supabase CLI linked).

export type JobStatus = "pending" | "approved" | "rejected" | "closed";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  x_profile_url: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget_amount: number;
  budget_currency: string;
  telegram_contact: string;
  status: JobStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  x_profile_url: string;
  cover_message: string;
  status: ApplicationStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      };
      admin_emails: {
        Row: { email: string; added_at: string };
        Insert: { email: string; added_at?: string };
        Update: { email?: string };
      };
      jobs: {
        Row: Job;
        Insert: Partial<Job> & {
          client_id: string;
          title: string;
          description: string;
          category: string;
          budget_amount: number;
          telegram_contact: string;
        };
        Update: Partial<Job>;
      };
      applications: {
        Row: Application;
        Insert: Partial<Application> & {
          job_id: string;
          worker_id: string;
          x_profile_url: string;
          cover_message: string;
        };
        Update: Partial<Application>;
      };
    };
  };
}
