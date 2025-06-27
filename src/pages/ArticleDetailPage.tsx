import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/common/LoginModal'; // Import the new LoginModal
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Share2, 
  Bookmark, 
  Clock, 
  Calendar,
  User,
  Hash,
  ChevronRight,
  ExternalLink,
  Download,
  Quote,
  MessageCircle,
  ThumbsUp,
  Copy,
  Check
} from 'lucide-react';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [activeTab, setActiveTab] = useState('sections');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [readingTime, setReadingTime] = useState(5);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState(''); // 'like' | 'save' | 'discuss'
  const contentRef = useRef(null);
  
  // Use refs instead of state for tracking view increments
  const viewsIncrementedRef = useRef(false);
  const currentArticleIdRef = useRef(null);

  const tabs = [
    { id: 'sections', label: 'Sections', icon: '📑' },
    { id: 'figures', label: 'Figures', icon: '🖼️' },
    { id: 'references', label: 'References', icon: '📚' }
  ];

  // Function to calculate reading time
  const calculateReadingTime = (text) => {
    if (!text) return 1;
    
    const wordsPerMinute = 200;
    const wordCount = text
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, Math.min(60, minutes));
  };

  // Function to get all text content from article
  const getArticleTextContent = (articleData) => {
    if (!articleData) return '';
    
    let fullText = '';
    
    if (articleData.title) {
      fullText += articleData.title + ' ';
    }
    
    if (articleData.abstract) {
      fullText += articleData.abstract + ' ';
    }
    
    if (articleData.content) {
      fullText += articleData.content + ' ';
    }
    
    if (articleData.methodology) {
      fullText += articleData.methodology + ' ';
    }
    
    if (articleData.conclusions) {
      fullText += articleData.conclusions + ' ';
    }
    
    return fullText;
  };

  useEffect(() => {
    if (id) {
      // Only reset the flag if we're loading a different article
      if (currentArticleIdRef.current !== id) {
        viewsIncrementedRef.current = false;
        currentArticleIdRef.current = id;
      }
      
      fetchArticle();
      fetchRelatedArticles();
      if (user) {
        checkLikeStatus();
        checkSaveStatus();
      }
    }
  }, [id, user]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const sections = contentRef.current.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + 100;
      
      let currentSection = '';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) {
          currentSection = section.getAttribute('data-section');
        }
      });
      
      if (currentSection !== activeSectionId) {
        setActiveSectionId(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSectionId]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('is_approved', true)
        .single();

      if (error) throw error;

      setArticle(data);
      setLikes(data.likes_count || 0);
      
      // Calculate reading time
      const fullText = getArticleTextContent(data);
      const time = calculateReadingTime(fullText);
      setReadingTime(time);

      // Increment view count only once per session for this article
      if (data && !viewsIncrementedRef.current) {
        viewsIncrementedRef.current = true;
        
        try {
          const { error: rpcError } = await supabase.rpc('increment_article_views', {
            article_id_param: parseInt(id),
            user_id_param: user?.id || null
          });
          
          if (rpcError) {
            console.log('RPC increment not available, using direct update');
            const { error: updateError } = await supabase
              .from('articles')
              .update({ 
                view_count: (data.view_count || 0) + 1 
              })
              .eq('id', id);
            
            if (!updateError) {
              setArticle(prev => ({ ...prev, views_count: (prev.views_count || 0) + 1 }));
            }
          } else {
            setArticle(prev => ({ ...prev, views_count: (prev.views_count || 0) + 1 }));
          }
        } catch (directUpdateError) {
          console.log('View count update not available yet');
        }
      }
      
    } catch (err) {
      setError('Article not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, excerpt, author, category, image_url, images, created_at, views_count, likes_count')
        .eq('is_approved', true)
        .neq('id', id)
        .limit(5)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatedArticles(data || []);
    } catch (err) {
      console.error('Error fetching related articles:', err);
      setRelatedArticles([]);
    }
  };

  const checkLikeStatus = async () => {
    if (!user) {
      setIsLiked(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', parseInt(id))
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code === 'PGRST116') {
        setIsLiked(false);
        return;
      }

      setIsLiked(!!data);
    } catch (err) {
      setIsLiked(false);
    }
  };

  const checkSaveStatus = async () => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('article_id', parseInt(id))
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code === 'PGRST116') {
        setIsSaved(false);
        return;
      }

      setIsSaved(!!data);
    } catch (err) {
      setIsSaved(false);
    }
  };

  // Enhanced like function with login modal
  const handleLikeClick = () => {
    if (!user) {
      setLoginAction('like');
      setShowLoginModal(true);
      return;
    }
    toggleLike();
  };

  const toggleLike = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('toggle_article_like', {
        article_id_param: parseInt(id),
        user_id_param: user.id
      });

      if (!error) {
        setIsLiked(data);
        setLikes(prev => data ? prev + 1 : prev - 1);
        
        setArticle(prev => ({
          ...prev,
          likes_count: data ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 0) - 1)
        }));
        return;
      }
    } catch (rpcError) {
      console.log('RPC function not available, trying manual approach');
    }

    try {
      if (isLiked) {
        const { error: deleteError } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', parseInt(id))
          .eq('user_id', user.id);

        if (!deleteError) {
          const newLikesCount = Math.max(0, likes - 1);
          const { error: updateError } = await supabase
            .from('articles')
            .update({ likes_count: newLikesCount })
            .eq('id', id);

          if (!updateError) {
            setIsLiked(false);
            setLikes(newLikesCount);
            setArticle(prev => ({ ...prev, likes_count: newLikesCount }));
          }
        }
      } else {
        const { error: insertError } = await supabase
          .from('article_likes')
          .insert([{
            article_id: parseInt(id),
            user_id: user.id
          }]);

        if (!insertError) {
          const newLikesCount = likes + 1;
          const { error: updateError } = await supabase
            .from('articles')
            .update({ likes_count: newLikesCount })
            .eq('id', id);

          if (!updateError) {
            setIsLiked(true);
            setLikes(newLikesCount);
            setArticle(prev => ({ ...prev, likes_count: newLikesCount }));
          }
        }
      }
    } catch (manualError) {
      console.log('Manual like handling failed, using local state only');
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  // Save article functionality
  const handleSaveClick = () => {
    if (!user) {
      setLoginAction('save');
      setShowLoginModal(true);
      return;
    }
    toggleSave();
  };

  const toggleSave = async () => {
    if (!user) return;

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_articles')
          .delete()
          .eq('article_id', parseInt(id))
          .eq('user_id', user.id);

        if (!error) {
          setIsSaved(false);
        }
      } else {
        const { error } = await supabase
          .from('saved_articles')
          .insert([{
            article_id: parseInt(id),
            user_id: user.id
          }]);

        if (!error) {
          setIsSaved(true);
        }
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  // Cite article functionality
  const handleCiteClick = () => {
    if (!user) {
      setLoginAction('cite');
      setShowLoginModal(true);
      return;
    }
    
    // Navigate to submission page with article data for citation
    const citeParams = new URLSearchParams({
      cite_article_id: id,
      cite_title: article?.title || '',
      cite_author: article?.author || '',
      cite_doi: article?.doi || '',
      cite_year: new Date(article?.created_at).getFullYear().toString()
    });
    
    navigate(`/submit?${citeParams.toString()}`);
  };

  // Discuss functionality
  const handleDiscussClick = async () => {
    if (!user) {
      setLoginAction('discuss');
      setShowLoginModal(true);
      return;
    }

    try {
      // Create a new forum discussion about this article
      const { data, error } = await supabase
        .from('forum_discussions')
        .insert([{
          title: `Discussion: ${article?.title}`,
          content: `Let's discuss this article: "${article?.title}" by ${article?.author}.\n\nWhat are your thoughts on the findings and methodology presented?`,
          author_id: user.id,
          category: 'Clinical Cases',
          related_article_id: parseInt(id)
        }])
        .select()
        .single();

      if (error) throw error;

      // Navigate to the forum with the new discussion
      navigate(`/forum?discussion=${data.id}`);
      
    } catch (err) {
      console.error('Error creating discussion:', err);
      // Fallback: navigate to forum with pre-filled form
      const discussParams = new URLSearchParams({
        new_discussion: 'true',
        title: `Discussion: ${article?.title}`,
        content: `Let's discuss this article: "${article?.title}" by ${article?.author}.\n\nWhat are your thoughts on the findings and methodology presented?`,
        article_id: id
      });
      navigate(`/forum?${discussParams.toString()}`);
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    // Perform the action that was requested
    switch (loginAction) {
      case 'like':
        setTimeout(() => toggleLike(), 100);
        break;
      case 'save':
        setTimeout(() => toggleSave(), 100);
        break;
      case 'cite':
        setTimeout(() => handleCiteClick(), 100);
        break;
      case 'discuss':
        setTimeout(() => handleDiscussClick(), 100);
        break;
    }
    setLoginAction('');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleExport = async () => {
    try {
      const exportContent = `
${article?.title || 'Untitled Article'}
${'='.repeat((article?.title || 'Untitled Article').length)}

Author: ${article?.author || 'Unknown'}
Category: ${article?.category || 'Uncategorized'}
Published: ${formatDate(article?.created_at)}
DOI: ${article?.doi || 'Not available'}

${article?.abstract ? `ABSTRACT\n${'-'.repeat(8)}\n${article.abstract}\n\n` : ''}

${article?.content ? `MAIN CONTENT\n${'-'.repeat(12)}\n${article.content}\n\n` : ''}

${article?.methodology ? `METHODOLOGY\n${'-'.repeat(11)}\n${article.methodology}\n\n` : ''}

${article?.conclusions ? `CONCLUSIONS\n${'-'.repeat(11)}\n${article.conclusions}\n\n` : ''}

Generated from: ${window.location.href}
Generated on: ${new Date().toLocaleDateString()}
      `.trim();

      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${article?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'article'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: article?.title || 'Research Article',
      text: article?.abstract || 'Check out this research article',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\nRead more: ${shareData.url}`
        );
        alert('Article link copied to clipboard!');
      }
    } catch (error) {
      try {
        await copyToClipboard(window.location.href);
        alert('Article link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Share failed:', error);
        alert('Sharing failed. Please copy the URL manually.');
      }
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${article?.title || 'Research Article'} by ${article?.author || 'Unknown Author'}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || 'Research Article');
    const summary = encodeURIComponent(article?.abstract?.substring(0, 200) || 'Check out this research article');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank', 'width=550,height=420');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/articles" className="text-blue-600 hover:text-blue-700">
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'abstract', title: 'Abstract', content: article?.abstract },
    { id: 'main-content', title: 'Main Content', content: article?.content },
    { id: 'methodology', title: 'Methodology', content: article?.methodology },
    { id: 'conclusions', title: 'Conclusions', content: article?.conclusions },
    { id: 'references', title: 'References', content: article?.references }
  ].filter(section => section.content || section.id === 'references');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/articles" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="col-span-12 lg:col-span-8" ref={contentRef}>
            {/* Article Header */}
            <article className="bg-white">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                  <span className="px-2 py-1 bg-blue-100 rounded text-xs font-medium">
                    {article?.category}
                  </span>
                  {article?.doi && (
                    <span className="text-gray-500">DOI: {article.doi}</span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
                  {article?.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{article?.author}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article?.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLikeClick}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                        isLiked 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      {likes}
                    </button>

                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      {article?.views_count || 0}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                {article?.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {article.tags.map((keyword, index) => (
                      <span 
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        <Hash className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Abstract */}
              {article?.abstract && (
                <section id="abstract" data-section="abstract" className="mb-12">
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
                    <p className="text-gray-700 leading-relaxed">
                      {article.abstract}
                    </p>
                  </div>
                </section>
              )}

              {/* Featured Images */}
              {((article?.images && article.images.length > 0) || article?.image_url) && (
                <section className="mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {article?.images && article.images.length > 0 ? (
                      article.images.map((image, index) => (
                        <figure key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                          <img
                            src={image}
                            alt={`Figure ${index + 1}`}
                            className="w-full h-64 object-cover"
                          />
                          <figcaption className="p-4 text-sm text-gray-600">
                            <span className="font-medium">Figure {index + 1}.</span> 
                            {' '}Representative image from the study.
                          </figcaption>
                        </figure>
                      ))
                    ) : article?.image_url ? (
                      <figure className="bg-white rounded-lg shadow-sm border overflow-hidden md:col-span-2">
                        <img
                          src={article.image_url}
                          alt="Article image"
                          className="w-full h-64 object-cover"
                        />
                        <figcaption className="p-4 text-sm text-gray-600">
                          <span className="font-medium">Figure 1.</span> 
                          {' '}Featured image.
                        </figcaption>
                      </figure>
                    ) : null}
                  </div>
                </section>
              )}

              {/* Main Content */}
              <section id="main-content" data-section="main-content" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Main Content</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed space-y-6">
                    {article?.content.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-6 text-lg leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </section>

              {/* Methodology */}
              {article?.methodology && (
                <section id="methodology" data-section="methodology" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Methodology</h2>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {article.methodology}
                    </p>
                  </div>
                </section>
              )}

              {/* Conclusions */}
              {article?.conclusions && (
                <section id="conclusions" data-section="conclusions" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Conclusions</h2>
                  <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                    <p className="text-gray-700 leading-relaxed">
                      {article.conclusions}
                    </p>
                  </div>
                </section>
              )}

              {/* References */}
              {article?.references && Array.isArray(article.references) && article.references.length > 0 && (
                <section id="references" data-section="references" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">References</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <ol className="list-decimal list-inside space-y-4">
                      {article.references.map((ref, index) => {
                        const reference = ref || {};
                        const authors = reference.authors || '';
                        const title = reference.title || '';
                        const journal = reference.journal || '';
                        const volume = reference.volume || '';
                        const issue = reference.issue || '';
                        const pages = reference.pages || '';
                        const year = reference.year || '';
                        const doi = reference.doi || '';
                        
                        return (
                          <li key={index} className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-medium">
                              {Array.isArray(authors) ? authors.join(', ') : authors}
                            </span>
                            {title && (
                              <>
                                {'. '}
                                <em>{title}</em>
                              </>
                            )}
                            {journal && <span className="font-medium"> {journal}</span>}
                            {volume && <span> {volume}</span>}
                            {issue && <span>({issue})</span>}
                            {pages && <span>: {pages}</span>}
                            {year && <span>. {year}</span>}
                            {doi && (
                              <span>. DOI: 
                                <a 
                                  href={`https://doi.org/${doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 ml-1"
                                >
                                  {doi}
                                  <ExternalLink className="w-3 h-3 inline ml-1" />
                                </a>
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </section>
              )}

              {/* Author Bio */}
              <section className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {article?.author?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      About {article?.author}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {article?.profiles?.bio || 
                       `${article?.author} is a dental professional specializing in ${article?.category}. 
                        With extensive experience in clinical practice and research, they contribute 
                        valuable insights to the dental community.`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article?.profiles?.specialization || article?.category}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </article>
          </main>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              {/* Article Actions */}
              

              {/* Navigation Tabs */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
                          activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                  {/* Sections Tab */}
                  {activeTab === 'sections' && (
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                            activeSectionId === section.id
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{section.title}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ))}
                    </nav>
                  )}

                  {/* Figures Tab */}
                  {activeTab === 'figures' && (
                    <div className="space-y-3">
                      {((article?.images && article.images.length > 0) || article?.image_url) ? (
                        (() => {
                          const imagesToShow = article?.images && article.images.length > 0 
                            ? article.images 
                            : article?.image_url 
                              ? [article.image_url] 
                              : [];
                          
                          return imagesToShow.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded overflow-hidden">
                              <img
                                src={image}
                                alt={`Figure ${index + 1}`}
                                className="w-full cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  window.open(image, '_blank');
                                }}
                              />
                              <div className="p-2">
                                <p className="text-xs text-gray-600 font-medium">
                                  Figure {index + 1}
                                </p>
                              </div>
                            </div>
                          ));
                        })()
                      ) : (
                        <p className="text-gray-500 text-sm italic">No figures available</p>
                      )}
                    </div>
                  )}

                  {/* References Tab */}
                  {activeTab === 'references' && (
                    <div className="space-y-3">
                      {article?.references && Array.isArray(article.references) && article.references.length > 0 ? (
                        article.references.map((ref, index) => {
                          const reference = ref || {};
                          const authors = reference.authors || '';
                          const title = reference.title || '';
                          const year = reference.year || '';
                          const doi = reference.doi || '';
                          
                          return (
                            <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                              <p className="text-xs text-gray-700">
                                <span className="font-medium text-blue-600">[{index + 1}]</span>
                                {' '}
                                <span className="font-medium">
                                  {Array.isArray(authors) 
                                    ? (authors.length > 0 ? authors[0] : 'Unknown Author')
                                    : (authors ? authors.split(',')[0] : 'Unknown Author')
                                  }
                                  {Array.isArray(authors) && authors.length > 1 ? ' et al.' : 
                                   (!Array.isArray(authors) && authors && authors.includes(',') ? ' et al.' : '')}
                                </span>
                                {title && (
                                  <>
                                    {' '}
                                    <em>{title}</em>
                                  </>
                                )}
                                {year && <span> ({year})</span>}
                              </p>
                              {doi && (
                                <a
                                  href={`https://doi.org/${doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                                >
                                  View DOI <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 text-sm italic">No references available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Article Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleSaveClick}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                      isSaved 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save Article'}
                  </button>
                  
                  <button 
                    onClick={handleCiteClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    <Quote className="w-4 h-4" />
                    Cite Article
                  </button>
                  
                  <button 
                    onClick={handleDiscussClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discuss
                  </button>
                </div>
              </div>

              {/* Article Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Article Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="font-medium">{article?.views_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Likes</span>
                    <span className="font-medium">{likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reading Time</span>
                    <span className="font-medium">{readingTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="font-medium">{formatDate(article?.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.slice(0, 3).map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        to={`/articles/${relatedArticle.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {((relatedArticle.images && relatedArticle.images.length > 0) || relatedArticle.image_url) && (
                            <img
                              src={
                                relatedArticle.images && relatedArticle.images.length > 0 
                                  ? relatedArticle.images[0] 
                                  : relatedArticle.image_url
                              }
                              alt={relatedArticle.title}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-1">
                              By {relatedArticle.author}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {relatedArticle.views_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {relatedArticle.likes_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link
                    to="/articles"
                    className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View More Articles →
                  </Link>
                </div>
              )}

              {/* Share Options */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Share This Article</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={shareOnTwitter}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                    Twitter
                  </button>
                  <button 
                    onClick={shareOnLinkedIn}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setLoginAction('');
        }}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default ArticleDetailPage;
