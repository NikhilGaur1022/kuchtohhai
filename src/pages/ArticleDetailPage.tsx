import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Eye, Heart, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Article } from '../lib/supabase';

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!id) {
      navigate('/articles');
      return;
    }

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        // Fetch article with profile data
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select(`
            *,
            profiles (
              full_name,
              specialty,
              bio
            )
          `)
          .eq('id', id)
          .eq('is_approved', true)
          .single();

        if (articleError) {
          if (articleError.code === 'PGRST116') {
            setError('Article not found or not approved');
          } else {
            throw articleError;
          }
          return;
        }

        setArticle(articleData);
        setLikesCount(articleData.likes_count || 0);

        // Increment view count
        if (user) {
          await supabase.rpc('increment_article_views', {
            article_id_param: parseInt(id),
            user_id_param: user.id
          });
        }

        // Check if user has liked this article
        if (user) {
          const { data: likeData } = await supabase
            .from('article_likes')
            .select('id')
            .eq('article_id', id)
            .eq('user_id', user.id)
            .single();

          setIsLiked(!!likeData);

          // Check if user has saved this article
          const { data: savedData } = await supabase
            .from('saved_articles')
            .select('id')
            .eq('article_id', id)
            .eq('user_id', user.id)
            .single();

          setIsSaved(!!savedData);
        }

      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!user || !article) return;

    try {
      const { data: result } = await supabase.rpc('toggle_article_like', {
        article_id_param: article.id,
        user_id_param: user.id
      });

      setIsLiked(result);
      setLikesCount(prev => result ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !article) return;

    try {
      if (isSaved) {
        // Remove from saved
        await supabase
          .from('saved_articles')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        setIsSaved(false);
      } else {
        // Add to saved
        await supabase
          .from('saved_articles')
          .insert({
            article_id: article.id,
            user_id: user.id
          });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

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

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
        <div className="container-custom max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Article Not Found</h1>
            <p className="text-neutral-600 mb-6">{error || 'The article you\'re looking for doesn\'t exist.'}</p>
            <Link 
              to="/articles" 
              className="inline-flex items-center text-dental-600 hover:text-dental-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50">
      <div className="container-custom max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/articles" 
            className="inline-flex items-center text-dental-600 hover:text-dental-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Link>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Featured Image */}
          {article.image_url && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 bg-dental-50 text-dental-600 rounded-full text-sm font-medium mb-4">
              {article.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 mb-6 pb-6 border-b border-neutral-200">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{getReadingTime(article.content)} min read</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{article.view_count || 0} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            {user && (
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSaved 
                      ? 'bg-dental-50 text-dental-600 hover:bg-dental-100' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 fill-current" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-neutral-700">
                {article.content}
              </div>
            </div>

            {/* Author Bio */}
            {article.profiles && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-xl font-semibold mb-4">About the Author</h3>
                <div className="bg-neutral-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-dental-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-dental-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 mb-1">
                        {article.profiles.full_name || article.author}
                      </h4>
                      {article.profiles.specialty && (
                        <p className="text-dental-600 text-sm mb-2">{article.profiles.specialty}</p>
                      )}
                      {article.profiles.bio && (
                        <p className="text-neutral-600 text-sm">{article.profiles.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Articles Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Placeholder for related articles */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-32 bg-neutral-200 rounded-lg mb-4"></div>
              <h3 className="font-semibold mb-2">Related Article Title</h3>
              <p className="text-neutral-600 text-sm">Coming soon...</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-32 bg-neutral-200 rounded-lg mb-4"></div>
              <h3 className="font-semibold mb-2">Related Article Title</h3>
              <p className="text-neutral-600 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;