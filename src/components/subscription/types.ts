
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  remaining_free_applications: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}
