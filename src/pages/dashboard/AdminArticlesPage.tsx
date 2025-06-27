import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, Loader, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import PageContainer from '../../components/common/PageContainer';
import { supabase } from '../../lib/supabase';
import type { Article } from '../../lib/supabase';

const AdminArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        navigate('/dashboard');
      }
    };

    checkAdmin();
  }, [navigate]);

  // Fetch all articles including unapproved ones
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*')
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

  const createNotification = async (userId: string, type: string, message: string, reason: string | null) => {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          message,
          reason,
          read: false
        });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  };

  const handleApprove = async (article: Article) => {
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ is_approved: true })
        .eq('id', article.id);

      if (updateError) throw updateError;

      // Update local state
      setArticles(prev => 
        prev.map(a => 
          a.id === article.id 
            ? { ...a, is_approved: true }
            : a
        )
      );

      // Send approval notification to author
      await createNotification(
        article.user_id,
        'article_approved',
        `Your article "${article.title}" has been approved and is now live!`,
        null
      );

      alert('Article approved successfully! Author has been notified.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = (article: Article) => {
    setSelectedArticle(article);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setShowDeleteModal(true);
    setDeleteReason('');
  };

  const handleReject = async () => {
    if (!selectedArticle || !rejectReason.trim()) return;

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ is_approved: false })
        .eq('id', selectedArticle.id);

      if (updateError) throw updateError;

      // Update local state
      setArticles(prev => 
        prev.map(article => 
          article.id === selectedArticle.id 
            ? { ...article, is_approved: false }
            : article
        )
      );

      // Send rejection notification to author with reason
      await createNotification(
        selectedArticle.user_id,
        'article_rejected',
        `Your article "${selectedArticle.title}" was not approved.`,
        rejectReason
      );

      setShowRejectModal(false);
      setSelectedArticle(null);
      setRejectReason('');
      alert('Article rejected and author notified with reason.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedArticle || !deleteReason.trim()) return;

    setIsSubmitting(true);
    try {
      // Send notification to author before deleting
      await createNotification(
        selectedArticle.user_id,
        'article_deleted',
        `Your article "${selectedArticle.title}" has been deleted by an admin.`,
        deleteReason
      );

      // Delete the article
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', selectedArticle.id);

      if (deleteError) throw deleteError;

      // Update local state
      setArticles(prev => 
        prev.filter(article => article.id !== selectedArticle.id)
      );

      setShowDeleteModal(false);
      setSelectedArticle(null);
      setDeleteReason('');
      alert('Article deleted and author notified with reason.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionButtons = (article: Article) => {
    return (
      <div className="flex items-center gap-2">
        {/* View Button */}
        <button
          onClick={() => navigate(`/articles/${article.id}`)}
          className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
          title="View Article"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Approve Button */}
        {!article.is_approved && (
          <button
            onClick={() => handleApprove(article)}
            disabled={isSubmitting}
            className="p-2 text-neutral-400 hover:text-green-600 transition-colors disabled:opacity-50"
            title="Approve Article"
          >
            <Check className="w-4 h-4" />
          </button>
        )}

        {/* Reject Button */}
        <button
          onClick={() => handleRejectClick(article)}
          disabled={isSubmitting}
          className="p-2 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title={article.is_approved ? "Revoke Approval" : "Reject Article"}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => handleDeleteClick(article)}
          disabled={isSubmitting}
          className="p-2 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Delete Article"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-dental-600 mx-auto mb-4" />
              <div className="text-neutral-600">Loading articles...</div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Manage Articles"
        subtitle="Review and approve submitted articles"
      />
      <PageContainer>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Articles</p>
                <p className="text-2xl font-bold text-neutral-900">{articles.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {articles.filter(a => !a.is_approved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Loader className="w-6 h-6 text-yellow-600" />
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
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      No articles found. Articles will appear here when users submit them.
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
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
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {article.author}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          article.is_approved 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {article.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getActionButtons(article)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {selectedArticle.is_approved ? 'Revoke Approval' : 'Reject Article'}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-neutral-600 mb-2">
                  <strong>Article:</strong> {selectedArticle.title}
                </p>
                <p className="text-sm text-neutral-600 mb-4">
                  <strong>Author:</strong> {selectedArticle.author}
                </p>
              </div>
              <p className="text-neutral-600 mb-4">
                Please provide a reason for {selectedArticle.is_approved ? 'revoking approval' : 'rejecting'} this article. 
                This will be sent to the author.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                rows={4}
                required
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedArticle(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      {selectedArticle.is_approved ? 'Revoke' : 'Reject'} Article
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default AdminArticlesPage;