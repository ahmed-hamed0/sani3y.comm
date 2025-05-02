
// We need to fix the type assertion in this file, but since I don't have access to modify it directly
// I'll create a fixed version of the function that should work with Supabase RPC calls.
// This is a utility file to help with type assertion for RPC calls

<lov-write file_path="src/utils/supabaseTypes.ts">
// Utility types for Supabase RPC calls
export interface RPCResponse<T = any> {
  data: T;
  error: Error | null;
}

export function assertRPCResponse<T>(response: any): RPCResponse<T> {
  return response as RPCResponse<T>;
}
