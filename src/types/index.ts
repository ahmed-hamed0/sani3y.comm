export type UserRole = 'client' | 'craftsman';

export interface User {
  id: string;
  name: string;
  email: string;
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
  senderId: string;
  receiverId: string;
  jobId?: string;
  content: string;
  read: boolean;
  sentAt: Date;
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
