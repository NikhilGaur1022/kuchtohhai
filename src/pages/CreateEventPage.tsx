import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Image, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PageContainer from '../components/common/PageContainer';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

interface EventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  type: string;
  is_virtual: boolean;
  max_attendees: string;
  registration_deadline: string;
  price: string;
}

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image_url: '',
    type: 'conference',
    is_virtual: false,
    max_attendees: '',
    registration_deadline: '',
    price: '0'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is verified
    const checkVerification = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified, verification_status')
        .eq('id', user.id)
        .single();

      if (profile?.is_verified) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
      setIsLoading(false);
    };

    checkVerification();
    document.title = 'Create Event | DentalReach';
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isVerified) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        organizer_id: user.id,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        price: parseFloat(formData.price) || 0,
        registration_deadline: formData.registration_deadline || null
      };

      const { data, error: submitError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (submitError) throw submitError;

      navigate(`/events/${data.id}`);
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <PageContainer>
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Verification Required</h1>
              <p className="text-neutral-600 mb-6">
                You need to be verified to create events on DentalReach. This helps us maintain the quality and authenticity of events on our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PrimaryButton onClick={() => navigate('/verification/apply')}>
                  Apply for Verification
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate('/events')}>
                  Browse Events
                </SecondaryButton>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Create New Event</h1>
            <p className="text-lg text-neutral-600">
              Share your knowledge and connect with the dental community by organizing an event.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Event Details</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="Describe your event, agenda, speakers, and what attendees can expect..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      required
                    >
                      <option value="conference">Conference</option>
                      <option value="webinar">Webinar</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="networking">Networking</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-neutral-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="registration_deadline" className="block text-sm font-medium text-neutral-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="registration_deadline"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Location</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_virtual"
                    name="is_virtual"
                    checked={formData.is_virtual}
                    onChange={handleChange}
                    className="rounded border-neutral-300 focus:ring-dental-500 h-4 w-4"
                  />
                  <label htmlFor="is_virtual" className="ml-2 block text-sm text-neutral-700">
                    This is a virtual event
                  </label>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                    {formData.is_virtual ? 'Platform/Meeting Link' : 'Venue Address'} *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder={formData.is_virtual ? 'Zoom, Teams, or other platform details' : 'Enter venue address'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Additional Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="max_attendees" className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum Attendees
                  </label>
                  <input
                    type="number"
                    id="max_attendees"
                    name="max_attendees"
                    value={formData.max_attendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Image URL
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="https://example.com/event-image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Event
                  </>
                )}
              </PrimaryButton>
              
              <SecondaryButton
                type="button"
                onClick={() => navigate('/events')}
                className="flex-1"
              >
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
};

export default CreateEventPage;