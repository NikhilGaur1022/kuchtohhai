import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, Edit, Bell, User, Heart, MessageSquare, 
  Calendar, Award, FileText, Settings, LogOut, Star, 
  Bookmark, BarChart2, Users, TrendingUp, ChevronRight,
  ShieldCheck, ThumbsUp, CheckCircle, Plus, Briefcase, MapPin, Video, Building, Eye
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PageContainer from "../../components/common/PageContainer";
import SectionHeading from '../../components/common/SectionHeading';
import PrimaryButton from '../../components/common/PrimaryButton';
import Card from '../../components/common/Card';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  bio: string | null;
  specialty: string | null;
  years_of_experience: number | null;
  clinic_name: string | null;
  location: string | null;
  website_url: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

interface SavedArticle {
  id: number;
  title: string;
  abstract?: string;
  author: string;
  category: string;
  created_at: string;
}

interface SavedThread {
  id: string;
  title: string;
  category: string;
  created_at: string;
}

interface Thread {
  id: string;
  title: string;
  category: string;
  created_at: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  type: string;
  is_virtual: boolean;
}

interface JobPosting {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  application_count: number;
  created_at: string;
}

interface JobApplication {
  id: number;
  status: string;
  applied_at: string;
  job_postings: {
    id: number;
    title: string;
    company_name: string;
    location: string;
  };
}

