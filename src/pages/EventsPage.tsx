import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Filter, Search, Globe, Video, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import SectionHeading from '../components/common/SectionHeading';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['All Events', 'Conferences', 'Webinars', 'Workshops', 'Seminars'];

  const upcomingEvents = [
    {
      title: 'International Digital Dentistry Summit 2025',
      date: 'May 15-17, 2025',
      location: 'Singapore',
      type: 'Conferences',
      attendees: 1500,
      image: 'https://images.pexels.com/photos/3845757/pexels-photo-3845757.jpeg?auto=compress&cs=tinysrgb&w=400',
      isVirtual: false
    },
    {
      title: 'Advanced Implant Techniques Workshop',
      date: 'April 28, 2025',
      location: 'Online',
      type: 'Webinars',
      attendees: 500,
      image: 'https://images.pexels.com/photos/3845765/pexels-photo-3845765.jpeg?auto=compress&cs=tinysrgb&w=800',
      isVirtual: true
    },
    {
      title: 'Dental Practice Management Seminar',
      date: 'June 5, 2025',
      location: 'London, UK',
      type: 'Seminars',
      attendees: 200,
      image: 'https://images.pexels.com/photos/3845727/pexels-photo-3845727.jpeg?auto=compress&cs=tinysrgb&w=400',
      isVirtual: false
    }
  ];

  const featuredEvent = {
    title: 'Global Dental Excellence Conference 2025',
    date: 'July 10-12, 2025',
    location: 'Dubai, UAE',
    description: 'Join the world\'s leading dental professionals for three days of learning, networking, and innovation. Featuring keynote speakers, hands-on workshops, and the latest in dental technology.',
    image: 'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800',
    speakers: [
      'Dr. Sarah Johnson - Digital Dentistry Pioneer',
      'Dr. Michael Chen - Implantology Expert',
      'Dr. Emily Rodriguez - Practice Management Specialist'
    ]
  };

  const filteredEvents = selectedCategory && selectedCategory !== 'All Events'
    ? upcomingEvents.filter(event => event.type === selectedCategory)
    : upcomingEvents;

  useEffect(() => {
    document.title = 'Events | DentalReach';
  }, []);

  return (
    <div className="pt-20 pb-16 font-inter">
      <PageHeader
        title="Events & Webinars"
        subtitle="Discover upcoming conferences, webinars, and workshops in dentistry. Connect, learn, and grow with professionals worldwide."
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <SecondaryButton>Browse All Events</SecondaryButton>
          <PrimaryButton>Submit Event</PrimaryButton>
        </div>
      </PageHeader>
      <PageContainer>
        {/* Featured Event */}
        <section className="py-12">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 lg:h-auto">
                <img 
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <span className="inline-block px-4 py-2 bg-dental-50 text-dental-600 rounded-full text-sm font-medium mb-4">
                  Featured Event
                </span>
                <h2 className="text-3xl font-semibold mb-4">{featuredEvent.title}</h2>
                <p className="text-neutral-600 mb-6">{featuredEvent.description}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-neutral-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    {featuredEvent.date}
                  </div>
                  <div className="flex items-center text-neutral-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    {featuredEvent.location}
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold">Featured Speakers:</h3>
                  {featuredEvent.speakers.map((speaker, idx) => (
                    <div key={idx} className="flex items-center text-neutral-600">
                      <Users className="h-4 w-4 mr-2" />
                      {speaker}
                    </div>
                  ))}
                </div>
                <PrimaryButton>Register Now</PrimaryButton>
              </div>
            </div>
          </Card>
        </section>

        {/* Event Listings */}
        <section className="py-12 bg-neutral-50">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden">
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Search Events</h3>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-full shadow-md px-6 py-3 pl-12 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category, idx) => (
                        <SecondaryButton
                          key={idx}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left py-2 px-4 font-semibold ${selectedCategory === category ? 'bg-dental-50 text-dental-600 font-medium' : ''}`}
                        >
                          {category}
                        </SecondaryButton>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-md border border-neutral-100 overflow-hidden hover:shadow-lg transition-all duration-200 ease-in-out">
                    <div className="h-48 relative">
                      <img 
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          event.isVirtual 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {event.isVirtual ? (
                            <><Video className="h-4 w-4 mr-1" /> Virtual</>
                          ) : (
                            <><Globe className="h-4 w-4 mr-1" /> In Person</>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-sm font-medium text-dental-600 bg-dental-50 px-3 py-1 rounded-full">
                        {event.type}
                      </span>
                      <h3 className="text-2xl font-semibold mt-3 mb-4">
                        <Link to="#" className="hover:text-dental-600 transition-colors">
                          {event.title}
                        </Link>
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-neutral-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-neutral-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-neutral-600">
                          <Users className="h-4 w-4 mr-2" />
                          {event.attendees} Attendees
                        </div>
                      </div>
                      <Link 
                        to="#" 
                        className="text-dental-600 font-medium hover:text-dental-700 flex items-center"
                      >
                        Learn More <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
};

export default EventsPage;