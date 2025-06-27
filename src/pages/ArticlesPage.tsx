import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChevronRight, Filter } from 'lucide-react';
import YearDropdown from '../components/articles/YearDropdown';
import PageHeader from '../components/common/PageHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import PageContainer from '../components/common/PageContainer';
import { supabase } from '../lib/supabase';
import type { Article } from '../lib/supabase';

const CATEGORIES = [
  'Clinical Dentistry',
  'Dental Technology',
  'Practice Management',
  'Dental Education',
  'Dental Research',
  'Community Dentistry'
];

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles from Supabase
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setArticles(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Extract years from articles
  const years = Array.from(new Set(articles.map(a => new Date(a.created_at).getFullYear()))).sort((a, b) => b - a);

  // Filter articles based on category, search query, and year
  const filteredArticles = articles.filter(article => {
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear || new Date(article.created_at).getFullYear() === selectedYear;
    return matchesCategory && matchesSearch && matchesYear;
  });

  useEffect(() => {
    document.title = 'Articles | DentalReach';
  }, []);

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-neutral-600">Loading articles...</div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-600">{error}</div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className=" pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Dental Articles"
        subtitle="Discover the latest insights, research, and techniques in dentistry from experts around the world."
      />
      <PageContainer>
        <section className="py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters - Mobile */}
            <div className="md:hidden mb-6">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-neutral-200 shadow-md"
              >
                <span className="font-medium flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Articles
                </span>
                <ChevronRight className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
              </button>
              
              {showFilters && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-md">
                  <h3 className="font-semibold text-lg mb-3">Categories</h3>
                  <div className="space-y-2">
                    <SecondaryButton
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm w-full text-left ${selectedCategory === null ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      All Categories
                    </SecondaryButton>
                    {CATEGORIES.map(category => (
                      <SecondaryButton
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${selectedCategory === category ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                      >
                        {category}
                      </SecondaryButton>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Filters - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    <SecondaryButton
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm w-full text-left ${selectedCategory === null ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      All Categories
                    </SecondaryButton>
                    {CATEGORIES.map(category => (
                      <SecondaryButton
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${selectedCategory === category ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                      >
                        {category}
                      </SecondaryButton>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 p-6">
                  <h3 className="font-semibold text-lg mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Implants', 'Digital', 'Orthodontics', 'Endodontics', 'Aesthetics', 'Pediatric'].map(tag => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Articles Grid */}
            <div className="flex-1">
              {/* Category title */}
              <div className="mb-6">
                <h2 className="text-3xl font-semibold">
                  {selectedCategory || 'All Articles'} 
                  <span className="text-neutral-500 ml-2 text-lg">({filteredArticles.length})</span>
                </h2>
              </div>
              
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                </div>
                <YearDropdown years={years} selectedYear={selectedYear} onChange={setSelectedYear} />
              </div>

              {/* Articles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.id}`}
                    className="block bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-dental-50 text-dental-700 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="flex items-center text-neutral-500 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-neutral-600 line-clamp-3">{article.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-neutral-500">By {article.author}</span>
                        <span className="text-dental-600 font-medium flex items-center">
                          Read more
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600">No articles found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
};

export default ArticlesPage;