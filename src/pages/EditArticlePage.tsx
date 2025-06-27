import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import PageContainer from '../components/common/PageContainer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  'Clinical Dentistry',
  'Dental Technology',
  'Practice Management',
  'Dental Education',
  'Dental Research',
  'Community Dentistry'
];

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image_url: string;
}

const EditArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    image_url: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false); // Track if article was originally approved

  useEffect(() => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    const fetchArticle = async () => {
      try {
        // Fetch article and check if user can edit it
        const { data: article, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id) // Only allow editing own articles
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Article not found or you do not have permission to edit it.');
          } else {
            throw fetchError;
          }
          return;
        }

        // Check if article is rejected (allow editing only rejected articles)
        if (article.is_approved) {
          // For approved articles, show warning that editing will revoke approval
          // We'll allow editing but warn the user
          setIsApproved(true);
        }

        setForm({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          category: article.category,
          image_url: article.image_url || '',
        });

      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    document.title = 'Edit Article | DentalReach';
  }, [user, id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          ...form,
          is_approved: false, // Reset to pending approval after edit
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      if (isApproved) {
        alert('Article updated successfully! Since you edited an approved article, it has been resubmitted for approval.');
      } else {
        alert('Article updated successfully! It has been resubmitted for approval.');
      }
      navigate('/my-articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-dental-600 mx-auto mb-4" />
              <p className="text-neutral-600">Loading article...</p>
            </div>
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
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Unable to Edit Article</h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Link
                to="/my-articles"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to My Articles
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Edit Your Article"
        subtitle="Update your article and resubmit for approval."
      />
      <PageContainer>
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/my-articles"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Articles
          </Link>
        </div>

        {/* Notice */}
        <div className={`border rounded-lg p-4 mb-6 ${
          isApproved 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm ${isApproved ? 'text-orange-800' : 'text-yellow-800'}`}>
            <strong>Note:</strong> {isApproved 
              ? 'This article is currently approved and live. Editing it will revoke its approval and require admin review again.'
              : 'After updating your article, it will be resubmitted for admin approval.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 text-base font-normal transition-colors duration-200"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="author" className="block text-sm font-medium text-neutral-700 mb-1">
                Author Name *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-neutral-700 mb-1">
                Featured Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700 mb-1">
                Article Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
                rows={3}
                placeholder="A brief summary of your article..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">
                Article Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
                rows={12}
                placeholder="Write your full article content here..."
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <Link
              to="/my-articles"
              className="px-6 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </Link>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Article
                </>
              )}
            </PrimaryButton>
          </div>
        </form>
      </PageContainer>
    </div>
  );
};

export default EditArticlePage;