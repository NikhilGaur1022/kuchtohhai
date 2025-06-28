import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, Globe, Video, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

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
  registration_deadline: string;
  price: number;
  organizer_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    is_verified: boolean;
  };
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    if (!id) {
      navigate('/events');
      return;
    }

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        
        // Fetch event with organizer profile
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            profiles (
              full_name,
              is_verified
            )
          `)
          .eq('id', id)
          .single();

        if (eventError) {
          if (eventError.code === 'PGRST116') {
            setError('Event not found');
          } else {
            throw eventError;
          }
          return;
        }

        setEvent(eventData);

        // Check if user is registered
        if (user) {
          const { data: registrationData } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single();

          setIsRegistered(!!registrationData);
        }

        // Get registration count
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', id)
          .eq('status', 'registered');

        setRegistrationCount(count || 0);

      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, user, navigate]);

  const handleRegister = async () => {
    if (!user || !event) return;

    setIsRegistering(true);
    try {
      if (isRegistered) {
        // Unregister
        await supabase
          .from('event_registrations')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        
        setIsRegistered(false);
        setRegistrationCount(prev => prev - 1);
      } else {
        // Register
        await supabase
          .from('event_registrations')
          .insert({
            event_id: event.id,
            user_id: user.id
          });
        
        setIsRegistered(true);
        setRegistrationCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling registration:', err);
      alert('Failed to update registration. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading event...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Event Not Found</h1>
            <p className="text-neutral-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
            <Link 
              to="/events" 
              className="inline-flex items-center text-dental-600 hover:text-dental-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
      <div className="container-custom max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/events" 
            className="inline-flex items-center text-dental-600 hover:text-dental-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Featured Image */}
          {event.image_url && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Event Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-dental-50 text-dental-600 rounded-full text-sm font-medium">
                {event.type}
              </span>
              {event.is_virtual ? (
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  <Video className="h-3 w-3 mr-1" />
                  Virtual
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                  <Globe className="h-3 w-3 mr-1" />
                  In Person
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
              {event.title}
            </h1>

            {/* Event Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-neutral-200">
              <div className="flex items-center text-neutral-600">
                <Calendar className="h-5 w-5 mr-3" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.time && (
                <div className="flex items-center text-neutral-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{formatTime(event.time)}</span>
                </div>
              )}
              <div className="flex items-center text-neutral-600">
                <MapPin className="h-5 w-5 mr-3" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-neutral-600">
                <Users className="h-5 w-5 mr-3" />
                <span>{registrationCount} registered</span>
                {event.max_attendees && (
                  <span className="text-neutral-400"> / {event.max_attendees} max</span>
                )}
              </div>
            </div>

            {/* Registration Section */}
            {user && (
              <div className="mb-8 p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">
                      {isRegistered ? 'You are registered for this event' : 'Register for this event'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {event.price > 0 ? `$${event.price}` : 'Free'}
                    </p>
                  </div>
                  <div>
                    {isRegistered ? (
                      <SecondaryButton
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isRegistering ? 'Cancelling...' : 'Cancel Registration'}
                      </SecondaryButton>
                    ) : (
                      <PrimaryButton
                        onClick={handleRegister}
                        disabled={isRegistering || (event.max_attendees && registrationCount >= event.max_attendees)}
                        className="flex items-center gap-2"
                      >
                        {isRegistering ? 'Registering...' : 'Register Now'}
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div className="whitespace-pre-wrap leading-relaxed text-neutral-700">
                {event.description}
              </div>
            </div>

            {/* Organizer Info */}
            <div className="pt-8 border-t border-neutral-200">
              <h3 className="text-xl font-semibold mb-4">Organized by</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dental-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-dental-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-neutral-900">
                      {event.profiles?.full_name || 'Event Organizer'}
                    </h4>
                    {event.profiles?.is_verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" title="Verified User" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">Event Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;