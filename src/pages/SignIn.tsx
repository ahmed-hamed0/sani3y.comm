
import MainLayout from '@/components/layouts/MainLayout';
import SignInComponent from '@/components/auth/SignIn';

const SignIn = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <SignInComponent />
        </div>
      </div>
    </MainLayout>
  );
};

export default SignIn;
