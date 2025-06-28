import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PageContainer from '../components/common/PageContainer';
import PrimaryButton from '../components/common/PrimaryButton';

interface VerificationData {
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_license: string;
  identity_document: string;
  experience_description: string;
  website_url: string;
  social_media_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  additional_info: string;
}

const VerificationApplicationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  
  const [formData, setFormData] = useState<VerificationData>({
    business_name: '',
    business_type: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_license: '',
    identity_document: '',
    experience_description: '',
    website_url: '',
    social_media_links: {},
    additional_info: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user already has an application
    const checkExistingApplication = async () => {
      const { data } = await supabase
        .from('verification_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setExistingApplication(data);
      }
    };

    checkExistingApplication();
    document.title = 'Apply for Verification | DentalReach';
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_media_links: {
          ...prev.social_media_links,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: submitError } = await supabase
        .from('verification_applications')
        .insert({
          user_id: user.id,
          ...formData
        });

      if (submitError) throw submitError;

      // Update profile verification status
      await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          verification_applied_at: new Date().toISOString()
        })
        .eq('id', user.id);

      setSuccess('Your verification application has been submitted successfully! We will review it within 3-5 business days.');
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Error submitting verification application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingApplication) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <PageContainer>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="mb-6">
                {existingApplication.status === 'pending' && (
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                )}
                {existingApplication.status === 'approved' && (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                )}
                {existingApplication.status === 'rejected' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Verification Application Status
              </h1>
              
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  existingApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  existingApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                </span>
              </div>
              
              <p className="text-neutral-600 mb-6">
                {existingApplication.status === 'pending' && 
                  'Your verification application is currently under review. We will notify you once it has been processed.'}
                {existingApplication.status === 'approved' && 
                  'Congratulations! Your verification application has been approved. You can now create events.'}
                {existingApplication.status === 'rejected' && 
                  'Your verification application was not approved. Please contact support for more information.'}
              </p>
              
              {existingApplication.admin_notes && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-2">Admin Notes:</h3>
                  <p className="text-neutral-600">{existingApplication.admin_notes}</p>
                </div>
              )}
              
              <PrimaryButton onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </PrimaryButton>
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
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Apply for Verification</h1>
            <p className="text-lg text-neutral-600">
              Get verified to create and organize events on DentalReach. Please provide accurate information for review.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
            {/* Business Information */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="business_name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business/Practice Name *
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="business_type" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="dental_clinic">Dental Clinic</option>
                    <option value="dental_laboratory">Dental Laboratory</option>
                    <option value="dental_supplier">Dental Supplier</option>
                    <option value="educational_institution">Educational Institution</option>
                    <option value="research_organization">Research Organization</option>
                    <option value="professional_association">Professional Association</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="business_address" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    id="business_address"
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="business_phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    id="business_phone"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="business_email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    id="business_email"
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Documentation</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="business_license" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business License Number
                  </label>
                  <input
                    type="text"
                    id="business_license"
                    name="business_license"
                    value={formData.business_license}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="Enter your business license number"
                  />
                </div>

                <div>
                  <label htmlFor="identity_document" className="block text-sm font-medium text-neutral-700 mb-2">
                    Professional License/ID Number
                  </label>
                  <input
                    type="text"
                    id="identity_document"
                    name="identity_document"
                    value={formData.identity_document}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="Enter your professional license or ID number"
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Professional Experience</h2>
              <div>
                <label htmlFor="experience_description" className="block text-sm font-medium text-neutral-700 mb-2">
                  Describe your experience and qualifications
                </label>
                <textarea
                  id="experience_description"
                  name="experience_description"
                  value={formData.experience_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  placeholder="Tell us about your professional background, experience, and qualifications..."
                />
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Online Presence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="website_url" className="block text-sm font-medium text-neutral-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="https://www.yourwebsite.com"
                  />
                </div>

                <div>
                  <label htmlFor="social_linkedin" className="block text-sm font-medium text-neutral-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="social_linkedin"
                    name="social_linkedin"
                    value={formData.social_media_links.linkedin || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label htmlFor="social_twitter" className="block text-sm font-medium text-neutral-700 mb-2">
                    Twitter Profile
                  </label>
                  <input
                    type="url"
                    id="social_twitter"
                    name="social_twitter"
                    value={formData.social_media_links.twitter || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium text-neutral-700 mb-2">
                Additional Information
              </label>
              <textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                placeholder="Any additional information you'd like to provide..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit Verification Application
                  </>
                )}
              </PrimaryButton>
            </div>

            <div className="text-center text-sm text-neutral-500">
              <p>
                By submitting this application, you agree to our verification process and terms of service.
                Applications are typically reviewed within 3-5 business days.
              </p>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
};

export default VerificationApplicationPage;