import { useEffect, useState } from 'react';
import { MessageSquare, Plus, ChevronRight, MessageCircle, ThumbsUp, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import SectionHeading from '../components/common/SectionHeading';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import LoginModal from '../components/common/LoginModal'; // Add this import
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Thread {
  id: string;
  title: string;
  author_id: string;
  category: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
}

const ForumPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Add login modal state
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replyCounts, setReplyCounts] = useState<{ [threadId: string]: number }>({});
  const [likeCounts, setLikeCounts] = useState<{ [threadId: string]: number }>({});
  const [authorNames, setAuthorNames] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filtering, setFiltering] = useState(false); // for optional spinner
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'mostReplies' | 'mostLiked'>('newest');

  // Define categories array (was missing in original)
  const categories = [
    { name: 'Clinical Cases' },
    { name: 'Practice Management' },
    { name: 'Dental Technology' },
    { name: 'Student Corner' },
    { name: 'Product Discussion' },
    { name: 'Career Development' }
  ];

  // Compute unique categories from fetched threads
  const threadCategories = Array.from(new Set(threads.map(t => t.category))).sort();

  // Filtering logic (client-side)
  const filteredThreads = threads.filter(thread => {
    const matchesCategory = selectedCategory === 'All' || thread.category === selectedCategory;
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting logic for threads
  function getSortedThreads(threads: Thread[]) {
    if (sortOption === 'newest') {
      return [...threads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'oldest') {
      return [...threads].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'mostReplies') {
      return [...threads].sort((a, b) => (replyCounts[b.id] || 0) - (replyCounts[a.id] || 0));
    } else if (sortOption === 'mostLiked') {
      return [...threads].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));
    }
    return threads;
  }

  // Optional: show spinner for a short time when filtering
  useEffect(() => {
    if (loading) return;
    setFiltering(true);
    const timeout = setTimeout(() => setFiltering(false), 200); // 200ms fake spinner
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, loading]);

  useEffect(() => {
    document.title = 'Forum | DentalReach';
    fetchAll();
    
    // Check URL parameters for pre-filled discussion (for "Discuss" button from articles)
    const urlParams = new URLSearchParams(location.search);
    const shouldShowNewDiscussion = urlParams.get('new_discussion');
    const prefilledTitle = urlParams.get('title');
    const prefilledContent = urlParams.get('content');
    
    if (shouldShowNewDiscussion === 'true') {
      if (!user) {
        setShowLoginModal(true);
      } else {
        setNewDiscussion({
          title: prefilledTitle || '',
          content: prefilledContent || '',
          category: 'Clinical Cases'
        });
        setShowNewDiscussionModal(true);
      }
      
      // Clean up URL
      navigate('/forum', { replace: true });
    }
  }, [location.search, user, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    // Fetch threads
    const { data: threadsData, error: threadsError } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false });
    if (threadsError) {
      setError('Failed to load discussions.');
      setThreads([]);
      setLoading(false);
      return;
    }
    setThreads(threadsData || []);
    // Fetch all posts for reply counts and like counts
    const threadIds = (threadsData || []).map((t: Thread) => t.id);
    let postsData: any[] = [];
    if (threadIds.length > 0) {
      const { data: posts } = await supabase
        .from('posts')
        .select('id,thread_id,author_id,parent_id,created_at')
        .in('thread_id', threadIds);
      postsData = posts || [];
    }
    // Count replies per thread
    const replyCountMap: { [threadId: string]: number } = {};
    postsData.forEach(post => {
      replyCountMap[post.thread_id] = (replyCountMap[post.thread_id] || 0) + 1;
    });
    setReplyCounts(replyCountMap);
    // --- FIX: Count likes for all posts in each thread ---
    let likeCountMap: { [threadId: string]: number } = {};
    const allPostIds = postsData.map(p => p.id);
    if (allPostIds.length > 0) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id,is_like')
        .in('post_id', allPostIds);
      // Aggregate likes per thread
      (threadsData || []).forEach((thread: Thread) => {
        const postIdsForThread = postsData.filter(p => p.thread_id === thread.id).map(p => p.id);
        likeCountMap[thread.id] = (likes || []).filter(l => postIdsForThread.includes(l.post_id) && l.is_like).length;
      });
    }
    setLikeCounts(likeCountMap);
    // Fetch author names from profiles
    const authorIds = Array.from(new Set((threadsData || []).map((t: Thread) => t.author_id)));
    let authorNameMap: { [userId: string]: string } = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,full_name')
        .in('id', authorIds);
      (profiles || []).forEach((profile: Profile) => {
        authorNameMap[profile.id] = profile.full_name || 'Unknown';
      });
    }
    setAuthorNames(authorNameMap);
    setLoading(false);
  };

  // Helper for relative time
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // Enhanced click handler for "Start Discussion" button
  const handleNewDiscussionClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowNewDiscussionModal(true);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    // If there were URL parameters for a new discussion, show the modal
    const urlParams = new URLSearchParams(location.search);
    const shouldShowNewDiscussion = urlParams.get('new_discussion');
    
    if (shouldShowNewDiscussion === 'true') {
      const prefilledTitle = urlParams.get('title');
      const prefilledContent = urlParams.get('content');
      
      setNewDiscussion({
        title: prefilledTitle || '',
        content: prefilledContent || '',
        category: 'Clinical Cases'
      });
      setShowNewDiscussionModal(true);
      navigate('/forum', { replace: true });
    } else {
      // Just show the new discussion modal
      setShowNewDiscussionModal(true);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const { title, category } = newDiscussion;
      
      // Insert the thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .insert([{
          title,
          category,
          author_id: user.id
        }])
        .select()
        .single();

      if (threadError) throw threadError;

      // If there's content, create the first post
      if (newDiscussion.content.trim()) {
        const { error: postError } = await supabase
          .from('posts')
          .insert([{
            thread_id: threadData.id,
            author_id: user.id,
            content: newDiscussion.content.trim(),
            parent_id: null
          }]);

        if (postError) {
          console.error('Failed to create initial post:', postError);
          // Continue anyway, thread was created
        }
      }

      setShowNewDiscussionModal(false);
      setNewDiscussion({ title: '', content: '', category: '' });
      
      // Refresh the discussions
      await fetchAll();
      
    } catch (err) {
      console.error('Error creating discussion:', err);
      setError('Failed to create discussion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16 font-inter">
      <PageHeader
        title="Dental Community Forum"
        subtitle="Connect with dental professionals worldwide. Share experiences, ask questions, and grow together."
      >
        <div className="flex justify-center gap-4">
          <SecondaryButton onClick={handleNewDiscussionClick} className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Start Discussion
          </SecondaryButton>
          <PrimaryButton onClick={() => window.scrollTo({ top: document.getElementById('discussions')?.offsetTop, behavior: 'smooth' })} className="flex items-center">
            <ChevronRight className="h-5 w-5 mr-2" />
            Browse Topics
          </PrimaryButton>
        </div>
        <div className="max-w-xl mx-auto w-full mt-6">
          <SearchBar
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </PageHeader>

      <PageContainer className="py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories (now used for filtering) */}
          <div className="lg:w-1/4">
            <Card className="border border-neutral-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full flex items-center px-2 py-2 rounded-xl transition-colors gap-3 font-medium ${selectedCategory === 'All' ? 'bg-dental-50 text-dental-600' : 'hover:bg-neutral-50 text-neutral-700'}`}
                  >
                    <span className="text-dental-600 flex-shrink-0 w-5 text-left"><MessageSquare className="h-5 w-5" /></span>
                    <span className="flex-grow min-w-0 text-left">All</span>
                  </button>
                  {threadCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center px-2 py-2 rounded-xl transition-colors gap-3 font-medium ${selectedCategory === category ? 'bg-dental-50 text-dental-600' : 'hover:bg-neutral-50 text-neutral-700'}`}
                    >
                      <span className="text-dental-600 flex-shrink-0 w-5 text-left"><MessageSquare className="h-5 w-5" /></span>
                      <span className="flex-grow min-w-0 text-left">{category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Discussions */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <SectionHeading title="Discussions" />
                <div className="flex items-center">
                  <label className="mr-2 text-sm text-neutral-600">Sort by:</label>
                  <select
                    className="border border-neutral-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-dental-500"
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as any)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostReplies">Most Replies</option>
                    <option value="mostLiked">Most Liked</option>
                  </select>
                </div>
              </div>
              {loading || filtering ? (
                <div className="text-center py-8 text-neutral-500">
                  <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-dental-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Loading discussions...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <div className="space-y-6">
                  {filteredThreads.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-100">
                      <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No discussions found</h3>
                      <p className="text-neutral-600 mb-4">
                        {searchQuery || selectedCategory !== 'All' 
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to start a discussion!'
                        }
                      </p>
                      <button
                        onClick={handleNewDiscussionClick}
                        className="btn-primary inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Discussion
                      </button>
                    </div>
                  )}
                  {getSortedThreads(filteredThreads)
                    .map((thread) => (
                      <Link key={thread.id} to={`/forum/thread/${thread.id}`} className="block">
                        <Card className="hover:shadow-lg transition-all duration-200 ease-in-out border border-neutral-100 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{thread.title}</h3>
                              <div className="flex items-center text-sm text-neutral-500 mb-2 gap-2 flex-wrap">
                                <span className="mr-2">By {authorNames[thread.author_id] || 'Unknown'}</span>
                                <span>• {timeAgo(thread.created_at)}</span>
                                <span className="flex items-center gap-1 ml-2"><MessageCircle className="h-4 w-4" /> {replyCounts[thread.id] || 0} replies</span>
                                <span className="flex items-center gap-1 ml-2"><ThumbsUp className="h-4 w-4" /> {likeCounts[thread.id] || 0} likes</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs font-medium text-dental-600 bg-dental-50 px-2.5 py-1 rounded-full">
                                {thread.category}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* New Discussion Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl transition-all duration-200">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Start a New Discussion</h3>
              <button 
                onClick={() => setShowNewDiscussionModal(false)} // FIXED: was calling (true)
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
                  required
                  placeholder="What would you like to discuss?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={newDiscussion.category}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200 ease-in-out focus:border-dental-500 hover:border-dental-600"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, idx) => (
                    <option key={idx} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Content (Optional)
                </label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 min-h-[120px] transition-colors duration-200"
                  placeholder="Share your thoughts, ask questions, or start a conversation..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewDiscussionModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        redirectPath={window.location.pathname + window.location.search}
      />
    </div>
  );
};

export default ForumPage;