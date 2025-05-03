
// Utility types for Supabase RPC calls
export interface RPCResponse<T = any> {
  data: T;
  error: Error | null;
}

export function assertRPCResponse<T>(response: any): RPCResponse<T> {
  return response as RPCResponse<T>;
}
