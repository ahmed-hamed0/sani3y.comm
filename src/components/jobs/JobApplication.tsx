import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "../ui/spinner";

const applicantSchema = z.object({
  budget: z.number().min(1, { message: "يجب تحديد تكلفة مناسبة" }),
  proposal: z.string().min(10, {
    message: "يجب أن يكون العرض 10 أحرف على الأقل",
  }),
});

type ApplicationFormValues = z.infer<typeof applicantSchema>;

export interface JobApplicationProps {
  jobId: string;
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}

interface JobData {
  id: string;
  title: string;
  client_id?: string;
}

// Define proper interface for the check_job_application function result
interface ApplicationCheckResult {
  exists: boolean;
}

export function JobApplication({
  jobId, 
  isOpen,
  onClose,
  onSuccess
}: JobApplicationProps) {
  const { user, isCraftsman } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      budget: 0,
      proposal: "",
    },
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const { data, error } = await supabase
            .from("jobs")
            .select("id, title, client_id")
            .eq("id", jobId)
            .single();

          if (error) throw error;
          if (data) {
            setJobData({
              id: data.id,
              title: data.title,
              client_id: data.client_id
            });
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
        }
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const onSubmit = async (values: ApplicationFormValues) => {
    if (!user || !user.id || !isCraftsman) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون صنايعي وتسجل الدخول لتقديم عرض",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Fix: Remove type parameter and use proper params object with correct types
      const { data: checkData, error: checkError } = await supabase
        .rpc("check_job_application", {
          p_craftsman_id: user.id,
          p_job_id: jobId
        });

      if (checkError) throw checkError;

      // Check if application exists with proper type assertion
      const typedCheckData = checkData as ApplicationCheckResult;
      if (typedCheckData && typedCheckData.exists) {
        toast({
          title: "لا يمكن التقديم",
          description: "لقد قدمت عرضاً بالفعل على هذه المهمة",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // إنشاء طلب جديد
      const { error: applicationError } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          craftsman_id: user.id,
          proposal: values.proposal,
          budget: values.budget,
          status: "pending",
        });

      if (applicationError) throw applicationError;

      // إرسال إشعار للعميل
      if (jobData && jobData.client_id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: jobData.client_id,
            title: "عرض جديد على مهمتك",
            message: `تلقيت عرضاً جديداً على مهمة "${jobData.title}"`,
            link: `/job/${jobId}`,
            read: false,
          });
      }

      toast({
        title: "تم التقديم بنجاح",
        description: "تم إرسال عرضك إلى العميل وسيتم إعلامك في حالة القبول",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تقديم العرض. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">تقديم عرض على المهمة</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" />
            <p className="mt-4 text-center text-muted-foreground">
              جاري إرسال العرض...
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التكلفة المقترحة (جنيه مصري)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="أدخل القيمة المناسبة"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proposal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تفاصيل العرض</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب تفاصيل عرضك وخبرتك في مثل هذا النوع من المهام..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  إلغاء
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  إرسال العرض
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default JobApplication;
