import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bookmark, FileText, MessageSquare } from 'lucide-react';

interface SavedArticle {
  id: number;
  title: string;
  abstract?: string;
  author: string;
  category: string;
  created_at: string;
}

interface SavedThread {
  id: string;
  title: string;
  category: string;
  created_at: string;
}

const SavedItemsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('Please log in to view your saved items.');
      return;
    }
    setLoading(true);
    setError(null);
    // Fetch saved articles
    const fetchSavedArticles = supabase
      .from('saved_articles')
      .select(`id, created_at, articles (id, title, abstract, author, category, created_at)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    // Fetch saved threads
    const fetchSavedThreads = supabase
      .from('saved_threads')
      .select(`id, created_at, threads (id, title, category, created_at)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    Promise.all([fetchSavedArticles, fetchSavedThreads])
      .then(([articlesRes, threadsRes]) => {
        // Articles
        const articles = (articlesRes.data || []).filter((item: any) => item.articles).map((item: any) => ({
          id: item.articles.id,
          title: item.articles.title,
          abstract: item.articles.abstract,
          author: item.articles.author,
          category: item.articles.category,
          created_at: item.articles.created_at,
        }));
        setSavedArticles(articles);
        // Threads
        const threads = (threadsRes.data || []).filter((item: any) => item.threads).map((item: any) => ({
          id: item.threads.id,
          title: item.threads.title,
          category: item.threads.category,
          created_at: item.threads.created_at,
        }));
        setSavedThreads(threads);
      })
      .catch(() => setError('Failed to load saved items. Please try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-8 h-8 animate-bounce text-dental-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading your saved items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-dental-600" /> Saved Items
        </h1>
        {/* Saved Articles */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Saved Articles ({savedArticles.length})
          </h2>
          {savedArticles.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">No saved articles found.</div>
          ) : (
            <ul className="space-y-4">
              {savedArticles.map(article => (
                <li key={article.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <Link to={`/articles/${article.id}`} className="font-medium text-dental-700 hover:underline text-lg">{article.title}</Link>
                    <div className="text-xs text-neutral-500 mt-1">{article.category} • {new Date(article.created_at).toLocaleDateString()}</div>
                    {article.abstract && <div className="text-sm text-neutral-600 mt-1 line-clamp-2">{article.abstract}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Saved Discussions */}
        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" /> Saved Discussions ({savedThreads.length})
          </h2>
          {savedThreads.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">No saved discussions found.</div>
          ) : (
            <ul className="space-y-4">
              {savedThreads.map(thread => (
                <li key={thread.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <Link to={`/forum/${thread.id}`} className="font-medium text-dental-700 hover:underline text-lg">{thread.title}</Link>
                    <div className="text-xs text-neutral-500 mt-1">{thread.category} • {new Date(thread.created_at).toLocaleDateString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default SavedItemsPage;
