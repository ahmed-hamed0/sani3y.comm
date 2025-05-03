
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, X } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getStatusBadge } from "./utils/applicationUtils";

export interface JobApplication {
  id: string;
  status: string;
  created_at: string;
  budget: number;
  proposal: string;
  craftsman: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    specialty?: string;
  };
}

interface ApplicationCardProps {
  application: JobApplication;
  isMyJob: boolean;
  onAccept: (applicationId: string, craftsmanId: string, craftsmanName: string) => void;
  onReject: (applicationId: string, craftsmanId: string, craftsmanName: string) => void;
}

export const ApplicationCard = ({ 
  application, 
  isMyJob,
  onAccept,
  onReject
}: ApplicationCardProps) => {
  return (
    <Card key={application.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={application.craftsman?.avatar_url || ""} />
              <AvatarFallback>
                {application.craftsman?.full_name?.[0] || "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {application.craftsman?.full_name || "صنايعي"}
              </CardTitle>
              <CardDescription>
                {application.craftsman?.specialty || "متخصص"}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge(application.status)}
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(application.created_at), { addSuffix: true, locale: ar })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="mb-2">
          <span className="font-medium">السعر المقترح: </span>
          <span className="text-primary">{application.budget} جنيه</span>
        </div>
        <p className="text-gray-700">{application.proposal}</p>
      </CardContent>
      {isMyJob && application.status === "pending" && (
        <CardFooter className="border-t pt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onReject(
              application.id, 
              application.craftsman?.id, 
              application.craftsman?.full_name || ""
            )}
          >
            <X className="mr-1 h-4 w-4" />
            رفض
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onAccept(
              application.id, 
              application.craftsman?.id, 
              application.craftsman?.full_name || ""
            )}
          >
            <Check className="mr-1 h-4 w-4" />
            قبول
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
