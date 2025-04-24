
import MainLayout from '@/components/layouts/MainLayout';
import SignUpComponent from '@/components/auth/SignUp';

const SignUp = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <SignUpComponent />
        </div>
      </div>
    </MainLayout>
  );
};

export default SignUp;
