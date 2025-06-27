import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Eye, Clock, Check, X, Plus, Loader, FileText, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import PageContainer from '../components/common/PageContainer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Article } from '../lib/supabase';

const MyArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyArticles = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setArticles(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch your articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyArticles();
    document.title = 'My Articles | DentalReach';
  }, [user, navigate]);

  const handleDeleteArticle = async (articleId: number, articleTitle: string) => {
    if (!user) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setDeletingId(articleId);
    try {
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setArticles(prev => prev.filter(article => article.id !== articleId));
      
      // Show success message
      alert('Article deleted successfully!');
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (article: Article) => {
    if (article.is_approved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          <Check className="w-3 h-3" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Pending Review
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-dental-600 mx-auto mb-4" />
              <p className="text-neutral-600">Loading your articles...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="My Articles"
        subtitle="Manage and edit your submitted articles"
      />
      <PageContainer>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Articles</p>
                <p className="text-2xl font-bold text-neutral-900">{articles.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {articles.filter(a => a.is_approved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {articles.filter(a => !a.is_approved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-dental-600 text-white px-4 py-2 rounded-lg hover:bg-dental-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit New Article
          </Link>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No articles yet</h3>
            <p className="text-neutral-600 mb-6">
              You haven't submitted any articles yet. Start sharing your knowledge with the community!
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-dental-600 text-white px-6 py-2 rounded-lg hover:bg-dental-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Submit Your First Article
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Article</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Views</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-neutral-900 line-clamp-2">
                            {article.title}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 line-clamp-1">
                            {article.excerpt}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {article.views_count || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button - only for approved articles */}
                          {article.is_approved && (
                            <button
                              onClick={() => navigate(`/articles/${article.id}`)}
                              className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                              title="View Article"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Button - available for all articles */}
                          <button
                            onClick={() => navigate(`/edit-article/${article.id}`)}
                            className="p-2 text-neutral-400 hover:text-yellow-600 transition-colors"
                            title="Edit Article"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteArticle(article.id, article.title)}
                            disabled={deletingId === article.id}
                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete Article"
                          >
                            {deletingId === article.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Article Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Articles are reviewed by our editorial team before publication</li>
            <li>• You can edit your articles anytime, but they'll need re-approval after editing</li>
            <li>• Approved articles are visible to the entire community</li>
            <li>• You'll receive notifications about your article status changes</li>
          </ul>
        </div>
      </PageContainer>
    </div>
  );
};

export default MyArticlesPage;