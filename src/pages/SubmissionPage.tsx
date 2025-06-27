import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  X, 
  Eye, 
  EyeOff, 
  Save, 
  Upload, 
  Image as ImageIcon,
  FileText,
  Hash,
  BookOpen,
  Clock,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';

const SubmissionPage = ({ isEdit = false, articleId = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [citationNotice, setCitationNotice] = useState('');

  const [form, setForm] = useState({
    title: '',
    abstract: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    keywords: [],
    images: [],
    methodology: '',
    conclusions: '',
    references: [],
    doi: ''
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newReference, setNewReference] = useState({
    authors: '',
    title: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    year: new Date().getFullYear(),
    doi: '',
    url: ''
  });

  const categories = [
    'Clinical Dentistry',
    'Dental Technology',
    'Practice Management',
    'Dental Education',
    'Dental Research',
    'Community Dentistry',
    'Oral Surgery',
    'Orthodontics',
    'Periodontics',
    'Endodontics',
    'Pediatric Dentistry',
    'Prosthodontics'
  ];

  useEffect(() => {
    if (isEdit && articleId) {
      fetchArticle();
    } else {
      // Check for citation parameters in URL
      const urlParams = new URLSearchParams(location.search);
      const citeArticleId = urlParams.get('cite_article_id');
      
      if (citeArticleId) {
        handleCitationPrePopulation(urlParams);
      }
    }
  }, [isEdit, articleId, location.search]);

  const handleCitationPrePopulation = (urlParams) => {
    const citeTitle = urlParams.get('cite_title') || '';
    const citeAuthor = urlParams.get('cite_author') || '';
    const citeDoi = urlParams.get('cite_doi') || '';
    const citeYear = urlParams.get('cite_year') || new Date().getFullYear();

    if (citeTitle && citeAuthor) {
      const citationReference = {
        authors: citeAuthor,
        title: citeTitle,
        journal: 'DentalReach', // Platform name
        volume: '',
        issue: '',
        pages: '',
        year: parseInt(citeYear),
        doi: citeDoi,
        url: `${window.location.origin}/articles/${urlParams.get('cite_article_id')}`
      };

      setForm(prev => ({
        ...prev,
        references: [citationReference]
      }));

      setCitationNotice(`Reference from "${citeTitle}" has been added to your references.`);
      
      // Clear the citation notice after 5 seconds
      setTimeout(() => setCitationNotice(''), 5000);
    }
  };

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      setForm({
        title: data.title || '',
        abstract: data.abstract || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        author: data.author || '',
        category: data.category || '',
        keywords: data.keywords || [],
        images: data.images || [],
        methodology: data.methodology || '',
        conclusions: data.conclusions || '',
        references: data.references || [],
        doi: data.doi || ''
      });
    } catch (err) {
      setError('Failed to fetch article data');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !form.keywords.includes(newKeyword.trim())) {
      setForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim() && !form.images.includes(newImageUrl.trim())) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (index, direction) => {
    const newImages = [...form.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setForm(prev => ({ ...prev, images: newImages }));
    }
  };

  const addReference = () => {
    if (newReference.title.trim() && newReference.authors.trim()) {
      const reference = {
        ...newReference,
        id: Date.now(),
        authors: newReference.authors.split(',').map(a => a.trim())
      };
      setForm(prev => ({
        ...prev,
        references: [...prev.references, reference]
      }));
      setNewReference({
        authors: '',
        title: '',
        journal: '',
        volume: '',
        issue: '',
        pages: '',
        year: new Date().getFullYear(),
        doi: '',
        url: ''
      });
    }
  };

  const removeReference = (index) => {
    setForm(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 225;
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const articleData = {
        ...form,
        user_id: user.id,
        is_approved: false,
        publication_date: new Date().toISOString(),
        image_url: form.images[0] || null
      };

      let result;
      if (isEdit) {
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save article');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block w-full max-w-4xl p-6 my-8 text-left bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Article Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-4">{form.title || 'Article Title'}</h1>
            
            {form.abstract && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Abstract</h3>
                <p>{form.abstract}</p>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Content</h3>
              <div className="whitespace-pre-wrap">{form.content}</div>
            </div>
            
            {form.methodology && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Methodology</h3>
                <div className="whitespace-pre-wrap">{form.methodology}</div>
              </div>
            )}
            
            {form.conclusions && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Conclusions</h3>
                <div className="whitespace-pre-wrap">{form.conclusions}</div>
              </div>
            )}
            
            {form.references.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">References</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {form.references.map((ref, index) => (
                    <li key={index} className="text-sm">
                      {Array.isArray(ref.authors) ? ref.authors.join(', ') : ref.authors}. {ref.title}. 
                      {ref.journal && ` ${ref.journal}.`}
                      {ref.year && ` ${ref.year}.`}
                      {ref.doi && ` DOI: ${ref.doi}`}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Preview
              </button>
            </div>
          </div>

          {/* Citation Notice */}
          {citationNotice && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Citation Added</p>
                <p className="text-sm">{citationNotice}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a compelling article title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={form.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. Your Name"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-2">
                  DOI (Optional)
                </label>
                <input
                  type="text"
                  id="doi"
                  name="doi"
                  value={form.doi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.1000/example"
                />
              </div>
            </div>

            {/* Abstract and Content */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Content
              </h2>

              <div>
                <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract (Optional)
                </label>
                <textarea
                  id="abstract"
                  name="abstract"
                  value={form.abstract}
                  onChange={handleInputChange}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a concise summary of your article..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {form.abstract.length}/1000 characters
                </p>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (For listings) *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  maxLength={300}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for article listings..."
                />
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Keywords & Tags
              </h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add keyword"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Images
              </h2>
              
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {form.images.length > 0 && (
                <div className="space-y-3">
                  {form.images.map((imageUrl, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={imageUrl}
                        alt={`Article image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate">{imageUrl}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === form.images.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Article Content
              </h2>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Main Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleInputChange}
                  required
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your article content here. Use paragraph breaks for better readability..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Estimated reading time: {calculateReadingTime(form.content)} minutes
                </p>
              </div>
            </div>

            {/* Methodology & Conclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-2">
                  Methodology (Optional)
                </label>
                <textarea
                  id="methodology"
                  name="methodology"
                  value={form.methodology}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your research methodology..."
                />
              </div>

              <div>
                <label htmlFor="conclusions" className="block text-sm font-medium text-gray-700 mb-2">
                  Conclusions (Optional)
                </label>
                <textarea
                  id="conclusions"
                  name="conclusions"
                  value={form.conclusions}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Summarize your key findings and conclusions..."
                />
              </div>
            </div>

            {/* References */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">References</h2>
              
              {/* Add Reference Form */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Reference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authors *
                    </label>
                    <input
                      type="text"
                      value={newReference.authors}
                      onChange={(e) => setNewReference(prev => ({ ...prev, authors: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Smith J, Doe A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newReference.title}
                      onChange={(e) => setNewReference(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Journal
                    </label>
                    <input
                      type="text"
                      value={newReference.journal}
                      onChange={(e) => setNewReference(prev => ({ ...prev, journal: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Journal name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={newReference.year}
                      onChange={(e) => setNewReference(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DOI
                    </label>
                    <input
                      type="text"
                      value={newReference.doi}
                      onChange={(e) => setNewReference(prev => ({ ...prev, doi: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10.1000/example"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={newReference.url}
                      onChange={(e) => setNewReference(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addReference}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Reference
                </button>
              </div>

              {/* Existing References */}
              {form.references.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">References ({form.references.length})</h3>
                  {form.references.map((ref, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">[{index + 1}]</span>{' '}
                            {Array.isArray(ref.authors) ? ref.authors.join(', ') : ref.authors}.{' '}
                            <em>{ref.title}</em>
                            {ref.journal && <span className="font-medium"> {ref.journal}</span>}
                            {ref.volume && <span> {ref.volume}</span>}
                            {ref.issue && <span>({ref.issue})</span>}
                            {ref.pages && <span>: {ref.pages}</span>}
                            {ref.year && <span>. {ref.year}</span>}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeReference(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEdit ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Update Article' : 'Publish Article'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPreview && <PreviewModal />}
    </div>
  );
};

export default SubmissionPage;