const DashboardPage = () => {
  const { user, logout, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [articlesAuthored, setArticlesAuthored] = useState<number | null>(null);
  const [commentsCount, setCommentsCount] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'saved' | 'events' | 'discussions' | 'achievements' | 'settings' | 'job-listings' | 'job-applications'>('dashboard');
  
  // Saved Items state
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
  const [savedError, setSavedError] = useState<string | null>(null);
  
  // My Discussions state
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [myThreads, setMyThreads] = useState<Thread[]>([]);
  const [discussionsError, setDiscussionsError] = useState<string | null>(null);
  
  // My Events state
  const [eventsLoading, setEventsLoading] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Job Listings state
  const [jobListingsLoading, setJobListingsLoading] = useState(false);
  const [myJobListings, setMyJobListings] = useState<JobPosting[]>([]);
  const [jobListingsError, setJobListingsError] = useState<string | null>(null);

  // Job Applications state
  const [jobApplicationsLoading, setJobApplicationsLoading] = useState(false);
  const [myJobApplications, setMyJobApplications] = useState<JobApplication[]>([]);
  const [jobApplicationsError, setJobApplicationsError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Dashboard | DentalReach';

    // Fetch user profile data
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch articles authored count
    const fetchArticlesAuthored = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching articles authored:', error);
        setArticlesAuthored(null);
      } else {
        setArticlesAuthored(count ?? 0);
      }
    };

    // Fetch comments count
    const fetchCommentsCount = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);
      if (error) {
        console.error('Error fetching comments:', error);
        setCommentsCount(null);
      } else {
        setCommentsCount(count ?? 0);
      }
    };

    // Fetch recent activity
    const fetchRecentActivity = async () => {
      if (!user) return;
      
      const activity = [];
      
      // Fetch latest articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      // Fetch latest comments
      const { data: comments } = await supabase
        .from('posts')
        .select('id, content, thread_id, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      // Fetch latest threads
      const { data: threads } = await supabase
        .from('threads')
        .select('id, title, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      // Fetch latest likes
      const { data: likes } = await supabase
        .from('article_likes')
        .select('id, article_id, created_at, articles (title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (articles) activity.push(...articles.map(a => ({ type: 'article', text: `You published "${a.title}"`, time: a.created_at })));
      if (comments) activity.push(...comments.map(c => ({ type: 'comment', text: `You commented: "${c.content.slice(0, 40)}${c.content.length > 40 ? '...' : ''}"`, time: c.created_at })));
      if (threads) activity.push(...threads.map(t => ({ type: 'discussion', text: `You started a discussion: "${t.title}"`, time: t.created_at })));
      if (likes) activity.push(...likes.map(l => {
        const title = Array.isArray(l.articles) && l.articles.length > 0 ? l.articles[0].title : l.articles?.title || 'an article';
        return { type: 'like', text: `You liked "${title}"`, time: l.created_at };
      }));

      // Sort by time desc, take top 5
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activity.slice(0, 5));
    };

    fetchProfile();
    fetchArticlesAuthored();
    fetchCommentsCount();
    fetchRecentActivity();
  }, [user]);

  // Fetch saved items when section is selected
  useEffect(() => {
    if (activeSection !== 'saved' || !user) return;
    setSavedLoading(true);
    setSavedError(null);
    
    const fetchSavedArticles = supabase
      .from('saved_articles')
      .select(`id, created_at, articles (id, title, abstract, author, category, created_at)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    const fetchSavedThreads = supabase
      .from('saved_threads')
      .select(`id, created_at, threads (id, title, category, created_at)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    Promise.all([fetchSavedArticles, fetchSavedThreads])
      .then(([articlesRes, threadsRes]) => {
        const articles: SavedArticle[] = (articlesRes.data || []).filter((item: any) => item.articles).map((item: any) => ({
          id: item.articles.id,
          title: item.articles.title,
          abstract: item.articles.abstract,
          author: item.articles.author,
          category: item.articles.category,
          created_at: item.articles.created_at,
        }));
        setSavedArticles(articles);
        
        const threads: SavedThread[] = (threadsRes.data || []).filter((item: any) => item.threads).map((item: any) => ({
          id: item.threads.id,
          title: item.threads.title,
          category: item.threads.category,
          created_at: item.threads.created_at,
        }));
        setSavedThreads(threads);
      })
      .catch(() => setSavedError('Failed to load saved items. Please try again.'))
      .finally(() => setSavedLoading(false));
  }, [activeSection, user]);

  // Fetch my discussions when section is selected
  useEffect(() => {
    if (activeSection !== 'discussions' || !user) return;
    setDiscussionsLoading(true);
    setDiscussionsError(null);
    
    supabase
      .from('threads')
      .select('id, title, category, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setDiscussionsError('Failed to load your discussions.');
          setMyThreads([]);
        } else {
          setMyThreads((data || []) as Thread[]);
        }
        setDiscussionsLoading(false);
      });
  }, [activeSection, user]);

  // Fetch my events when section is selected
  useEffect(() => {
    if (activeSection !== 'events' || !user) return;
    setEventsLoading(true);
    setEventsError(null);
    
    supabase
      .from('event_registrations')
      .select(`
        id,
        events (
          id,
          title,
          date,
          location,
          type,
          is_virtual
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'registered')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setEventsError('Failed to load your events.');
          setMyEvents([]);
        } else {
          const events: Event[] = (data || [])
            .filter((item: any) => item.events)
            .map((item: any) => item.events);
          setMyEvents(events);
        }
        setEventsLoading(false);
      });
  }, [activeSection, user]);

  // Fetch job listings when section is selected
  useEffect(() => {
    if (activeSection !== 'job-listings' || !user) return;
    setJobListingsLoading(true);
    setJobListingsError(null);
    
    supabase
      .from('job_postings')
      .select('id, title, company_name, location, job_type, application_count, created_at')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setJobListingsError('Failed to load your job listings.');
          setMyJobListings([]);
        } else {
          setMyJobListings((data || []) as JobPosting[]);
        }
        setJobListingsLoading(false);
      });
  }, [activeSection, user]);

  // Fetch job applications when section is selected
  useEffect(() => {
    if (activeSection !== 'job-applications' || !user) return;
    setJobApplicationsLoading(true);
    setJobApplicationsError(null);
    
    supabase
      .from('job_applications')
      .select(`
        id,
        status,
        applied_at,
        job_postings (
          id,
          title,
          company_name,
          location
        )
      `)
      .eq('applicant_id', user.id)
      .order('applied_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setJobApplicationsError('Failed to load your job applications.');
          setMyJobApplications([]);
        } else {
          setMyJobApplications((data || []) as JobApplication[]);
        }
        setJobApplicationsLoading(false);
      });
  }, [activeSection, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-600">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  // Get display name (fallback to email if no full_name)
  const displayName = profile.full_name || user.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="pt-20 pb-16 bg-neutral-50 min-h-screen font-inter">
      <PageContainer>
        <SectionHeading title="Dashboard" />
        
        {/* Welcome header */}
        <div className="bg-dental-600 text-white rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
              <p className="text-dental-100">Your dental knowledge journey continues here.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link to="/submit" className="border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold flex items-center">
                <Edit className="h-4 w-4 mr-2" /> Submit Content
              </Link>
              <PrimaryButton onClick={logout} className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" /> Log Out
              </PrimaryButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            {/* User profile card */}
            <div className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden mb-6">
              <div className="bg-dental-700 h-24 relative">
                <div className="absolute -bottom-12 left-6">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={displayName} 
                      className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-dental-100 flex items-center justify-center border-4 border-white">
                      <User className="h-12 w-12 text-dental-600" />
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-16 px-6 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  {profile.is_verified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" title="Verified User" />
                  )}
                </div>
                <p className="text-neutral-500 capitalize mb-4">{profile.role}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {isAdmin && (
                    <span className="px-3 py-1 bg-dental-100 text-dental-700 rounded-full text-xs font-medium">
                      Admin
                    </span>
                  )}
                  {profile.is_verified && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                  <span className="px-3 py-1 bg-dental-100 text-dental-700 rounded-full text-xs font-medium">
                    Contributor
                  </span>
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                    Level 2
                  </span>
                </div>
                <Link to="/profile" className="btn-outline text-sm w-full justify-center">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Dashboard navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button type="button" onClick={() => setActiveSection('dashboard')} className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left ${activeSection === 'dashboard' ? 'bg-dental-50 text-dental-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <BarChart2 className="h-5 w-5 mr-3" />
                      Dashboard
                    </button>
                  </li>
                  {isAdmin && (
                    <>
                      <li>
                        <Link to="/admin/articles" className="flex items-center px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50">
                          <ShieldCheck className="h-5 w-5 mr-3" />
                          Manage Articles
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/verifications" className="flex items-center px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50">
                          <CheckCircle className="h-5 w-5 mr-3" />
                          Manage Verifications
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button type="button" onClick={() => setActiveSection('saved')} className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left ${activeSection === 'saved' ? 'bg-dental-50 text-dental-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <Bookmark className="h-5 w-5 mr-3" />
                      Saved Items
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setActiveSection('events')} className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left ${activeSection === 'events' ? 'bg-dental-50 text-dental-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <Calendar className="h-5 w-5 mr-3" />
                      My Events
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setActiveSection('discussions')} className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left ${activeSection === 'discussions' ? 'bg-dental-50 text-dental-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <MessageSquare className="h-5 w-5 mr-3" />
                      My Discussions
                    </button>
                  </li>
                  {profile.is_verified && (
                    <li>
                      <Link to="/dashboard/job-listings" className="flex items-center px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50">
                        <Briefcase className="h-5 w-5 mr-3" />
                        Job Listings
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/dashboard/job-applications" className="flex items-center px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50">
                      <FileText className="h-5 w-5 mr-3" />
                      My Job Applications
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={() => setActiveSection('achievements')} className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left ${activeSection === 'achievements' ? 'bg-dental-50 text-dental-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <Award className="h-5 w-5 mr-3" />
                      Achievements
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setActiveSection('settings')} className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left ${activeSection === 'settings' ? 'bg-dental-50 text-dental-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {activeSection === 'dashboard' && (
              <>
                {/* Stats overview */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {[
                    {
                      label: 'Articles Authored',
                      value: articlesAuthored !== null ? articlesAuthored : '—',
                      icon: <BookOpen className="h-7 w-7 text-dental-500" />
                    },
                    {
                      label: 'Comments',
                      value: commentsCount !== null ? commentsCount : '—',
                      icon: <MessageSquare className="h-7 w-7 text-dental-500" />
                    },
                    {
                      label: 'Connections',
                      value: '87',
                      icon: <Users className="h-7 w-7 text-dental-500" />
                    },
                    {
                      label: 'Reputation',
                      value: '312',
                      icon: <Star className="h-7 w-7 text-dental-500" />
                    }
                  ].map((stat, idx) => (
                    <Card key={idx} className="flex flex-col items-center justify-center h-40 w-full p-6 gap-4">
                      {stat.icon}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                        <div className="text-sm text-neutral-500">{stat.label}</div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                <Card>
                  <SectionHeading title="Recent Activity" />
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <p>No recent activity. Start by publishing an article or joining a discussion!</p>
                      </div>
                    ) : (
                      recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50">
                          <div className="mt-1">
                            {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-dental-500" />}
                            {activity.type === 'like' && <Heart className="h-4 w-4 text-dental-500" />}
                            {activity.type === 'thread_like' && <ThumbsUp className="h-4 w-4 text-blue-500" />}
                            {activity.type === 'article' && <FileText className="h-4 w-4 text-dental-500" />}
                            {activity.type === 'discussion' && <BarChart2 className="h-4 w-4 text-dental-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-700">{activity.text}</p>
                            <p className="text-xs text-neutral-500 mt-1">{formatElapsedTime(activity.time)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <SectionHeading title="Quick Actions" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/submit" className="flex items-center p-4 rounded-lg border border-neutral-200 hover:border-dental-300 hover:bg-dental-50 transition-colors">
                      <Plus className="h-8 w-8 text-dental-600 mr-4" />
                      <div>
                        <h3 className="font-medium text-neutral-900">Submit Article</h3>
                        <p className="text-sm text-neutral-600">Share your knowledge with the community</p>
                      </div>
                    </Link>
                    
                    <Link to="/events/create" className="flex items-center p-4 rounded-lg border border-neutral-200 hover:border-dental-300 hover:bg-dental-50 transition-colors">
                      <Calendar className="h-8 w-8 text-dental-600 mr-4" />
                      <div>
                        <h3 className="font-medium text-neutral-900">Create Event</h3>
                        <p className="text-sm text-neutral-600">Organize a webinar or workshop</p>
                      </div>
                    </Link>
                    
                    {profile.is_verified && (
                      <Link to="/jobs/create" className="flex items-center p-4 rounded-lg border border-neutral-200 hover:border-dental-300 hover:bg-dental-50 transition-colors">
                        <Briefcase className="h-8 w-8 text-dental-600 mr-4" />
                        <div>
                          <h3 className="font-medium text-neutral-900">Post a Job</h3>
                          <p className="text-sm text-neutral-600">Find the perfect candidate</p>
                        </div>
                      </Link>
                    )}
                    
                    {!profile.is_verified && (
                      <Link to="/verification/apply" className="flex items-center p-4 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <CheckCircle className="h-8 w-8 text-blue-600 mr-4" />
                        <div>
                          <h3 className="font-medium text-neutral-900">Get Verified</h3>
                          <p className="text-sm text-neutral-600">Apply for verification to create events</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </Card>
              </>
            )}

            {activeSection === 'saved' && (
              <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
                  <Bookmark className="w-7 h-7 text-dental-600" /> Saved Items
                </h1>
                {savedLoading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <Bookmark className="w-8 h-8 animate-bounce text-dental-600 mx-auto mb-4" />
                    <p className="text-neutral-600 ml-2">Loading your saved items...</p>
                  </div>
                ) : savedError ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <p className="text-red-600">{savedError}</p>
                  </div>
                ) : (
                  <>
                    {/* Saved Articles */}
                    <section className="mb-10">
                      <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" /> Saved Articles ({savedArticles.length})
                      </h2>
                      {savedArticles.length === 0 ? (
                        <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">No saved articles found.</div>
                      ) : (
                        <ul className="space-y-4">
                          {savedArticles.map(article => (
                            <li key={article.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <a
                                  href={`/articles/${article.id}`}
                                  className="font-medium text-dental-700 hover:underline text-lg"
                                  onClick={e => { e.preventDefault(); window.location.href = `/articles/${article.id}`; }}
                                >
                                  {article.title}
                                </a>
                                <div className="text-xs text-neutral-500 mt-1">{article.category} • {new Date(article.created_at).toLocaleDateString()}</div>
                                {article.abstract && <div className="text-sm text-neutral-600 mt-1 line-clamp-2">{article.abstract}</div>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                    
                    {/* Saved Discussions */}
                    <section>
                      <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-500" /> Saved Discussions ({savedThreads.length})
                      </h2>
                      {savedThreads.length === 0 ? (
                        <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">No saved discussions found.</div>
                      ) : (
                        <ul className="space-y-4">
                          {savedThreads.map(thread => (
                            <li key={thread.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <Link
                                  to={`/forum/thread/${thread.id}`}
                                  className="font-medium text-dental-700 hover:underline text-lg"
                                >
                                  {thread.title}
                                </Link>
                                <div className="text-xs text-neutral-500 mt-1">{thread.category} • {new Date(thread.created_at).toLocaleDateString()}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </>
                )}
              </div>
            )}

            {activeSection === 'events' && (
              <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-dental-600" /> My Events
                </h1>
                {eventsLoading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <Calendar className="w-8 h-8 animate-bounce text-dental-600 mx-auto mb-4" />
                    <p className="text-neutral-600 ml-2">Loading your events...</p>
                  </div>
                ) : eventsError ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <p className="text-red-600">{eventsError}</p>
                  </div>
                ) : myEvents.length === 0 ? (
                  <div className="bg-white rounded-xl shadow p-6 text-center">
                    <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Events Registered</h3>
                    <p className="text-neutral-500 mb-4">You haven't registered for any events yet.</p>
                    <Link to="/events">
                      <PrimaryButton className="flex items-center gap-2 mx-auto">
                        <Calendar className="h-4 w-4" />
                        Browse Events
                      </PrimaryButton>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {myEvents.map(event => (
                      <li key={event.id} className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              to={`/events/${event.id}`}
                              className="font-medium text-dental-700 hover:underline text-lg"
                            >
                              {event.title}
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-neutral-500 mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                {event.is_virtual ? (
                                  <>
                                    <Video className="w-4 h-4" />
                                    Virtual
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </>
                                )}
                              </div>
                              <span className="px-2 py-1 bg-dental-100 text-dental-700 rounded-full text-xs">
                                {event.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeSection === 'discussions' && (
              <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
                  <MessageSquare className="w-7 h-7 text-dental-600" /> My Discussions
                </h1>
                {discussionsLoading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <MessageSquare className="w-8 h-8 animate-bounce text-dental-600 mx-auto mb-4" />
                    <p className="text-neutral-600 ml-2">Loading your discussions...</p>
                  </div>
                ) : discussionsError ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <p className="text-red-600">{discussionsError}</p>
                  </div>
                ) : myThreads.length === 0 ? (
                  <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">You haven't started any discussions yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {myThreads.map(thread => (
                      <li key={thread.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <Link
                            to={`/forum/thread/${thread.id}`}
                            className="font-medium text-dental-700 hover:underline text-lg"
                          >
                            {thread.title}
                          </Link>
                          <div className="text-xs text-neutral-500 mt-1">{thread.category} • {new Date(thread.created_at).toLocaleDateString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeSection === 'achievements' && (
              <Card>
                <SectionHeading title="Achievements" />
                <div className="text-neutral-500">Your badges and achievements will appear here.</div>
              </Card>
            )}

            {activeSection === 'settings' && (
              <Card>
                <SectionHeading title="Settings" />
                <div className="text-neutral-500">Account and notification settings will appear here.</div>
              </Card>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default DashboardPage;

// Helper function to format elapsed time
function formatElapsedTime(dateString: string) {
  const now = new Date();
  const then = new Date(dateString);
  const diff = (now.getTime() - then.getTime()) / 1000; // seconds
  if (diff < 60) return Math.floor(diff) + ' seconds ago';
  const minutes = diff / 60;
  if (minutes < 60) return Math.floor(minutes) + ' minutes ago';
  const hours = minutes / 60;
  if (hours < 24) return Math.floor(hours) + ' hours ago';
  const days = hours / 24;
  return Math.floor(days) + ' days ago';
}