import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, PawPrint } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRole } from '@shared/schema';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDashboardLink = () => {
    if (user?.role === UserRole.CLIENT) {
      return '/dashboard/client';
    } else if (user?.role === UserRole.PROVIDER) {
      return '/dashboard/provider';
    } else if (user?.role === UserRole.ADMIN) {
      return '/dashboard/admin';
    }
    return '/dashboard/client';
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className={`${scrolled ? 'text-primary-500' : 'text-white'} text-2xl transition-colors`}>
                <PawPrint className="h-6 w-6" />
              </span>
              <span className={`font-display font-bold text-xl ${scrolled ? 'text-primary-700' : 'text-white'} transition-colors`}>PawRest</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/#services" className={`${scrolled ? 'text-neutral-700' : 'text-white'} hover:text-primary-300 transition-colors px-3 py-2 text-sm font-bold drop-shadow-sm`}>
              Services
            </Link>
            <Link href="/#how-it-works" className={`${scrolled ? 'text-neutral-700' : 'text-white'} hover:text-primary-300 transition-colors px-3 py-2 text-sm font-bold drop-shadow-sm`}>
              How It Works
            </Link>
            <Link href="/#testimonials" className={`${scrolled ? 'text-neutral-700' : 'text-white'} hover:text-primary-300 transition-colors px-3 py-2 text-sm font-bold drop-shadow-sm`}>
              Testimonials
            </Link>
            <Link href="/#faq" className={`${scrolled ? 'text-neutral-700' : 'text-white'} hover:text-primary-300 transition-colors px-3 py-2 text-sm font-bold drop-shadow-sm`}>
              FAQs
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || ''} alt={user.username} />
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {user.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth" className={`${scrolled ? 'text-primary-600 hover:text-primary-700' : 'text-white hover:text-primary-200'} transition-colors px-3 py-2 text-sm font-bold drop-shadow-sm`}>
                  Sign In
                </Link>
                <Link href="/auth" className={`${scrolled ? 'bg-primary-500 hover:bg-primary-600' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'} text-white transition-colors px-4 py-2 rounded-md text-sm font-bold drop-shadow-sm`}>
                  Register
                </Link>
              </>
            )}
            <button 
              className={`md:hidden ${scrolled ? 'text-neutral-700' : 'text-white'} hover:text-primary-300 transition-colors`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <div className="container mx-auto px-4 space-y-1">
            <Link 
              href="/#services" 
              className="block py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/#how-it-works" 
              className="block py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#testimonials" 
              className="block py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link 
              href="/#faq" 
              className="block py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQs
            </Link>
            {user && (
              <>
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <Link 
                  href={getDashboardLink()} 
                  className="block py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="block py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 rounded-md"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
