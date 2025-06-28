import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Clock, User, Heart, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import PageContainer from '../components/common/PageContainer';
import Card from '../components/common/Card';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import { supabase } from '../lib/supabase';
import type { Article } from '../lib/supabase';

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'All Categories',
    'Clinical Dentistry',
    'Dental Technology',
    'Practice Management',
    'Dental Education',
    'Dental Research',
    'Community Dentistry',
    'Ethics & Practice'
  ];

  // Fetch articles from Supabase
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select(`
            *,
            profiles (
              full_name,
              specialty
            )
          `)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
    document.title = 'Articles | DentalReach';
  }, []);

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      selectedCategory === 'All Categories' || 
      article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
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
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Articles & Research"
        subtitle="Discover the latest insights, research, and clinical knowledge from dental professionals worldwide."
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <SecondaryButton>Browse Categories</SecondaryButton>
          <PrimaryButton>Submit Article</PrimaryButton>
        </div>
      </PageHeader>

      <PageContainer>
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full shadow-md px-6 py-4 pl-12 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-1">
              <select
                value={selectedCategory || 'All Categories'}
                onChange={(e) => setSelectedCategory(e.target.value === 'All Categories' ? null : e.target.value)}
                className="w-full rounded-full shadow-md px-6 py-4 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200 bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
              <p className="text-neutral-600">Loading articles...</p>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-neutral-600">
                Showing {filteredArticles.length} of {articles.length} articles
                {selectedCategory && selectedCategory !== 'All Categories' && (
                  <span> in {selectedCategory}</span>
                )}
                {searchQuery && (
                  <span> matching "{searchQuery}"</span>
                )}
              </p>
            </div>

            {/* Articles List */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-600 mb-2">No articles found</h3>
                <p className="text-neutral-500">
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your search criteria or browse all articles.'
                    : 'No articles have been published yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Article Image */}
                    {article.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Category Badge */}
                      <span className="inline-block px-3 py-1 bg-dental-50 text-dental-600 rounded-full text-sm font-medium mb-3">
                        {article.category}
                      </span>
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                        <Link 
                          to={`/articles/${article.id}`}
                          className="hover:text-dental-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      {/* Author and Meta */}
                      <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{getReadingTime(article.content)} min read</span>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{article.view_count || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{article.likes_count || 0}</span>
                          </div>
                        </div>
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      
                      {/* Read More Link */}
                      <Link 
                        to={`/articles/${article.id}`}
                        className="inline-flex items-center text-dental-600 font-medium hover:text-dental-700 transition-colors"
                      >
                        Read More
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button (if needed for pagination) */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="text-center mt-12">
            <SecondaryButton>Load More Articles</SecondaryButton>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ArticlesPage;