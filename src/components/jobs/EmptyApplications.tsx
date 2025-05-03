
import { Card, CardContent } from "@/components/ui/card";

export const EmptyApplications = () => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground">لا توجد طلبات تقديم على هذه المهمة حتى الآن.</p>
      </CardContent>
    </Card>
  );
};
