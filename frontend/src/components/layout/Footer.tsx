import { Link } from 'react-router-dom'
import { Mic2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-2 rounded-lg">
                <Mic2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">PodzSpace</span>
            </div>
            <p className="text-sm text-gray-400">
              Connect content creators with premium podcast studios. Create, record, and grow your audience.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-sm hover:text-primary-500 transition">
                  Find Studios
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-primary-500 transition">
                  List Your Studio
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-primary-500" />
                <span>support@podzspace.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-primary-500 mt-1" />
                <span>123 Podcast Avenue<br />San Francisco, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} PodzSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
