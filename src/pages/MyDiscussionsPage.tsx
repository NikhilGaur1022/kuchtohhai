import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  category: string;
  created_at: string;
}

const MyDiscussionsPage = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('Please log in to view your discussions.');
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from('threads')
      .select('id, title, category, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('Failed to load your discussions.');
          setThreads([]);
        } else {
          setThreads(data || []);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 animate-bounce text-dental-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading your discussions...</p>
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
          <MessageSquare className="w-7 h-7 text-dental-600" /> My Discussions
        </h1>
        {threads.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">You haven't started any discussions yet.</div>
        ) : (
          <ul className="space-y-4">
            {threads.map(thread => (
              <li key={thread.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <Link to={`/forum/${thread.id}`} className="font-medium text-dental-700 hover:underline text-lg">{thread.title}</Link>
                  <div className="text-xs text-neutral-500 mt-1">{thread.category} • {new Date(thread.created_at).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyDiscussionsPage;
