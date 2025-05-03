
/**
 * Type guard to assert RPC response types for Supabase
 * This utility helps safely type the response from Supabase RPC calls
 */
export interface RPCResponse<T> {
  data: T;
  error?: Error;
}

// Utility to assert the type of RPC response data
export function assertRPCResponse<T>(data: any): RPCResponse<T> {
  return {
    data: data as T,
    error: undefined
  };
}

// We no longer need the assertStringParam function as we're using type assertion directly
