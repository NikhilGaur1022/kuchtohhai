import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})


// Define your database types
export interface Article {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  image_url?: string
  images?: string[] // Your DB has this as ARRAY type
  keywords?: string[] // Your DB has 'tags' as ARRAY type
  tags?: string[] // Your existing column name
  abstract?: string
  methodology?: string
  conclusions?: string
  references?: Reference[]
  doi?: string
  view_count?: number // Your DB has this
  views_count?: number // Your existing column name
  likes_count?: number // Your DB has this
  like_count?: number // Your existing column name
  reading_time?: number // Your existing column name
  reading_time_minutes?: number // Expected by component
  created_at: string
  updated_at: string
  is_approved: boolean
  user_id: string
  profiles?: {
    bio?: string
    specialty?: string // Your column name
    specialization?: string
  }
}

interface Reference {
  authors: string[] | string
  title: string
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  year: string
  doi?: string
}

interface Profile {
  id: string
  full_name?: string
  email?: string
  phone?: string
  specialty?: string
  location?: string
  bio?: string
  website_url?: string
  years_of_experience?: number
  clinic_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

interface Database {
  public: {
    Tables: {
      saved_articles: {
        Row: {
          id: number
          user_id: string
          article_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          article_id: number
        }
        Update: {
          user_id?: string
          article_id?: number
        }
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      courses: {
        Row: {
          id: number;
          title: string;
          description: string | null;
          professor_id: string;
          duration: string | null;
          level: 'beginner' | 'intermediate' | 'advanced';
          category: string | null;
          thumbnail_url: string | null;
          price: number | null;
          is_active: boolean;
          enrollment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description?: string | null;
          professor_id: string;
          duration?: string | null;
          level: 'beginner' | 'intermediate' | 'advanced';
          category?: string | null;
          thumbnail_url?: string | null;
          price?: number | null;
          is_active?: boolean;
          enrollment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string | null;
          professor_id?: string;
          duration?: string | null;
          level?: 'beginner' | 'intermediate' | 'advanced';
          category?: string | null;
          thumbnail_url?: string | null;
          price?: number | null;
          is_active?: boolean;
          enrollment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      professor_achievements: {
        Row: {
          id: number;
          professor_id: string;
          title: string;
          description: string | null;
          date_achieved: string | null;
          category: string | null;
          icon: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          professor_id: string;
          title: string;
          description?: string | null;
          date_achieved?: string | null;
          category?: string | null;
          icon?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          professor_id?: string;
          title?: string;
          description?: string | null;
          date_achieved?: string | null;
          category?: string | null;
          icon?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
      };
      professor_stats: {
        Row: {
          id: number;
          professor_id: string;
          articles_published: number;
          total_citations: number;
          courses_count: number;
          students_taught: number;
          research_papers: number;
          updated_at: string;
          created_at:string;
        };
        Insert: {
          id?: number;
          professor_id: string;
          articles_published?: number;
          total_citations?: number;
          courses_count?: number;
          students_taught?: number;
          research_papers?: number;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          professor_id?: string;
          articles_published?: number;
          total_citations?: number;
          courses_count?: number;
          students_taught?: number;
          research_papers?: number;
          updated_at?: string;
          created_at?: string;
        };
      };
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>
      }
      article_likes: {
        Row: {
          id: number
          article_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          article_id: number
          user_id: string
        }
        Update: {
          article_id?: number
          user_id?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          type: 'article_approved' | 'article_rejected' | 'article_deleted' | 'general'
          message: string
          reason?: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          type: 'article_approved' | 'article_rejected' | 'article_deleted' | 'general'
          message: string
          reason?: string
          read?: boolean
        }
        Update: {
          read?: boolean
        }
      }
    }
    Functions: {
      increment_article_views: {
        Args: {
          article_id_param: number
          user_id_param?: string
        }
        Returns: void
      }
      toggle_article_like: {
        Args: {
          article_id_param: number
          user_id_param: string
        }
        Returns: boolean
      }
    }
      // ... your existing tables (articles, notifications, etc.)
  };
}
// Article submission type
type ArticleSubmission = Omit<Article, 'id' | 'created_at' | 'is_approved'>;
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
;