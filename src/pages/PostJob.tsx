
import MainLayout from '@/components/layouts/MainLayout';
import PostJobForm from '@/components/jobs/PostJobForm';
import { RequireClient } from '@/hooks/auth';

const PostJob = () => {
  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <RequireClient>
            <PostJobForm />
          </RequireClient>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostJob;
