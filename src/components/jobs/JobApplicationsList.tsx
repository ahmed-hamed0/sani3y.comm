
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Star, User, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Application {
  id: string;
  proposal: string;
  budget: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: Date;
  craftsman: {
    id: string;
    name: string;
    avatar?: string;
    specialty: string;
    rating: number;
  };
}

interface JobApplicationsListProps {
  jobId: string;
  isMyJob: boolean;
}

const JobApplicationsList = ({ jobId, isMyJob }: JobApplicationsListProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .rpc('get_job_applications', { p_job_id: jobId });
          
        if (error) {
          console.error('Error fetching applications:', error);
          return;
        }
        
        if (data) {
          const formattedApplications = data.map((app: any) => ({
            id: app.id,
            proposal: app.proposal,
            budget: app.budget,
            status: app.status,
            submittedAt: new Date(app.submitted_at),
            craftsman: {
              id: app.craftsman_id,
              name: app.craftsman_name || 'صنايعي غير معروف',
              avatar: app.craftsman_avatar,
              specialty: app.craftsman_specialty || 'تخصص غير محدد',
              rating: app.craftsman_rating || 0
            }
          }));
          
          setApplications(formattedApplications);
        }
      } catch (err) {
        console.error('Error in fetchApplications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isMyJob) {
      fetchApplications();
    }
  }, [jobId, isMyJob]);

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);
        
      if (error) {
        console.error('Error accepting application:', error);
        toast.error('حدث خطأ أثناء قبول الطلب');
        return;
      }

      // Update job status to assigned
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'assigned',
          craftsman_id: applications.find(app => app.id === applicationId)?.craftsman.id
        })
        .eq('id', jobId);
        
      if (jobError) {
        console.error('Error updating job status:', jobError);
      }
      
      // Update applications in UI
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'accepted' } 
            : { ...app, status: 'rejected' }
        )
      );
      
      toast.success('تم قبول العرض بنجاح');
    } catch (err) {
      console.error('Error in handleAcceptApplication:', err);
      toast.error('حدث خطأ غير متوقع');
    }
  };

  const openMessageDialog = (application: Application) => {
    setSelectedApplication(application);
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedApplication) return;
    
    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content: message.trim(),
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          receiver_id: selectedApplication.craftsman.id,
          read: false
        });
        
      if (error) {
        console.error('Error sending message:', error);
        toast.error('فشل في إرسال الرسالة');
        return;
      }
      
      toast.success('تم إرسال الرسالة بنجاح');
      setMessage('');
      setIsMessageDialogOpen(false);
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsSending(false);
    }
  };

  // Generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (!isMyJob) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">المتقدمون للمهمة</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app.id} className="border rounded-lg p-4 bg-neutral">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/4 flex flex-col items-center">
                  <img 
                    src={app.craftsman.avatar || '/placeholder.svg'} 
                    alt={app.craftsman.name}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                  />
                  <h3 className="font-semibold text-center">{app.craftsman.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{app.craftsman.specialty}</p>
                  <div className="flex mb-2">
                    {renderStars(app.craftsman.rating)}
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full mb-2">
                    <Link to={`/craftsmen/${app.craftsman.id}`}>
                      عرض الملف الشخصي
                    </Link>
                  </Button>
                </div>
                
                <div className="md:w-3/4">
                  <div className="mb-3">
                    <h4 className="font-semibold mb-1">المقترح:</h4>
                    <p className="text-gray-700 whitespace-pre-line">{app.proposal}</p>
                  </div>
                  
                  {app.budget && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">السعر المقترح:</h4>
                      <p className="text-primary font-semibold">{app.budget} ج.م</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button 
                      onClick={() => openMessageDialog(app)} 
                      variant="outline"
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      إرسال رسالة
                    </Button>
                    
                    {app.status === 'pending' && (
                      <Button 
                        onClick={() => handleAcceptApplication(app.id)} 
                        size="sm"
                      >
                        قبول العرض
                      </Button>
                    )}
                    
                    {app.status === 'accepted' && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        تم قبول العرض
                      </span>
                    )}
                    
                    {app.status === 'rejected' && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        تم رفض العرض
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">لا يوجد متقدمون للمهمة حتى الآن</p>
        </div>
      )}
      
      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إرسال رسالة إلى {selectedApplication?.craftsman.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
              {isSending ? <Spinner size="sm" /> : 'إرسال'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobApplicationsList;
