
import { Craftsman as BaseCraftsman } from './index';

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
  email?: string;
  role: 'craftsman'; // Make sure this is specifically "craftsman" to match the base type
}
