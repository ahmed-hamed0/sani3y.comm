
import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * Returns the appropriate badge component for a job application status
 */
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "accepted":
      return <Badge className="bg-green-500">تم القبول</Badge>;
    case "rejected":
      return <Badge variant="destructive">مرفوض</Badge>;
    default:
      return <Badge variant="outline">قيد الانتظار</Badge>;
  }
};
