import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, MapPin, DollarSign, Save, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PageContainer from '../components/common/PageContainer';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

interface JobData {
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string[];
  benefits: string[];
  application_deadline: string;
}

const CreateJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<JobData>({
    title: '',
    company_name: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'mid',
    salary_range: '',
    description: '',
    requirements: [''],
    benefits: [''],
    application_deadline: ''
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
    document.title = 'Post a Job | DentalReach';
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index: number, value: string, field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isVerified) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Filter out empty requirements and benefits
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        posted_by: user.id,
        application_deadline: formData.application_deadline || null
      };

      const { data, error: submitError } = await supabase
        .from('job_postings')
        .insert(cleanedData)
        .select()
        .single();

      if (submitError) throw submitError;

      navigate(`/jobs/${data.id}`);
    } catch (err) {
      console.error('Error creating job posting:', err);
      setError('Failed to create job posting. Please try again.');
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
                <Briefcase className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Verification Required</h1>
              <p className="text-neutral-600 mb-6">
                You need to be verified to post jobs on DentalReach. This helps us maintain the quality and authenticity of job postings on our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PrimaryButton onClick={() => navigate('/verification/apply')}>
                  Apply for Verification
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate('/jobs')}>
                  Browse Jobs
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Post a Job</h1>
            <p className="text-lg text-neutral-600">
              Find the perfect candidate for your dental practice or organization.
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
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="e.g., Senior Dental Hygienist"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Company/Practice Name *
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="e.g., Smith Dental Clinic"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="e.g., New York, NY or Remote"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="job_type" className="block text-sm font-medium text-neutral-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    id="job_type"
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience_level" className="block text-sm font-medium text-neutral-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    id="experience_level"
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    required
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="salary_range" className="block text-sm font-medium text-neutral-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    id="salary_range"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder="e.g., $60,000 - $80,000 per year"
                  />
                </div>

                <div>
                  <label htmlFor="application_deadline" className="block text-sm font-medium text-neutral-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="application_deadline"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Job Description</h2>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                  required
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Requirements</h2>
              <div className="space-y-3">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                      className="flex-1 px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="e.g., Bachelor's degree in Dental Hygiene"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'requirements')}
                        className="p-3 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="flex items-center gap-2 text-dental-600 hover:text-dental-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Benefits</h2>
              <div className="space-y-3">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'benefits')}
                      className="flex-1 px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="e.g., Health insurance, Dental coverage"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'benefits')}
                        className="p-3 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('benefits')}
                  className="flex items-center gap-2 text-dental-600 hover:text-dental-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Benefit
                </button>
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
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Post Job
                  </>
                )}
              </PrimaryButton>
              
              <SecondaryButton
                type="button"
                onClick={() => navigate('/jobs')}
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

export default CreateJobPage;