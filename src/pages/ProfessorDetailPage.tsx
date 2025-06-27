import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Download,
  GraduationCap,
  BookOpen,
  Award,
  Eye,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Users,
  TrendingUp,
  Globe
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer';

// Type definitions
interface ProfessorStats {
  id: string;
  articles_published: number;
  total_citations: number;
  research_papers: number;
  courses_count: number;
  students_taught: number;
  updated_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  date_achieved?: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  level: string;
  enrollment_count: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  abstract?: string;
  methodology?: string;
  conclusions?: string;
  references?: (string | { authors?: string | string[]; title?: string; journal?: string; year?: string })[];
  category: string;
  created_at: string;
  excerpt?: string;
  views_count: number;
  images?: string[];
  image_url?: string;
  user_id: string;
  is_approved: boolean;
}

interface Professor {
  id: string;
  full_name: string;
  position: string;
  institution?: string;
  university?: string;
  email: string;
  specialty: string;
  bio?: string;
  avatar_url?: string;
  is_professor: boolean;
  is_featured: boolean;
  professor_since?: string;
  research_interests?: string[];
  website_url?: string;
  professor_stats?: ProfessorStats[];
  professor_achievements?: Achievement[];
  courses?: Course[];
}

interface FeaturedProfessor {
  id: string;
  full_name: string;
  position: string;
  institution: string;
  specialty: string;
  avatar_url?: string;
}

const ProfessorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [professorStats, setProfessorStats] = useState<ProfessorStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredProfessors, setFeaturedProfessors] = useState<FeaturedProfessor[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  
  // Ref to prevent duplicate view increments
  const viewsIncrementedRef = useRef(false);
  const currentProfessorIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (id) {
      // Only reset the flag if we're loading a different professor
      if (currentProfessorIdRef.current !== id) {
        viewsIncrementedRef.current = false;
        currentProfessorIdRef.current = id;
      }
      
      fetchProfessorData();
    }
  }, [id]);

  const fetchProfessorData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');

      // Step 1: Fetch professor profile with related data using nested query
      const { data: professorData, error: professorError } = await supabase
        .from('profiles')
        .select(`
          *,
          professor_stats(*),
          professor_achievements(*),
          courses(*)
        `)
        .eq('id', id)
        .eq('is_professor', true)
        .single();

      if (professorError) {
        console.error('Professor query error:', professorError);
        throw professorError;
      }

      if (!professorData) {
        throw new Error('Professor not found');
      }

      // Set the main professor data
      setProfessor(professorData as Professor);

      // Extract related data
      setProfessorStats((professorData.professor_stats as ProfessorStats[])?.[0] || null);
      setAchievements((professorData.professor_achievements as Achievement[]) || []);
      setCourses((professorData.courses as Course[]) || []);

      // Step 2: Fetch professor's articles separately
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (articlesError) {
        console.error('Articles query error:', articlesError);
        // Don't throw here, just log the error and continue without articles
        console.warn('Could not fetch articles for professor');
      }

      setRecentArticles((articlesData as Article[]) || []);

      // Step 3: Fetch featured professors
      const { data: featuredData, error: featuredError } = await supabase
        .from('profiles')
        .select('id, full_name, position, institution, specialty, avatar_url')
        .eq('is_professor', true)
        .eq('is_featured', true)
        .neq('id', id)
        .limit(5);

      if (!featuredError) {
        setFeaturedProfessors((featuredData as FeaturedProfessor[]) || []);
      }

      console.log('Professor data loaded successfully');

    } catch (err) {
      console.error('Error fetching professor data:', err);
      setError('Failed to load professor information');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllArticles = async () => {
    if (!professor) return;
    
    try {
      setExporting(true);
      
      // Fetch all articles by the professor
      const { data: allArticles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedArticles = allArticles as Article[];

      if (!typedArticles || typedArticles.length === 0) {
        alert('No articles found for this professor.');
        return;
      }

      // Create ZIP file content
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add professor info file
      const professorInfo = `
Professor Information
====================

Name: ${professor?.full_name || 'N/A'}
Position: ${professor?.position || 'N/A'}
Institution: ${professor?.institution || professor?.university || 'N/A'}
Email: ${professor?.email || 'N/A'}
Specialty: ${professor?.specialty || 'N/A'}
Professor Since: ${professor?.professor_since ? new Date(professor.professor_since).getFullYear() : 'N/A'}

Academic Statistics:
- Articles Published: ${professorStats?.articles_published || 0}
- Total Citations: ${professorStats?.total_citations || 0}
- Research Papers: ${professorStats?.research_papers || 0}
- Courses Count: ${professorStats?.courses_count || 0}
- Students Taught: ${professorStats?.students_taught || 0}

Bio:
${professor?.bio || 'N/A'}

Research Interests:
${Array.isArray(professor?.research_interests) ? professor.research_interests.join(', ') : 'N/A'}

Total Publications: ${typedArticles.length}
Generated on: ${new Date().toLocaleDateString()}
Last Updated: ${professorStats?.updated_at ? new Date(professorStats.updated_at).toLocaleDateString() : 'N/A'}
      `.trim();

      zip.file('00_Professor_Info.txt', professorInfo);

      // Add each article as a separate file
      typedArticles.forEach((article, index) => {
        const articleContent = `
${article.title || 'Untitled'}
${'='.repeat((article.title || 'Untitled').length)}

Author: ${professor?.full_name || 'N/A'}
Category: ${article.category || 'N/A'}
Published: ${formatDate(article.created_at)}

ABSTRACT
--------
${article.abstract || 'N/A'}

MAIN CONTENT
------------
${article.content || 'N/A'}

${article.methodology ? `METHODOLOGY\n-----------\n${article.methodology}\n\n` : ''}

${article.conclusions ? `CONCLUSIONS\n-----------\n${article.conclusions}\n\n` : ''}

${article.references && Array.isArray(article.references) && article.references.length > 0 ? 
  `REFERENCES\n----------\n${article.references.map((ref, idx) => {
    if (typeof ref === 'object' && ref !== null) {
      const refObj = ref as { authors?: string | string[]; title?: string; journal?: string; year?: string };
      const authors = Array.isArray(refObj.authors) ? refObj.authors.join(', ') : refObj.authors || '';
      const title = refObj.title || '';
      const journal = refObj.journal || '';
      const year = refObj.year || '';
      return `[${idx + 1}] ${authors}${title ? `. ${title}` : ''}${journal ? `. ${journal}` : ''}${year ? ` (${year})` : ''}`;
    }
    return `[${idx + 1}] ${ref}`;
  }).join('\n')}\n\n` : ''}
        `.trim();

        const filename = `${String(index + 1).padStart(2, '0')}_${article.title?.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'untitled'}.txt`;
        zip.file(filename, articleContent);
      });

      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${professor?.full_name?.replace(/[^a-z0-9]/gi, '_') || 'professor'}_articles.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string | undefined) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'PR';
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading professor profile...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
        <PageContainer>
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-semibold mb-4">
              {error || 'Professor not found'}
            </div>
            <Link
              to="/professors"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Professors
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/professors" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Professors
            </Link>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportAllArticles}
                disabled={exporting || !recentArticles.length}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  exporting || !recentArticles.length
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export All Articles'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="col-span-12 lg:col-span-8">
            {/* Professor Profile Header */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 rounded-2xl mb-8">
              <div className="px-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-48 h-48 bg-white/20 p-2 rounded-3xl">
                      <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                        {professor.avatar_url ? (
                          <img
                            src={professor.avatar_url}
                            alt={professor.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-4xl font-bold text-gray-600">
                              {getInitials(professor.full_name)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {professor.is_featured && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-4xl font-bold mb-4">{professor.full_name}</h1>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-center lg:justify-start text-white/90">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        <span className="text-lg">{professor.position}</span>
                      </div>
                      
                      <div className="flex items-center justify-center lg:justify-start text-white/90">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{professor.institution || professor.university}</span>
                      </div>

                      {professor.professor_since && (
                        <div className="flex items-center justify-center lg:justify-start text-white/90">
                          <Calendar className="w-5 h-5 mr-2" />
                          <span>Professor since {new Date(professor.professor_since).getFullYear()}</span>
                        </div>
                      )}
                    </div>

                    <div className="inline-block bg-white/20 px-4 py-2 rounded-lg">
                      <span className="font-semibold">Specialization: </span>
                      <span>{professor.specialty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Cards */}
            {professorStats && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{professorStats.articles_published || 0}</div>
                    <div className="text-sm text-gray-600">Articles Published</div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{professorStats.total_citations || 0}</div>
                    <div className="text-sm text-gray-600">Total Citations</div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <GraduationCap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{professorStats.courses_count || 0}</div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                    <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{professorStats.students_taught || 0}</div>
                    <div className="text-sm text-gray-600">Students Taught</div>
                  </div>
                </div>
              </section>
            )}

            {/* About Section */}
            <section className="mb-12">
              <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {professor.bio ? (
                    <p>{professor.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No biography available.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Research Interests */}
            {professor.research_interests && Array.isArray(professor.research_interests) && professor.research_interests.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Interests</h2>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex flex-wrap gap-3">
                    {professor.research_interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Recent Articles */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Publications</h2>
                {recentArticles.length > 3 && (
                  <Link
                    to={`/professors/${id}/articles`}
                    className="text-dental-600 hover:text-dental-700 font-semibold"
                  >
                    View All
                  </Link>
                )}
              </div>
              
              {recentArticles.length === 0 ? (
                <p className="text-gray-500 italic">No published articles yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentArticles.slice(0, 3).map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.id}`}
                      className="block bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-4">
                        {((article.images && article.images.length > 0) || article.image_url) && (
                          <img
                            src={
                              article.images && article.images.length > 0 
                                ? article.images[0] 
                                : article.image_url
                            }
                            alt={article.title}
                            className="w-20 h-20 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(article.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.views_count || 0}</span>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{professor.email}</span>
                  </div>
                  {professor.website_url && (
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-400 mr-3" />
                      <a 
                        href={professor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        Personal Website
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {professorStats && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Publications</span>
                      <span className="font-semibold text-blue-600">{professorStats.articles_published || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Citations</span>
                      <span className="font-semibold text-green-600">{professorStats.total_citations || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Research Papers</span>
                      <span className="font-semibold text-purple-600">{professorStats.research_papers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Students</span>
                      <span className="font-semibold text-orange-600">{professorStats.students_taught || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Courses */}
              {courses && courses.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Courses</h3>
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {course.title}
                        </h4>
                        {course.description && (
                          <p className="text-gray-600 text-xs">{course.description.substring(0, 100)}...</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 capitalize">{course.level}</span>
                          {course.enrollment_count > 0 && (
                            <span className="text-xs text-gray-500">
                              {course.enrollment_count} enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {achievements && achievements.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
                  <div className="space-y-3">
                    {achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {achievement.title}
                          </h4>
                          {achievement.description && (
                            <p className="text-gray-600 text-xs mt-1">
                              {achievement.description}
                            </p>
                          )}
                          {achievement.date_achieved && (
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(achievement.date_achieved).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Professors */}
              {featuredProfessors.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Featured Professors
                  </h3>
                  <div className="space-y-4">
                    {featuredProfessors.map((featuredProf) => (
                      <Link
                        key={featuredProf.id}
                        to={`/professors/${featuredProf.id}`}
                        className="block group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {getInitials(featuredProf.full_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {featuredProf.full_name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{featuredProf.position}</p>
                            <p className="text-xs text-gray-400 truncate">{featuredProf.institution}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link
                    to="/professors"
                    className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Professors →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDetailPage;
