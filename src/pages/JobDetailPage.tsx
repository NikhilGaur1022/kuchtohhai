import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, Building, DollarSign, CheckCircle, Briefcase, Upload, FileText, Eye, Download } from 'lucide-react';
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
  application_count: number;
  is_active: boolean;
  posted_by: string;
  created_at: string;
  profiles: {
    full_name: string;
    is_verified: boolean;
  };
}

interface JobApplication {
  id: number;
  cover_letter: string;
  resume_url: string;
  status: string;
  applied_at: string;
  applicant_id: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    specialty: string;
    years_of_experience: number;
  };
}

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    console.log('JobDetailPage: Starting with ID:', id);
    
    if (!id || isNaN(Number(id))) {
      console.log('JobDetailPage: Invalid ID, redirecting');
      navigate('/jobs');
      return;
    }

    const fetchJobAndApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('JobDetailPage: Fetching job with ID:', id);
        
        // First, let's check if the job_postings table exists and has data
        const { data: jobData, error: jobError } = await supabase
          .from('job_postings')
          .select(`
            id,
            title,
            company_name,
            location,
            job_type,
            experience_level,
            salary_range,
            description,
            requirements,
            benefits,
            application_deadline,
            application_count,
            is_active,
            posted_by,
            created_at,
            profiles!job_postings_posted_by_fkey (
              full_name,
              is_verified
            )
          `)
          .eq('id', id)
          .single();

        console.log('JobDetailPage: Job fetch result:', { jobData, jobError });

        if (jobError) {
          console.error('JobDetailPage: Job fetch error:', jobError);
          if (jobError.code === 'PGRST116') {
            setError('Job not found');
          } else {
            setError(`Failed to load job: ${jobError.message}`);
          }
          return;
        }

        if (!jobData) {
          console.log('JobDetailPage: No job data returned');
          setError('Job not found');
          return;
        }

        console.log('JobDetailPage: Setting job data:', jobData);
        setJob(jobData);
        
        // Check if current user is the job owner
        const jobOwner = user?.id === jobData.posted_by;
        setIsOwner(jobOwner);
        console.log('JobDetailPage: Is owner?', jobOwner);

        // Check if user has already applied (only if not owner)
        if (user && !jobOwner) {
          console.log('JobDetailPage: Checking if user has applied');
          const { data: applicationData, error: appError } = await supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', id)
            .eq('applicant_id', user.id)
            .maybeSingle();

          console.log('JobDetailPage: Application check result:', { applicationData, appError });
          
          if (appError && appError.code !== 'PGRST116') {
            console.error('JobDetailPage: Error checking application:', appError);
          } else {
            setHasApplied(!!applicationData);
          }
        }

        // If user is the job poster, fetch all applications
        if (user && jobOwner) {
          console.log('JobDetailPage: User is job owner, fetching applications');
          const { data: applicationsData, error: applicationsError } = await supabase
            .from('job_applications')
            .select(`
              id,
              cover_letter,
              resume_url,
              status,
              applied_at,
              applicant_id,
              profiles!job_applications_applicant_id_fkey (
                full_name,
                email,
                phone,
                specialty,
                years_of_experience
              )
            `)
            .eq('job_id', id)
            .order('applied_at', { ascending: false });

          console.log('JobDetailPage: Applications fetch result:', { applicationsData, applicationsError });

          if (applicationsError) {
            console.error('JobDetailPage: Error fetching applications:', applicationsError);
            // Don't set error here, just log it
          } else {
            setApplications(applicationsData || []);
          }
        }

      } catch (err) {
        console.error('JobDetailPage: Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [id, user, navigate]);

  const uploadResume = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/resume_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading resume:', err);
      throw new Error('Failed to upload resume');
    }
  };

  const handleApply = async () => {
    if (!user || !job || !coverLetter.trim()) return;

    setIsApplying(true);
    try {
      let resumeUrl = null;

      // Upload resume if provided
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile);
      }

      const { error: applyError } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          applicant_id: user.id,
          cover_letter: coverLetter,
          resume_url: resumeUrl
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
      setResumeFile(null);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
    }
    setResumeFile(file);
  };

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus, reviewed_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      // Send notification to applicant
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await supabase
          .from('notifications')
          .insert({
            user_id: application.applicant_id,
            type: 'job_application_status_updated',
            message: `Your application for "${job?.title}" has been ${newStatus}`,
            read: false
          });
      }

      alert(`Application status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status');
    }
  };

  const downloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${applicantName}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading resume:', err);
      alert('Failed to download resume');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'shortlisted': return 'bg-green-100 text-green-700';
      case 'hired': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  console.log('JobDetailPage: Render state:', { isLoading, error, job: !!job, id });

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading job details...</p>
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
      <div className="container-custom max-w-6xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Job Header */}
                <div className="mb-6">
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
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3" />
                      <span>{job.application_count || 0} applications</span>
                    </div>
                    {job.application_deadline && (
                      <div className="flex items-center text-orange-600 md:col-span-2">
                        <Clock className="h-5 w-5 mr-3" />
                        <span>Deadline: {formatDate(job.application_deadline)}</span>
                      </div>
                    )}
                  </div>
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

          {/* Right Column - Application/Applicants */}
          <div className="lg:col-span-1">
            {/* Application Section for Non-Owners */}
            {user && !isOwner && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
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
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Resume (Optional)
                          </label>
                          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                              id="resume-upload"
                            />
                            <label htmlFor="resume-upload" className="cursor-pointer">
                              <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                              <p className="text-sm text-neutral-600">
                                {resumeFile ? resumeFile.name : 'Click to upload resume'}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                PDF, DOC, DOCX (max 5MB)
                              </p>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <PrimaryButton
                            onClick={handleApply}
                            disabled={isApplying || !coverLetter.trim()}
                            className="flex-1 text-sm"
                          >
                            {isApplying ? 'Submitting...' : 'Submit Application'}
                          </PrimaryButton>
                          <SecondaryButton
                            onClick={() => {
                              setShowApplicationForm(false);
                              setCoverLetter('');
                              setResumeFile(null);
                            }}
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
            )}

            {/* Applicants Section for Job Owners */}
            {isOwner && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900">
                    Applications ({applications.length})
                  </h3>
                  <button
                    onClick={() => setShowApplicants(!showApplicants)}
                    className="text-dental-600 hover:text-dental-700 text-sm font-medium"
                  >
                    {showApplicants ? 'Hide' : 'View All'}
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(showApplicants ? applications : applications.slice(0, 3)).map((application) => (
                      <div key={application.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              {application.profiles?.full_name || 'Applicant'}
                            </h4>
                            <p className="text-sm text-neutral-600">
                              {application.profiles?.specialty || 'Dental Professional'}
                            </p>
                            {application.profiles?.years_of_experience && (
                              <p className="text-xs text-neutral-500">
                                {application.profiles.years_of_experience} years experience
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-neutral-700 mb-3 line-clamp-3">
                          {application.cover_letter}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {application.resume_url && (
                              <button
                                onClick={() => downloadResume(application.resume_url, application.profiles?.full_name || 'Applicant')}
                                className="text-dental-600 hover:text-dental-700 text-xs flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Resume
                              </button>
                            )}
                            <span className="text-xs text-neutral-500">
                              {formatDate(application.applied_at)}
                            </span>
                          </div>
                          
                          {application.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                                className="text-green-600 hover:text-green-700 text-xs px-2 py-1 rounded"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {!showApplicants && applications.length > 3 && (
                      <button
                        onClick={() => setShowApplicants(true)}
                        className="w-full text-center text-dental-600 hover:text-dental-700 text-sm font-medium py-2"
                      >
                        View {applications.length - 3} more applications
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Login Prompt for Non-Authenticated Users */}
            {!user && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Apply for this position</h3>
                <p className="text-neutral-600 mb-4">
                  You need to be logged in to apply for this job.
                </p>
                <div className="space-y-2">
                  <Link to="/login">
                    <PrimaryButton className="w-full">
                      Log In to Apply
                    </PrimaryButton>
                  </Link>
                  <Link to="/register">
                    <SecondaryButton className="w-full">
                      Create Account
                    </SecondaryButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;