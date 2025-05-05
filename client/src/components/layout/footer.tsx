import { Link } from 'wouter';
import { PawPrint } from 'lucide-react';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaPinterest, 
  FaHeadset 
} from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-white text-2xl">
                <PawPrint className="h-6 w-6" />
              </span>
              <span className="font-display font-semibold text-xl text-white">PawRest</span>
            </div>
            <p className="mb-6">
              Compassionate pet memorial services that honor the special bond you shared with your companion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaPinterest size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-medium mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Cremation Services
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Memorial Keepsakes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Farewell Ceremonies
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Home Euthanasia
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Garden Memorials
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Grief Counseling
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-medium mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-medium mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Provider Resources
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Pet Loss Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="inline-flex items-center bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  <FaHeadset className="mr-2" /> 24/7 Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} PawRest. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors mx-3">
                Terms
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors mx-3">
                Privacy
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors mx-3">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
