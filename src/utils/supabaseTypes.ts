
// Define common Supabase RPC function response types

/**
 * Utility type for Supabase RPC responses
 */
export interface RPCResponse<T> {
  data: T | null;
  error: any;
}

/**
 * Type for check_job_application RPC function result
 */
export interface ApplicationCheckResult {
  can_apply: boolean;
  is_premium: boolean;
  free_applications_remaining?: number;
}

/**
 * Type for get_craftsman_reviews RPC function result
 */
export interface CraftsmanReview {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

/**
 * Utility function to assert string parameters (needed for RPC calls)
 */
export function assertStringParam(value: string): string {
  return value;
}
