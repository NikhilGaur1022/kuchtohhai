import React, { useEffect, useState } from 'react';
import { Search, Filter, Briefcase, MapPin, Clock, DollarSign, ChevronRight, Plus, Building, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

const JobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string | null>(null);

  const jobTypes = ['All Types', 'full-time', 'part-time', 'contract', 'internship'];
  const experienceLevels = ['All Levels', 'entry', 'mid', 'senior', 'executive'];

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('job_postings')
          .select(`
            *,
            profiles (
              full_name,
              is_verified
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setJobs(data || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
    document.title = 'Jobs | DentalReach';
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJobType = selectedJobType === null || 
      selectedJobType === 'All Types' || 
      job.job_type === selectedJobType;
    
    const matchesExperienceLevel = selectedExperienceLevel === null || 
      selectedExperienceLevel === 'All Levels' || 
      job.experience_level === selectedExperienceLevel;
    
    return matchesSearch && matchesJobType && matchesExperienceLevel;
  });

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
        title="Job Opportunities"
        subtitle="Discover career opportunities in dentistry. Connect with leading dental practices, clinics, and organizations worldwide."
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <SecondaryButton>Browse All Jobs</SecondaryButton>
          {user && (
            <Link to="/jobs/create">
              <PrimaryButton className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
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
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full shadow-md px-6 py-4 pl-12 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="lg:col-span-1">
              <select
                value={selectedJobType || 'All Types'}
                onChange={(e) => setSelectedJobType(e.target.value === 'All Types' ? null : e.target.value)}
                className="w-full rounded-full shadow-md px-6 py-4 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200 bg-white"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All Types' ? type : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Filter */}
            <div className="lg:col-span-1">
              <select
                value={selectedExperienceLevel || 'All Levels'}
                onChange={(e) => setSelectedExperienceLevel(e.target.value === 'All Levels' ? null : e.target.value)}
                className="w-full rounded-full shadow-md px-6 py-4 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200 bg-white"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === 'All Levels' ? level : level.charAt(0).toUpperCase() + level.slice(1)}
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
              <p className="text-neutral-600">Loading jobs...</p>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-neutral-600">
                Showing {filteredJobs.length} of {jobs.length} jobs
                {selectedJobType && selectedJobType !== 'All Types' && (
                  <span> • {selectedJobType.replace('-', ' ')}</span>
                )}
                {selectedExperienceLevel && selectedExperienceLevel !== 'All Levels' && (
                  <span> • {selectedExperienceLevel} level</span>
                )}
                {searchQuery && (
                  <span> matching "{searchQuery}"</span>
                )}
              </p>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-600 mb-2">No jobs found</h3>
                <p className="text-neutral-500 mb-6">
                  {searchQuery || selectedJobType || selectedExperienceLevel 
                    ? 'Try adjusting your search criteria or browse all jobs.'
                    : 'No job postings are available at the moment.'}
                </p>
                {user && (
                  <Link to="/jobs/create">
                    <PrimaryButton className="flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      Post the First Job
                    </PrimaryButton>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        {/* Job Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                              <Link 
                                to={`/jobs/${job.id}`}
                                className="hover:text-dental-600 transition-colors"
                              >
                                {job.title}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <Building className="h-4 w-4" />
                              <span className="font-medium">{job.company_name}</span>
                              {job.profiles?.is_verified && (
                                <span className="text-blue-500 text-xs">✓ Verified</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.job_type)}`}>
                              {job.job_type.replace('-', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceLevelColor(job.experience_level)}`}>
                              {job.experience_level}
                            </span>
                          </div>
                        </div>

                        {/* Job Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>{job.salary_range}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Posted {formatDate(job.created_at)}</span>
                          </div>
                          {job.application_deadline && (
                            <div className="flex items-center text-orange-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Deadline: {formatDate(job.application_deadline)}</span>
                            </div>
                          )}
                        </div>

                        {/* Job Description */}
                        <p className="text-neutral-600 mb-4 line-clamp-3">
                          {job.description}
                        </p>

                        {/* Requirements Preview */}
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-neutral-700 mb-2">Key Requirements:</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.slice(0, 3).map((req, index) => (
                                <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-sm">
                                  {req}
                                </span>
                              ))}
                              {job.requirements.length > 3 && (
                                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-sm">
                                  +{job.requirements.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <Link to={`/jobs/${job.id}`}>
                          <PrimaryButton className="flex items-center gap-2">
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </PrimaryButton>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button (if needed for pagination) */}
        {!isLoading && filteredJobs.length > 0 && (
          <div className="text-center mt-12">
            <SecondaryButton>Load More Jobs</SecondaryButton>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default JobsPage;