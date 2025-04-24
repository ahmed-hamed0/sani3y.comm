
import MainLayout from '@/components/layouts/MainLayout';
import PostJobForm from '@/components/jobs/PostJobForm';

const PostJob = () => {
  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <PostJobForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default PostJob;
