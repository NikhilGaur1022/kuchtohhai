import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, Users, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PageContainer from '../../components/common/PageContainer';
import PrimaryButton from '../../components/common/PrimaryButton';

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
  updated_at: string;
  application_count: number;
}

const JobListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyJobs = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('job_postings')
          .select('*')
          .eq('posted_by', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setJobs(data || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load your job listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyJobs();
    document.title = 'My Job Listings | DentalReach';
  }, [user, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading your job listings...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Job Listings</h1>
              <p className="text-neutral-600">Manage your posted job opportunities</p>
            </div>
            <Link to="/jobs/create">
              <PrimaryButton className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Job
              </PrimaryButton>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Briefcase className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Job Listings Yet</h3>
              <p className="text-neutral-500 mb-6">
                You haven't posted any job opportunities yet. Start by creating your first job listing.
              </p>
              <Link to="/jobs/create">
                <PrimaryButton className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Post Your First Job
                </PrimaryButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-neutral-900">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          job.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-neutral-600 mb-3">{job.company_name}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {formatDate(job.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.application_count} applications
                        </div>
                      </div>

                      <p className="text-neutral-600 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                        title="View Details & Applications"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        className="p-2 text-neutral-400 hover:text-green-600 transition-colors"
                        title="Edit Job"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {job.application_deadline && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        <strong>Application Deadline:</strong> {formatDate(job.application_deadline)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export default JobListingsPage;