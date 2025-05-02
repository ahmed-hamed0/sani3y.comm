
import { Link, useLocation } from 'react-router-dom';
import SignUpForm from './signup/SignUpForm';

const SignUp = () => {
  const location = useLocation();
  const role = location.state?.role || 'client';

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">إنشاء حساب جديد</h1>
      <SignUpForm initialRole={role} />
      <div className="mt-6 text-center">
        <p>
          لديك حساب بالفعل؟{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
