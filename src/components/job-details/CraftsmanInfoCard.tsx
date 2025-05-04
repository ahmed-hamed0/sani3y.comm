
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

interface CraftsmanInfoCardProps {
  craftsman: {
    id?: string;
    full_name?: string;
    avatar_url?: string;
    specialty?: string;
  };
}

export const CraftsmanInfoCard = ({ craftsman }: CraftsmanInfoCardProps) => {
  if (!craftsman.id) return null;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>الصنايعي المكلف</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 space-x-reverse">
          <Avatar>
            <AvatarImage src={craftsman?.avatar_url || ""} />
            <AvatarFallback>
              {craftsman?.full_name ? craftsman.full_name[0] : "C"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{craftsman?.full_name || "صنايعي"}</h3>
            <p className="text-sm text-muted-foreground">
              {craftsman?.specialty || "غير محدد"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button 
          variant="outline"
          size="sm"
          asChild
        >
          <Link to={`/craftsman/${craftsman.id}`} className="flex items-center">
            <User className="ml-1 h-4 w-4" />
            عرض الملف الشخصي
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
