import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Eye, Calendar, User } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PrimaryButton from '../../components/common/PrimaryButton';
import { supabase } from '../../lib/supabase';
import type { Article } from '../../lib/supabase';

const AdminArticlePreview = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      // Check if user is admin
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
        return;
      }

      // Fetch article (admin can see any article)
      if (!id) {
        setError('Article ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (articleError) {
          if (articleError.code === 'PGRST116') {
            setError('Article not found');
          } else {
            throw articleError;
          }
          return;
        }

        setArticle(articleData);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch article');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!article) return;

    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ is_approved: true })
        .eq('id', article.id);

      if (updateError) throw updateError;

      setArticle({ ...article, is_approved: true });
      alert('Article approved successfully!');
    } catch (err) {
      alert('Failed to approve article: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleReject = async () => {
    if (!article) return;

    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ is_approved: false })
        .eq('id', article.id);

      if (updateError) throw updateError;

      setArticle({ ...article, is_approved: false });
      alert('Article rejected successfully!');
    } catch (err) {
      alert('Failed to reject article: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-neutral-600">Loading article...</div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Article Not Found</h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Link
                to="/admin/articles"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles Management
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageContainer>
        {/* Admin Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin/articles"
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles Management
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900">Article Preview</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  article.is_approved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {article.is_approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!article.is_approved && (
                <PrimaryButton
                  onClick={handleApprove}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </PrimaryButton>
              )}
              
              {article.is_approved && (
                <button
                  onClick={handleReject}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              )}
              
              <Link
                to={`/articles/${article.id}`}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Public
              </Link>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {article.image_url && (
            <div className="aspect-video overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author}
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {article.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              {article.title}
            </h1>

            <p className="text-lg text-neutral-600 mb-6">
              {article.excerpt}
            </p>

            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-neutral-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default AdminArticlePreview;