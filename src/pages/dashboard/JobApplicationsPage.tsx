import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, Clock, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PageContainer from '../../components/common/PageContainer';

interface JobApplication {
  id: number;
  job_id: number;
  applicant_id: string;
  cover_letter: string;
  resume_url: string;
  status: string;
  applied_at: string;
  reviewed_at: string;
  notes: string;
  created_at: string;
  job_postings: {
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level: string;
  };
}

const JobApplicationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyApplications = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('job_applications')
          .select(`
            *,
            job_postings (
              title,
              company_name,
              location,
              job_type,
              experience_level
            )
          `)
          .eq('applicant_id', user.id)
          .order('applied_at', { ascending: false });

        if (fetchError) throw fetchError;
        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your job applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyApplications();
    document.title = 'My Job Applications | DentalReach';
  }, [user, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700';
      case 'shortlisted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'hired':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading your job applications...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Job Applications</h1>
            <p className="text-neutral-600">Track the status of your job applications</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Briefcase className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Applications Yet</h3>
              <p className="text-neutral-500 mb-6">
                You haven't applied for any jobs yet. Browse available positions and start applying.
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 bg-dental-600 text-white px-6 py-3 rounded-lg hover:bg-dental-700 transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-neutral-900">
                          {application.job_postings?.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-neutral-600 mb-3">{application.job_postings?.company_name}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.job_postings?.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {application.job_postings?.job_type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied {formatDate(application.applied_at)}
                        </div>
                        {application.reviewed_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Reviewed {formatDate(application.reviewed_at)}
                          </div>
                        )}
                      </div>

                      <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-neutral-900 mb-2">Cover Letter:</h4>
                        <p className="text-neutral-600 text-sm line-clamp-3">{application.cover_letter}</p>
                      </div>

                      {application.notes && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Employer Notes:</h4>
                          <p className="text-blue-700 text-sm">{application.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Link
                        to={`/jobs/${application.job_id}`}
                        className="flex items-center gap-1 text-dental-600 hover:text-dental-700 text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Job
                      </Link>
                      
                      {application.resume_url && (
                        <a
                          href={application.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-neutral-600 hover:text-neutral-700 text-sm"
                        >
                          <FileText className="h-4 w-4" />
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export default JobApplicationsPage;