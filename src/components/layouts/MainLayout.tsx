import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, User, Plus, Bell, X, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    const { success, error } = await signOut();
    
    if (success) {
      toast({
        title: "تم تسجيل الخروج",
        description: "نتمنى أن نراك مرة أخرى قريبًا"
      });
      navigate('/');
    } else if (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignupAsCraftsman = () => {
    navigate('/sign-up', { state: { role: 'craftsman' } });
  };

  const handleSignupAsClient = () => {
    navigate('/sign-up', { state: { role: 'client' } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">صنايعي</span>
              <span className="text-2xl font-bold text-gray-800">.كوم</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
              <Link to="/" className="text-gray-700 hover:text-primary transition">الرئيسية</Link>
              <Link to="/craftsmen" className="text-gray-700 hover:text-primary transition">الصنايعية</Link>
              <Link to="/jobs" className="text-gray-700 hover:text-primary transition">المهام</Link>
              <Link to="/about" className="text-gray-700 hover:text-primary transition">عن المنصة</Link>
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
              {user ? (
                <>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link to="/post-job" className="flex items-center gap-1">
                      <Plus size={18} />
                      <span>مهمة جديدة</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/profile">
                      <User size={20} />
                    </Link>
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-500"
                  >
                    <LogOut size={20} />
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/sign-in">تسجيل الدخول</Link>
                  </Button>
                  <Button asChild variant="outline" onClick={handleSignupAsClient}>
                    <Link to="/sign-up">سجل كعميل</Link>
                  </Button>
                  <Button asChild className="bg-white text-black hover:bg-white/90" onClick={handleSignupAsCraftsman}>
                    <Link to="/sign-up">سجل كصنايعي</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white pt-4 pb-6 border-t mt-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-primary transition text-right px-4">الرئيسية</Link>
                <Link to="/craftsmen" className="text-gray-700 hover:text-primary transition text-right px-4">الصنايعية</Link>
                <Link to="/jobs" className="text-gray-700 hover:text-primary transition text-right px-4">المهام</Link>
                <Link to="/about" className="text-gray-700 hover:text-primary transition text-right px-4">عن المنصة</Link>
                
                <div className="border-t pt-4 mt-2 px-4">
                  {user ? (
                    <div className="flex flex-col space-y-3">
                      <Button asChild>
                        <Link to="/post-job" className="flex items-center gap-1 justify-center">
                          <Plus size={18} />
                          <span>مهمة جديدة</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/profile">حسابي الشخصي</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="text-red-500 hover:text-red-700"
                      >
                        <LogOut size={18} className="ml-2" />
                        <span>تسجيل الخروج</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button asChild className="bg-white text-black hover:bg-white/90" onClick={handleSignupAsCraftsman}>
                        <Link to="/sign-up">سجل كصنايعي</Link>
                      </Button>
                      <Button asChild variant="outline" onClick={handleSignupAsClient}>
                        <Link to="/sign-up">سجل كعميل</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/sign-in">تسجيل الدخول</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">صنايعي.كوم</h3>
              <p className="text-gray-300">منصة تربط بين أفضل الصنايعية والعملاء في مختلف المجالات</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white transition">الرئيسية</Link></li>
                <li><Link to="/craftsmen" className="text-gray-300 hover:text-white transition">الصنايعية</Link></li>
                <li><Link to="/jobs" className="text-gray-300 hover:text-white transition">تصفح المهام</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition">عن المنصة</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
              <p className="text-gray-300">البريد الإلكتروني: sani3y.com@gmail.com</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
            <p>جميع الحقوق محفوظة &copy; صنايعي.كوم {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
