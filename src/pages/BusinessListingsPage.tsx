import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Globe, Star, Search, Filter, Mail, Clock, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import PageContainer from "../components/common/PageContainer";
import SectionHeading from '../components/common/SectionHeading';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

const BusinessListingsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Dental Clinics', count: 458 },
    { name: 'Dental Labs', count: 234 },
    { name: 'Equipment Suppliers', count: 156 },
    { name: 'Material Suppliers', count: 189 },
    { name: 'Service Providers', count: 145 },
    { name: 'Education Centers', count: 98 }
  ];

  const featuredBusinesses = [
    {
      name: 'Advanced Dental Care Center',
      category: 'Dental Clinics',
      rating: 4.8,
      reviews: 125,
      location: 'New York, USA',
      image: 'https://images.pexels.com/photos/3845757/pexels-photo-3845757.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: ['General Dentistry', 'Cosmetic Dentistry', 'Orthodontics'],
      verified: true
    },
    {
      name: 'Premier Dental Laboratory',
      category: 'Dental Labs',
      rating: 4.7,
      reviews: 89,
      location: 'London, UK',
      image: '/src/Tooth-replacement.jpg',
      services: ['Crown & Bridge', 'Implants', 'Digital Solutions'],
      verified: true
    },
    {
      name: 'Global Dental Supplies',
      category: 'Equipment Suppliers',
      rating: 4.6,
      reviews: 156,
      location: 'Singapore',
      image: 'https://images.pexels.com/photos/3845727/pexels-photo-3845727.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: ['Equipment Sales', 'Maintenance', 'Technical Support'],
      verified: true
    }
  ];

  const recentListings = [
    {
      name: 'Smile Design Institute',
      category: 'Education Centers',
      location: 'Dubai, UAE',
      image: 'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Leading dental education center offering comprehensive courses in cosmetic dentistry and implantology.'
    },
    {
      name: 'Dental Tech Solutions',
      category: 'Service Providers',
      location: 'Toronto, Canada',
      image: 'https://images.pexels.com/photos/3845727/pexels-photo-3845727.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Specialized in dental practice management software and IT solutions for modern dental clinics.'
    },
    {
      name: 'Premium Dental Materials',
      category: 'Material Suppliers',
      location: 'Berlin, Germany',
      image: 'https://images.pexels.com/photos/3845843/pexels-photo-3845843.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Quality dental materials and supplies with worldwide shipping and excellent customer service.'
    }
  ];

  useEffect(() => {
    document.title = 'Business Listings | DentalReach';
  }, []);

  return (
    <div className="pt-20 pb-16 font-inter">
      <PageHeader
        title="Dental Business Directory"
        subtitle="Find and connect with trusted dental businesses worldwide. From clinics to suppliers, discover the perfect partners for your needs."
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <PrimaryButton>List Your Business</PrimaryButton>
          <SecondaryButton>Browse Directory</SecondaryButton>
        </div>
      </PageHeader>

      {/* Search & Categories */}
      <section className="py-12 bg-neutral-50">
        <PageContainer>
          <div className="max-w-3xl mx-auto">
            <div className="relative mb-8">
              <SearchBar
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, idx) => (
                <SecondaryButton
                  key={idx}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-4 rounded-xl text-center border font-semibold ${selectedCategory === category.name ? 'bg-dental-50 text-dental-600' : ''}`}
                >
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm opacity-75">{category.count} listings</p>
                </SecondaryButton>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Featured Businesses */}
      <section className="py-16">
        <PageContainer>
          <SectionHeading title="Featured Businesses" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBusinesses.map((business, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden">
                <div className="h-48 relative">
                  <img 
                    src={business.image}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                  {business.verified && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm font-medium text-dental-600 bg-dental-50 px-3 py-1 rounded-full">
                        {business.category}
                      </span>
                      <h3 className="text-xl font-semibold mt-2">
                        <Link to="#" className="hover:text-dental-600 transition-colors">
                          {business.name}
                        </Link>
                      </h3>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{business.rating}</span>
                      <span className="text-sm text-neutral-500 ml-1">({business.reviews})</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-neutral-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {business.location}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {business.services.map((service, serviceIdx) => (
                      <span 
                        key={serviceIdx}
                        className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to="#" 
                    className="text-dental-600 font-medium hover:text-dental-700 flex items-center"
                  >
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-neutral-50">
        <PageContainer>
          <SectionHeading title="Recent Listings" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentListings.map((listing, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md border border-neutral-100 overflow-hidden hover:shadow-lg transition-all duration-200 ease-in-out">
                <div className="h-40">
                  <img 
                    src={listing.image}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="text-sm font-medium text-dental-600 bg-dental-50 px-3 py-1 rounded-full">
                    {listing.category}
                  </span>
                  <h3 className="text-xl font-semibold mt-3 mb-2">
                    <Link to="#" className="hover:text-dental-600 transition-colors">
                      {listing.name}
                    </Link>
                  </h3>
                  <div className="flex items-center text-neutral-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    {listing.location}
                  </div>
                  <p className="text-neutral-600 text-sm mb-4">
                    {listing.description}
                  </p>
                  <Link 
                    to="#" 
                    className="text-dental-600 font-medium hover:text-dental-700 flex items-center"
                  >
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default BusinessListingsPage;