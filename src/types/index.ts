
export type UserRole = 'client' | 'craftsman';

export interface User {
  id: string;
  name: string;
  email?: string; // Make email optional in the base User interface
  phone: string;
  role: UserRole;
  avatar?: string;
  rating: number;
  location: {
    governorate: string;
    city: string;
  };
  createdAt: Date;
}

export interface Client extends User {
  role: 'client';
  jobsPosted: number;
}

export interface Craftsman extends User {
  role: 'craftsman';
  specialty: string;
  bio: string;
  completedJobs: number;
  gallery: string[];
  availability: boolean;
  skills: string[];
  experience: number; // in years
  isOnline: boolean; // Added this property
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    governorate: string;
    city: string;
    address?: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  clientId: string;
  status: 'open' | 'assigned' | 'completed';
  postedAt: Date;
  applications: JobApplication[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  craftsmanId: string;
  proposal: string;
  budget?: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: Date;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
  receiver_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export type CategoryType = {
  id: string;
  name: string;
  icon: string;
};

export type GovernorateType = {
  id: string;
  name: string;
  cities: string[];
};
