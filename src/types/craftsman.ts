
import { User } from './index';

// Define Craftsman interface to match the one in index.ts
export interface Craftsman {
  id: string;
  name: string;
  specialty: string;
  avatar: string | undefined;
  bio: string;
  rating: number;
  location: {
    governorate: string;
    city: string;
  };
  completedJobs: number;
  skills: string[];
  gallery: string[];
  experience: number;
  isOnline: boolean;
  availability: boolean;
  createdAt: Date;
  phone: string;
  email?: string; // Make email optional to match the base User interface
  role: 'craftsman'; // Make sure this is specifically "craftsman"
}
