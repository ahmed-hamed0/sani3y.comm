
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobDescriptionProps {
  description: string;
}

export const JobDescription = ({ description }: JobDescriptionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>وصف المهمة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {description.split('\n').map((paragraph: string, i: number) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
