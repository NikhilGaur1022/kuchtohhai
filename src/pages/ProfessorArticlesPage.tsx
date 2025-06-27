import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Eye, 
  Heart, 
  Clock, 
  BookOpen,
  TrendingUp,
  Tag,
  ChevronDown,
  Grid,
  List
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer';
import { supabase } from '../lib/supabase';

// Type definitions
interface Professor {
  id: string;
  full_name: string;
  position: string;
  institution: string;
  specialty: string;
  avatar_url?: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  abstract?: string;
  category: string;
  created_at: string;
  views_count: number;
  likes_count: number;
  images?: string[];
  image_url?: string;
  user_id: string;
  is_approved: boolean;
}

interface SuggestedArticle extends Article {
  profiles?: {
    full_name: string;
    specialty: string;
  };
}

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'popular' | 'liked';

const ProfessorArticlesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [suggestedArticles, setSuggestedArticles] = useState<SuggestedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchProfessorData();
      fetchArticles();
      fetchSuggestedArticles();
    }
  }, [id]);

  const fetchProfessorData = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, position, institution, specialty, avatar_url')
        .eq('id', id)
        .eq('is_professor', true)
        .single();

      if (error) throw error;
      setProfessor(data as Professor);
    } catch (error) {
      console.error('Error fetching professor:', error);
    }
  };

  const fetchArticles = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('articles')
        .select('*')
        .eq('user_id', id)
        .eq('is_approved', true);

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'popular') {
        query = query.order('views_count', { ascending: false });
      } else if (sortBy === 'liked') {
        query = query.order('likes_count', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredArticles = (data as Article[]) || [];

      // Apply search filter
      if (searchTerm) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        filteredArticles = filteredArticles.filter(article =>
          article.category === selectedCategory
        );
      }

      setArticles(filteredArticles);

      // Extract unique categories
      const allArticles = (data as Article[]) || [];
      const uniqueCategories = [...new Set(allArticles.map(article => article.category).filter(Boolean))];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedArticles = async () => {
    if (!id) return;

    try {
      // Fetch articles from other professors in similar specialties
      const { data: professorData } = await supabase
        .from('profiles')
        .select('specialty')
        .eq('id', id)
        .single();

      if (professorData?.specialty) {
        const { data: suggestedData } = await supabase
          .from('articles')
          .select(`
            *,
            profiles!inner(full_name, specialty)
          `)
          .eq('profiles.specialty', professorData.specialty)
          .neq('user_id', id)
          .eq('is_approved', true)
          .order('views_count', { ascending: false })
          .limit(5);

        setSuggestedArticles((suggestedData as SuggestedArticle[]) || []);
      }
    } catch (error) {
      console.error('Error fetching suggested articles:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, selectedCategory, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: string) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const getInitials = (name: string | undefined) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'PR';
  };

  if (loading && !articles.length) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-20 pb-16">
          <PageContainer>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading articles...</p>
              </div>
            </div>
          </PageContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={`/professors/${id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Professor Profile
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Professor Info Banner */}
      {professor && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl overflow-hidden">
                {professor.avatar_url ? (
                  <img
                    src={professor.avatar_url}
                    alt={professor.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <span className="text-xl font-bold">
                      {getInitials(professor.full_name)}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Articles by {professor.full_name}
                </h1>
                <div className="flex items-center gap-4 text-white/90">
                  <span>{professor.position}</span>
                  <span>•</span>
                  <span>{professor.institution}</span>
                  <span>•</span>
                  <span>{articles.length} articles</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="col-span-12 lg:col-span-8">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="liked">Most Liked</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Articles Grid/List */}
            <div className="space-y-6">
              {articles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'This professor hasn\'t published any articles yet'}
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                  : 'space-y-6'
                }>
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.id}`}
                      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
                    >
                      {/* Article Image */}
                      {((article.images && article.images.length > 0) || article.image_url) && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={
                              article.images && article.images.length > 0 
                                ? article.images[0] 
                                : article.image_url
                            }
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        {/* Category Tag */}
                        {article.category && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Tag className="w-3 h-3 mr-1" />
                              {article.category}
                            </span>
                          </div>
                        )}

                        {/* Article Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Article Excerpt */}
                        {article.abstract && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {article.abstract}
                          </p>
                        )}

                        {/* Article Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(article.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{calculateReadingTime(article.content)} min read</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.views_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{article.likes_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              {/* Professor Quick Info */}
              {professor && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {getInitials(professor.full_name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{professor.full_name}</h3>
                      <p className="text-gray-600 text-sm">{professor.position}</p>
                    </div>
                  </div>
                  <Link
                    to={`/professors/${id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Profile
                  </Link>
                </div>
              )}

              {/* Article Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Article Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Articles</span>
                    <span className="font-semibold text-blue-600">{articles.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold text-green-600">
                      {articles.reduce((sum, article) => sum + (article.views_count || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Likes</span>
                    <span className="font-semibold text-red-600">
                      {articles.reduce((sum, article) => sum + (article.likes_count || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-semibold text-purple-600">{categories.length}</span>
                  </div>
                </div>
              </div>

              {/* Suggested Articles */}
              {suggestedArticles.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {suggestedArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/articles/${article.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {((article.images && article.images.length > 0) || article.image_url) && (
                            <img
                              src={
                                article.images && article.images.length > 0 
                                  ? article.images[0] 
                                  : article.image_url
                              }
                              alt={article.title}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-1">
                              By {article.profiles?.full_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {article.likes_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfessorArticlesPage;
