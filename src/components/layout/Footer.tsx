import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and brief info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-dental-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DR</span>
              </div>
              <span className="font-semibold text-xl text-white">DentalReach</span>
            </Link>
            <p className="text-neutral-300 mb-6">
              The world's first all-in-one digital platform for dental professionals to build authority, gain recognition, and share knowledge.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-dental-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-dental-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-dental-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-dental-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-dental-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/articles" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/journals" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Journals
                </Link>
              </li>
              <li>
                <Link to="/forum" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/classifieds" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Classifieds
                </Link>
              </li>
              <li>
                <Link to="/professors" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Professors
                </Link>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-medium text-lg mb-6">For Professionals</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/business-listings" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Business Listings
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/conference" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Conference
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Submit Content
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-neutral-300 hover:text-dental-300 transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-medium text-lg mb-6">Subscribe</h4>
            <p className="text-neutral-300 mb-4">Join our newsletter to stay updated with dental industry trends.</p>
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-neutral-800 text-neutral-300 px-4 py-2 rounded-l-lg flex-1 focus:outline-none focus:ring-1 focus:ring-dental-500"
                />
                <button
                  type="submit"
                  className="bg-dental-600 hover:bg-dental-700 text-white px-4 py-2 rounded-r-lg font-semibold transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </form>
            <p className="text-neutral-400 text-sm">
              By subscribing you agree to receive the newsletter and promotional emails from DentalReach.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} DentalReach. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-400 hover:text-dental-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-neutral-400 hover:text-dental-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-neutral-400 hover:text-dental-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;