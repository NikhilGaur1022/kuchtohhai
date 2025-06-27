import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, Share2, Edit, Trash2, MoreVertical } from 'lucide-react';
import LoginModal from '../components/common/LoginModal'; // Add login modal
import ReportModal from '../components/common/ReportModal';
import { toast } from 'react-hot-toast';

interface Thread {
  id: string;
  title: string;
  author_id: string;
  category: string;
  created_at: string;
  view_count?: number;
}

interface Post {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  is_deleted?: boolean; // Soft delete flag
}

interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  is_like: boolean;
}

const ThreadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postLikes, setPostLikes] = useState<PostLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Post | null>(null);
  const [sortOption, setSortOption] = useState<'oldest' | 'newest' | 'mostLiked'>('oldest');
  const [viewCounted, setViewCounted] = useState(false);
  const [authorMap, setAuthorMap] = useState<Map<string, string>>(new Map()); // uuid -> username
  const [usernameSet, setUsernameSet] = useState<Set<string>>(new Set()); // for mention highlighting
  const [showLoginModal, setShowLoginModal] = useState(false); // Add login modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  // New state for upgrades
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [threadDeleted, setThreadDeleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  // Add state for post action menu
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  // Add state to track collapsed replies
  const [collapsedReplies, setCollapsedReplies] = useState<{ [postId: string]: boolean }>({});

  // Reply box focus UX
  // Use a stable ref object to store refs for each post
  const replyBoxRefs = useRef<{ [postId: string]: HTMLTextAreaElement | null }>({});
  const rootReplyBoxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyTo && replyBoxRefs.current[replyTo.id]) {
      replyBoxRefs.current[replyTo.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => replyBoxRefs.current[replyTo.id]?.focus(), 300);
    }
  }, [replyTo]);

  // Fetch thread, posts, post_likes, and author usernames
  useEffect(() => {
    const fetchThreadAndPosts = async () => {
      setLoading(true);
      setError(null);
      // Fetch thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single();
      if (threadError || !threadData) {
        setError('Thread not found.');
        setLoading(false);
        return;
      }
      // Fetch posts (with parent_id)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });
      if (postsError) {
        setError('Failed to load replies.');
        setPosts([]);
      } else {
        setPosts(postsData || []);
      }
      // Fetch all unique author_ids (thread + posts)
      const authorIds = new Set<string>();
      authorIds.add(threadData.author_id);
      (postsData || []).forEach((p: Post) => authorIds.add(p.author_id));
      let profilesData: { id: string; full_name: string }[] = [];
      if (authorIds.size > 0) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id,full_name')
          .in('id', Array.from(authorIds));
        if (profilesError) {
          setError('Failed to load author profiles.');
        }
        profilesData = data || [];
      }
      // Build authorMap and usernameSet (now using full_name)
      const map = new Map<string, string>();
      const usernames = new Set<string>();
      profilesData.forEach((profile) => {
        if (profile.id && profile.full_name) {
          map.set(profile.id, profile.full_name);
          usernames.add(profile.full_name);
        }
      });
      setAuthorMap(map);
      setUsernameSet(usernames);
      setThread(threadData);
      // Fetch post_likes for all posts in this thread
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map((p: Post) => p.id);
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('*')
          .in('post_id', postIds);
        setPostLikes(likesData || []);
      } else {
        setPostLikes([]);
      }
      setLoading(false);
    };
    if (id) fetchThreadAndPosts();
  }, [id]);

  // Increment view_count on first load (only once per visit)
  useEffect(() => {
    if (!id || viewCounted || !thread) return;
    setViewCounted(true);
    const viewKey = `dr_thread_viewed_${id}`;
    if (!localStorage.getItem(viewKey)) {
      const newCount = (thread.view_count || 0) + 1;
      (async () => {
        const { error } = await supabase.from('threads').update({ view_count: newCount }).eq('id', id);
        if (!error) {
          setThread(prev => prev ? { ...prev, view_count: newCount } : prev);
          localStorage.setItem(viewKey, '1');
        } else {
          console.error('Failed to update view count:', error);
        }
      })();
    }
  }, [id, viewCounted, thread]);

  // Check if thread is saved by user
  useEffect(() => {
    if (!user || !thread) return;
    (async () => {
      const { data } = await supabase
        .from('saved_threads')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', thread.id)
        .maybeSingle();
      setSaved(!!data);
    })();
  }, [user, thread]);

  // Refetch post_likes after like/dislike
  const refetchPostLikes = async (postIds: string[]) => {
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('*')
      .in('post_id', postIds);
    setPostLikes(likesData || []);
  };

  // Group posts by parent_id for 2-level nesting
  const topLevelPosts = posts.filter(p => !p.parent_id);
  const childPostsMap: { [parentId: string]: Post[] } = {};
  posts.forEach(post => {
    if (post.parent_id) {
      if (!childPostsMap[post.parent_id]) childPostsMap[post.parent_id] = [];
      childPostsMap[post.parent_id].push(post);
    }
  });

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!reply.trim()) return;

    setPosting(true);
    setError(null);
    const parentId = replyTo ? replyTo.id : null;
    const { error: postError } = await supabase.from('posts').insert([
      {
        thread_id: id,
        author_id: user.id,
        content: reply.trim(),
        parent_id: parentId
      }
    ]);
    if (postError) {
      setError('Failed to post reply.');
    } else {
      setReply('');
      setReplyTo(null);
      // Refetch posts and post_likes and authorMap
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });
      setPosts(postsData || []);
      if (postsData && postsData.length > 0) {
        await refetchPostLikes(postsData.map((p: Post) => p.id));
        // Also update authorMap and usernameSet if new author
        const authorIds = new Set<string>();
        if (thread) authorIds.add(thread.author_id);
        (postsData || []).forEach((p: Post) => authorIds.add(p.author_id));
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id,full_name')
          .in('id', Array.from(authorIds));
        const map = new Map<string, string>();
        const usernames = new Set<string>();
        (profilesData || []).forEach((profile: { id: string; full_name: string }) => {
          map.set(profile.id, profile.full_name);
          usernames.add(profile.full_name);
        });
        setAuthorMap(map);
        setUsernameSet(usernames);
      }
      // --- Ensure parent replies are expanded after replying ---
      if (parentId) {
        setCollapsedReplies(prev => ({ ...prev, [parentId]: false }));
      }
    }
    setPosting(false);
  };

  // Like/dislike logic (optimistic UI, real-time update)
  const handleLikeDislike = async (postId: string, isLike: boolean) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setLikeLoading(postId + (isLike ? 'like' : 'dislike'));
    // Optimistic UI update
    let prevPostLikes = [...postLikes];
    let updatedPostLikes = [...postLikes];
    const existing = postLikes.find(l => l.post_id === postId && l.user_id === user.id);
    let optimisticChange = false;
    if (!existing) {
      // Optimistically add like/dislike
      updatedPostLikes.push({
        id: 'optimistic-' + Math.random(),
        post_id: postId,
        user_id: user.id,
        is_like: isLike
      });
      optimisticChange = true;
    } else if (existing.is_like === isLike) {
      // Optimistically remove like/dislike
      updatedPostLikes = updatedPostLikes.filter(l => l.id !== existing.id);
      optimisticChange = true;
    } else {
      // Optimistically update like/dislike
      updatedPostLikes = updatedPostLikes.map(l =>
        l.id === existing.id ? { ...l, is_like: isLike } : l
      );
      optimisticChange = true;
    }
    if (optimisticChange) setPostLikes(updatedPostLikes);
    try {
      // DB sync
      if (!existing) {
        const { data, error: insertError } = await supabase.from('post_likes').insert([
          { post_id: postId, user_id: user.id, is_like: isLike }
        ]).select();
        if (insertError) throw insertError;
        // Replace optimistic with real
        setPostLikes(likes => likes.filter(l => !l.id.startsWith('optimistic-')).concat(data || []));
      } else if (existing.is_like === isLike) {
        const { error: deleteError } = await supabase.from('post_likes').delete().eq('id', existing.id);
        if (deleteError) throw deleteError;
        // Remove from state (already done optimistically)
      } else {
        const { data, error: updateError } = await supabase.from('post_likes').update({ is_like: isLike }).eq('id', existing.id).select();
        if (updateError) throw updateError;
        // Update in state (already done optimistically, but update with real data)
        setPostLikes(likes => likes.map(l =>
          l.id === existing.id ? (data && data[0] ? data[0] : l) : l
        ));
      }
    } catch (error) {
      setError('Failed to update like/dislike. Please try again.');
      setPostLikes(prevPostLikes); // revert
    } finally {
      setLikeLoading(null);
    }
  };

  // Report submit handler
  const handleReportSubmit = async (reason: string, description: string) => {
    if (!user || !reportingPostId) {
      setShowLoginModal(true);
      return;
    }
    setReportLoading(true);
    // Prevent duplicate report: check if already reported
    const { data: existing } = await supabase
      .from('post_reports')
      .select('id')
      .eq('post_id', reportingPostId)
      .eq('reporter_id', user.id)
      .maybeSingle();
    if (existing) {
      toast.error('You have already reported this post.');
      setReportLoading(false);
      setReportModalOpen(false);
      setReportingPostId(null);
      return;
    }
    // Insert report
    const { error } = await supabase.from('post_reports').insert([
      {
        post_id: reportingPostId,
        reporter_id: user.id,
        reason,
        description,
      }
    ]);
    setReportLoading(false);
    setReportModalOpen(false);
    setReportingPostId(null);
    if (error) {
      toast.error('Failed to submit report. Please try again.');
    } else {
      toast.success('Report submitted. Thank you.');
    }
  };

  // Save/Unsave thread
  const handleSaveThread = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (!thread) return;
    setSaveLoading(true);
    if (!saved) {
      // Save (upsert)
      const { error } = await supabase.from('saved_threads').upsert({ user_id: user.id, thread_id: thread.id });
      if (!error) { setSaved(true); toast.success('Thread saved!'); }
      else toast.error('Failed to save thread.');
    } else {
      // Unsave
      const { error } = await supabase.from('saved_threads').delete().eq('user_id', user.id).eq('thread_id', thread.id);
      if (!error) { setSaved(false); toast('Thread unsaved.'); }
      else toast.error('Failed to unsave thread.');
    }
    setSaveLoading(false);
  };

  // Enhanced share button: use Web Share API if available, else fallback to clipboard
  const handleCopyLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: thread?.title || 'DentalReach Discussion',
          text: thread?.title || '',
          url,
        });
        toast.success('Link shared!');
      } catch {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      } catch {
        toast.error('Failed to copy link.');
      }
    }
  };

  // Delete thread
  const handleDeleteThread = async () => {
    if (!thread) return;
    if (!window.confirm('Are you sure you want to delete this thread? This cannot be undone.')) return;
    const { error } = await supabase.from('threads').delete().eq('id', thread.id);
    if (!error) {
      toast.success('Thread deleted.');
      setThreadDeleted(true);
      setTimeout(() => navigate('/forum'), 1200);
    } else {
      toast.error('Failed to delete thread.');
    }
  };

  // Edit thread
  const handleEditThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thread) return;
    setEditLoading(true);
    const { error } = await supabase.from('threads').update({ title: editTitle, category: editCategory }).eq('id', thread.id);
    setEditLoading(false);
    if (!error) {
      setThread(t => t ? { ...t, title: editTitle, category: editCategory } : t);
      setEditModalOpen(false);
      toast.success('Thread updated!');
    } else {
      toast.error('Failed to update thread.');
    }
  };

  // Delete post (hard delete)
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(posts => posts.filter(p => p.id !== postId));
      toast.success('Post deleted.');
    } else {
      toast.error('Failed to delete post.');
    }
  };

  // Helper: total likes for thread
  const getTotalThreadLikes = () => {
    return postLikes.filter(l => l.is_like).length;
  };

  // Helper: map author_id to full_name (for display)
  const getUsername = (authorId: string) => {
    if (!authorId) return 'Unknown';
    const name = authorMap.get(authorId);
    return name ? name : 'Unknown';
  };

  // Sorting logic for replies
  function getSortedPosts(posts: Post[]) {
    if (sortOption === 'oldest') {
      return [...posts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'newest') {
      return [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'mostLiked') {
      return [...posts].sort((a, b) => {
        const aLikes = postLikes.filter(l => l.post_id === a.id && l.is_like).length;
        const bLikes = postLikes.filter(l => l.post_id === b.id && l.is_like).length;
        return bLikes - aLikes;
      });
    }
    return posts;
  }

  // Highlight @mentions in content using full names
  function renderContentWithMentions(content: string) {
    const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
    const parts: (string | { mention: string })[] = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push({ mention: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    return parts.map((part, i) => {
      if (typeof part === 'string') {
        return <span key={i}>{part}</span>;
      } else {
        if (usernameSet.has(part.mention)) {
          return <span key={i} className="text-blue-600 font-semibold">@{part.mention}</span>;
        } else {
          return <span key={i}>@{part.mention}</span>;
        }
      }
    });
  }

  // Update renderPost to support collapsible nested replies
  const renderPost = (post: Post, level = 0) => {
    const likes = postLikes.filter(l => l.post_id === post.id && l.is_like).length;
    const dislikes = postLikes.filter(l => l.post_id === post.id && !l.is_like).length;
    const userLike = postLikes.find(l => l.post_id === post.id && l.user_id === user?.id);
    const isReplyingToThis = replyTo && replyTo.id === post.id;
    const hasReplies = !!childPostsMap[post.id] && childPostsMap[post.id].length > 0;
    const isCollapsed = collapsedReplies[post.id] ?? true; // default collapsed
    return (
      <div key={post.id} className={`bg-white border border-neutral-100 rounded-xl p-4 mb-4 ${level === 1 ? 'ml-8' : ''} relative`}>
        {/* Post action menu (top right) */}
        <div className="absolute right-2 top-2 z-10">
          <div className="relative group">
            <button
              className="p-1 rounded-full hover:bg-neutral-100 focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                setOpenPostMenuId(post.id === openPostMenuId ? null : post.id);
              }}
              type="button"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-neutral-400" />
            </button>
            {/* Dropdown menu */}
            {openPostMenuId === post.id && (
              <div className="post-action-menu absolute right-0 mt-2 w-36 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 animate-fade-in">
                {user?.id === post.author_id && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    onClick={e => {
                      e.stopPropagation();
                      setOpenPostMenuId(null);
                      handleDeletePost(post.id);
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                )}
                {/* Show Report for everyone except the author */}
                {(!user || user.id !== post.author_id) && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:bg-dental-50 rounded"
                    onClick={e => {
                      e.stopPropagation();
                      setOpenPostMenuId(null);
                      if (!user) { setShowLoginModal(true); return; }
                      setReportingPostId(post.id);
                      setReportModalOpen(true);
                    }}
                    type="button"
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-neutral-500 mb-1">
          <span>By {getUsername(post.author_id)}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div className="text-neutral-800 whitespace-pre-line mb-2">{renderContentWithMentions(post.content)}</div>
        <div className="flex items-center gap-4 mt-2">
          {/* Likes and dislikes buttons wrapped in check for deleted post */}
          {!post.is_deleted && (
            <>
              <button
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-dental-50 transition-colors ${userLike?.is_like ? 'text-dental-600 font-bold' : 'text-neutral-500'}`}
                disabled={likeLoading === post.id + 'like'}
                onClick={() => handleLikeDislike(post.id, true)}
              >
                <ThumbsUp className="h-4 w-4" /> {likes}
              </button>
              <button
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors ${userLike && userLike.is_like === false ? 'text-red-600 font-bold' : 'text-neutral-500'}`}
                disabled={likeLoading === post.id + 'dislike'}
                onClick={() => handleLikeDislike(post.id, false)}
              >
                <ThumbsDown className="h-4 w-4" /> {dislikes}
              </button>
            </>
          )}
          <button
            className="ml-2 text-xs text-dental-600 hover:underline"
            onClick={() => setReplyTo(post)}
            type="button"
          >
            Reply
          </button>
        </div>
        {/* Inline reply box */}
        {isReplyingToThis && (
          <form onSubmit={handleReply} className="mt-4 bg-dental-50 border border-dental-200 rounded-xl p-4 animate-fade-in shadow-sm">
            <div className="mb-2 text-xs text-neutral-500">
              Replying to <span className="font-semibold">{getUsername(post.author_id)}</span>
              <button
                type="button"
                className="ml-2 text-neutral-400 hover:text-neutral-700"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            </div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Reply</label>
            <textarea
              ref={el => (replyBoxRefs.current[post.id] = el)}
              className="w-full px-4 py-2 rounded-lg border border-dental-200 focus:outline-none focus:ring-2 focus:ring-dental-500 min-h-[100px] transition-colors duration-200 bg-white"
              value={reply}
              onChange={e => setReply(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="btn-primary"
                disabled={posting || !reply.trim()}
              >
                {posting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}
        {/* Render nested replies (only 2-level nesting) */}
        {hasReplies && level === 0 && (
          <button
            className="flex items-center gap-1 text-xs text-dental-600 hover:underline mt-2 mb-1"
            onClick={() => setCollapsedReplies(prev => ({ ...prev, [post.id]: !isCollapsed }))
            }
            type="button"
          >
            {isCollapsed ? (
              <>
                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                View replies ({childPostsMap[post.id].length})
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline-block rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                Hide replies
              </>
            )}
          </button>
        )}
        {hasReplies && level === 0 && !isCollapsed && (
          <div className="mt-2">
            {getSortedPosts(childPostsMap[post.id]).map(child => renderPost(child, 1))}
          </div>
        )}
        {/* If not top-level, always show nested replies (no collapse for level 1) */}
        {hasReplies && level === 1 && getSortedPosts(childPostsMap[post.id]).map(child => renderPost(child, 2))}
      </div>
    );
  };

  const handleLoginSuccess = () => {
    // After login, user can proceed with their intended action
    // The action will be triggered again when they click the button
  };

  // Add effect to close post action menu when clicking outside
  useEffect(() => {
    if (!openPostMenuId) return;
    function handleClick(e: MouseEvent) {
      // If the click is inside a .post-action-menu, ignore
      const target = e.target as HTMLElement;
      if (target.closest('.post-action-menu')) return;
      setOpenPostMenuId(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openPostMenuId]);

  if (loading) {
    return <div className="pt-20 text-center text-neutral-500">Loading thread...</div>;
  }
  if (error) {
    return <div className="pt-20 text-center text-red-500">{error}</div>;
  }
  if (!thread) {
    return <div className="pt-20 text-center text-neutral-500">Thread not found.</div>;
  }

  return (
    <div className="pt-20 pb-16 font-inter max-w-2xl mx-auto">
      <div className="mb-8 border-b pb-4 relative">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
          {thread.title}
          {/* Total likes for thread */}
          <span className="flex items-center gap-1 text-dental-600 text-base font-semibold bg-dental-50 px-2 py-1 rounded-full animate-fade-in">
            <ThumbsUp className="h-4 w-4" /> {getTotalThreadLikes()}
          </span>
        </h1>
        <div className="flex items-center text-sm text-neutral-500 gap-4">
          <span>By {getUsername(thread.author_id)}</span>
          <span>{new Date(thread.created_at).toLocaleString()}</span>
          <span className="text-xs font-medium text-dental-600 bg-dental-50 px-2.5 py-1 rounded-full">{thread.category}</span>
          {typeof thread.view_count === 'number' && (
            <span className="flex items-center gap-1 ml-2 text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-full">👁️ {thread.view_count} views</span>
          )}
        </div>
        {/* Thread actions: edit/delete/save/share, now on a new row, right-aligned, with spacing */}
        <div className="flex flex-wrap justify-end gap-2 mt-4 mb-2">
          {user?.id === thread.author_id && !threadDeleted && (
            <>
              <button
                className="flex items-center gap-1 text-xs text-dental-600 hover:bg-dental-50 border border-dental-100 bg-white px-3 py-1 rounded transition-colors shadow-sm"
                onClick={() => {
                  setEditTitle(thread.title);
                  setEditCategory(thread.category);
                  setEditModalOpen(true);
                }}
                type="button"
                title="Edit Thread"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 border border-red-100 bg-white px-3 py-1 rounded transition-colors shadow-sm"
                onClick={handleDeleteThread}
                type="button"
                title="Delete Thread"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          )}
          <button
            className={`flex items-center gap-1 text-xs border px-3 py-1 rounded shadow-sm transition ${saved ? 'bg-dental-100 text-dental-600 border-dental-200' : 'bg-white text-neutral-400 border-neutral-200 hover:bg-dental-50'}`}
            onClick={handleSaveThread}
            disabled={saveLoading}
            title={saved ? 'Unsave Thread' : 'Save Thread'}
            type="button"
          >
            {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />} {saved ? 'Saved' : 'Save'}
          </button>
          <button
            className="flex items-center gap-1 text-xs border border-neutral-200 bg-white px-3 py-1 rounded shadow-sm text-neutral-400 hover:bg-dental-50 transition"
            onClick={handleCopyLink}
            title="Copy Link"
            type="button"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>
      </div>
      {/* Sorting dropdown */}
      <div className="flex justify-end mb-4">
        <label className="mr-2 text-sm text-neutral-600">Sort replies:</label>
        <select
          className="border border-neutral-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-dental-500"
          value={sortOption}
          onChange={e => setSortOption(e.target.value as 'oldest' | 'newest' | 'mostLiked')}
        >
          <option value="oldest">Oldest First</option>
          <option value="newest">Newest First</option>
          <option value="mostLiked">Most Liked</option>
        </select>
      </div>
      <div className="space-y-6 mb-8">
        {topLevelPosts.length === 0 && (
          <div className="text-neutral-500 text-center">No replies yet.</div>
        )}
        {getSortedPosts(topLevelPosts).map(post => renderPost(post))}
      </div>
      {/* Only show root reply box if not replying to a post */}
      {!replyTo && (
        <form onSubmit={handleReply} className="bg-dental-50 border border-dental-200 rounded-xl p-4 animate-fade-in shadow-sm">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Reply</label>
          <textarea
            ref={rootReplyBoxRef}
            className="w-full px-4 py-2 rounded-lg border border-dental-200 focus:outline-none focus:ring-2 focus:ring-dental-500 min-h-[100px] transition-colors duration-200 bg-white"
            value={reply}
            onChange={e => setReply(e.target.value)}
            required
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={posting || !reply.trim()}
            >
              {posting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        redirectPath={window.location.pathname + window.location.search}
      />
      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => { setReportModalOpen(false); setReportingPostId(null); }}
        onSubmit={handleReportSubmit}
        loading={reportLoading}
      />
      {/* Edit Thread Modal (newly added) */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Edit Thread</h2>
            <form onSubmit={handleEditThread}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-dental-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-dental-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Thread deleted message */}
      {threadDeleted && (
        <div className="text-center text-red-500 text-lg font-semibold animate-fade-in mt-8">This thread was deleted.</div>
      )}
    </div>
  );
};

export default ThreadDetailPage;