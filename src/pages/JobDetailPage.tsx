import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, Building, DollarSign, CheckCircle, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

interface JobPosting {
  id: number;
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
  is_active: boolean;
  posted_by: string;
  created_at: string;
  profiles: {
    full_name: string;
    is_verified: boolean;
  };
}

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!id) {
      navigate('/jobs');
      return;
    }

    const fetchJob = async () => {
      try {
        setIsLoading(true);
        
        // Fetch job with poster profile
        const { data: jobData, error: jobError } = await supabase
          .from('job_postings')
          .select(`
            *,
            profiles (
              full_name,
              is_verified
            )
          `)
          .eq('id', id)
          .single();

        if (jobError) {
          if (jobError.code === 'PGRST116') {
            setError('Job not found');
          } else {
            throw jobError;
          }
          return;
        }

        setJob(jobData);

        // Check if user has already applied
        if (user) {
          const { data: applicationData } = await supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', id)
            .eq('applicant_id', user.id)
            .single();

          setHasApplied(!!applicationData);
        }

      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, user, navigate]);

  const handleApply = async () => {
    if (!user || !job || !coverLetter.trim()) return;

    setIsApplying(true);
    try {
      const { error: applyError } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          applicant_id: user.id,
          cover_letter: coverLetter
        });

      if (applyError) throw applyError;

      // Send notification to job poster
      await supabase
        .from('notifications')
        .insert({
          user_id: job.posted_by,
          type: 'job_application_received',
          message: `New application received for "${job.title}"`,
          read: false
        });

      setHasApplied(true);
      setShowApplicationForm(false);
      setCoverLetter('');
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-700';
      case 'part-time': return 'bg-blue-100 text-blue-700';
      case 'contract': return 'bg-purple-100 text-purple-700';
      case 'internship': return 'bg-orange-100 text-orange-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-700';
      case 'mid': return 'bg-blue-100 text-blue-700';
      case 'senior': return 'bg-purple-100 text-purple-700';
      case 'executive': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading job...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Job Not Found</h1>
            <p className="text-neutral-600 mb-6">{error || 'The job you\'re looking for doesn\'t exist.'}</p>
            <Link 
              to="/jobs" 
              className="inline-flex items-center text-dental-600 hover:text-dental-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
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
            to="/jobs" 
            className="inline-flex items-center text-dental-600 hover:text-dental-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Job Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.job_type)}`}>
                    {job.job_type.replace('-', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceLevelColor(job.experience_level)}`}>
                    {job.experience_level} level
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                  {job.title}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-neutral-500" />
                  <span className="text-lg font-medium text-neutral-700">{job.company_name}</span>
                  {job.profiles?.is_verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500" title="Verified Employer" />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-600">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{job.location}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-3" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Posted {formatDate(job.created_at)}</span>
                  </div>
                  {job.application_deadline && (
                    <div className="flex items-center text-orange-600">
                      <Clock className="h-5 w-5 mr-3" />
                      <span>Deadline: {formatDate(job.application_deadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Section */}
              {user && user.id !== job.posted_by && (
                <div className="lg:w-80">
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4">
                      {hasApplied ? 'Application Submitted' : 'Apply for this position'}
                    </h3>
                    {hasApplied ? (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-green-700 font-medium">You have already applied for this job</p>
                        <p className="text-sm text-neutral-600 mt-2">We'll notify you of any updates</p>
                      </div>
                    ) : (
                      <div>
                        {!showApplicationForm ? (
                          <PrimaryButton
                            onClick={() => setShowApplicationForm(true)}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Briefcase className="h-4 w-4" />
                            Apply Now
                          </PrimaryButton>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Cover Letter *
                              </label>
                              <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-500"
                                placeholder="Tell us why you're interested in this position..."
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <PrimaryButton
                                onClick={handleApply}
                                disabled={isApplying || !coverLetter.trim()}
                                className="flex-1 text-sm"
                              >
                                {isApplying ? 'Submitting...' : 'Submit'}
                              </PrimaryButton>
                              <SecondaryButton
                                onClick={() => setShowApplicationForm(false)}
                                className="flex-1 text-sm"
                              >
                                Cancel
                              </SecondaryButton>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-neutral-700">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-dental-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-neutral-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-neutral-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Employer Info */}
            <div className="pt-8 border-t border-neutral-200">
              <h3 className="text-xl font-semibold mb-4">About the Employer</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dental-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-dental-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-neutral-900">{job.company_name}</h4>
                    {job.profiles?.is_verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" title="Verified Employer" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">
                    Posted by {job.profiles?.full_name || 'Employer'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;