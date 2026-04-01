export interface Profile {
  id: string;
  username: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  owner_id: string;
  card_id: string;
  saved_at: string;
}

export interface ContactWithCard {
  id: string;
  card_id: string;
  saved_at: string;
  name: string;
  job_title: string;
  company: string;
  slug: string;
  username: string;
}

export interface Card {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  linkedin_url: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  photo_url: string | null;
  logo_url: string | null;
}

export interface CardFormValues {
  title: string;
  name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  linkedin_url: string;
}
