import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Filter, Search, Globe, Video, ChevronRight, Plus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  type: string;
  is_virtual: boolean;
  max_attendees: number;
  price: number;
  organizer_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    is_verified: boolean;
  };
}

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [registrationCounts, setRegistrationCounts] = useState<Record<number, number>>({});

  const categories = ['All Events', 'conference', 'webinar', 'workshop', 'seminar', 'networking'];

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('events')
          .select(`
            *,
            profiles (
              full_name,
              is_verified
            )
          `)
          .eq('status', 'upcoming')
          .order('date', { ascending: true });

        if (fetchError) throw fetchError;
        setEvents(data || []);

        // Fetch registration counts for each event
        if (data && data.length > 0) {
          const counts: Record<number, number> = {};
          await Promise.all(
            data.map(async (event) => {
              const { count } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id)
                .eq('status', 'registered');
              counts[event.id] = count || 0;
            })
          );
          setRegistrationCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    document.title = 'Events | DentalReach';
  }, []);

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      selectedCategory === 'All Events' || 
      event.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (error) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter">
      <PageHeader
        title="Events & Webinars"
        subtitle="Discover upcoming conferences, webinars, and workshops in dentistry. Connect, learn, and grow with professionals worldwide."
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <SecondaryButton>Browse All Events</SecondaryButton>
          {user && (
            <Link to="/events/create">
              <PrimaryButton className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </PrimaryButton>
            </Link>
          )}
        </div>
      </PageHeader>
      <PageContainer>
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search events, topics, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full shadow-md px-6 py-4 pl-12 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-1">
              <select
                value={selectedCategory || 'All Events'}
                onChange={(e) => setSelectedCategory(e.target.value === 'All Events' ? null : e.target.value)}
                className="w-full rounded-full shadow-md px-6 py-4 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200 bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'All Events' ? category : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading events...</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-neutral-600">
                Showing {filteredEvents.length} of {events.length} events
                {selectedCategory && selectedCategory !== 'All Events' && (
                  <span> in {selectedCategory}</span>
                )}
                {searchQuery && (
                  <span> matching "{searchQuery}"</span>
                )}
              </p>
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-600 mb-2">No events found</h3>
                <p className="text-neutral-500 mb-6">
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your search criteria or browse all events.'
                    : 'No upcoming events have been scheduled yet.'}
                </p>
                {user && (
                  <Link to="/events/create">
                    <PrimaryButton className="flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      Create the First Event
                    </PrimaryButton>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Event Image */}
                    {event.image_url && (
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-4 right-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            event.is_virtual 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {event.is_virtual ? (
                              <><Video className="h-3 w-3 mr-1" /> Virtual</>
                            ) : (
                              <><Globe className="h-3 w-3 mr-1" /> In Person</>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Event Type Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-3 py-1 bg-dental-50 text-dental-600 rounded-full text-sm font-medium">
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                        {event.profiles?.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" title="Verified Organizer" />
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                        <Link 
                          to={`/events/${event.id}`}
                          className="hover:text-dental-600 transition-colors"
                        >
                          {event.title}
                        </Link>
                      </h3>
                      
                      {/* Description */}
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      
                      {/* Event Meta */}
                      <div className="space-y-2 text-sm text-neutral-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(event.date)}</span>
                          {event.time && (
                            <>
                              <Clock className="h-4 w-4 ml-4 mr-2" />
                              <span>{formatTime(event.time)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{registrationCounts[event.id] || 0} registered</span>
                          </div>
                          {event.price > 0 && (
                            <span className="font-medium text-dental-600">${event.price}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Organizer */}
                      <div className="text-xs text-neutral-500 mb-4">
                        Organized by {event.profiles?.full_name || 'Event Organizer'}
                      </div>
                      
                      {/* Learn More Link */}
                      <Link 
                        to={`/events/${event.id}`}
                        className="inline-flex items-center text-dental-600 font-medium hover:text-dental-700 transition-colors"
                      >
                        Learn More & Register
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button (if needed for pagination) */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <SecondaryButton>Load More Events</SecondaryButton>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default EventsPage;