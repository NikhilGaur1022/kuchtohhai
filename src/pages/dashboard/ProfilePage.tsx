import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  location: string;
  bio: string;
  website_url: string;
  years_of_experience: string;
  clinic_name: string;
  avatar_url: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    location: '',
    bio: '',
    website_url: '',
    years_of_experience: '',
    clinic_name: '',
    avatar_url: '',
  });
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing profile data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || '',
            email: profileData.email || user.email || '',
            phone: profileData.phone || '',
            specialty: profileData.specialty || '',
            location: profileData.location || '',
            bio: profileData.bio || '',
            website_url: profileData.website_url || '',
            years_of_experience: profileData.years_of_experience?.toString() || '',
            clinic_name: profileData.clinic_name || '',
            avatar_url: profileData.avatar_url || '',
          });

          if (profileData.avatar_url) {
            setPreviewUrl(profileData.avatar_url);
          }
        } else {
          // Create initial profile if doesn't exist
          setProfile(prev => ({
            ...prev,
            email: user.email || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    document.title = 'Edit Profile | DentalReach';
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePicture(file);
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    } else {
      setPreviewUrl(profile.avatar_url || null);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      throw new Error('Failed to upload profile picture');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = profile.avatar_url;

      // Upload new profile picture if selected
      if (profilePicture) {
        avatarUrl = await uploadProfilePicture(profilePicture);
      }

      // Prepare profile data
      const profileData = {
        id: user.id,
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim() || null,
        specialty: profile.specialty.trim() || null,
        location: profile.location.trim() || null,
        bio: profile.bio.trim() || null,
        website_url: profile.website_url.trim() || null,
        years_of_experience: profile.years_of_experience ? parseInt(profile.years_of_experience) : null,
        clinic_name: profile.clinic_name.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      
      // Update local state with new avatar URL
      if (avatarUrl && avatarUrl !== profile.avatar_url) {
        setProfile(prev => ({ ...prev, avatar_url: avatarUrl || '' }));
        setPreviewUrl(avatarUrl);
      }
      
      // Clear the file input
      setProfilePicture(null);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-neutral-50 font-inter">
        <div className="container-custom max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-dental-600 mx-auto mb-4" />
              <p className="text-neutral-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-neutral-50 font-inter">
      <div className="container-custom max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-dental-700 text-center">Edit Profile</h1>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-center">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-lg">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-dental-500 to-dental-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <label className="block">
              <span className="sr-only">Upload Profile Picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dental-50 file:text-dental-700 hover:file:bg-dental-100 cursor-pointer"
              />
            </label>
            <p className="text-xs text-neutral-500 mt-2">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="Dr. John Smith"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-neutral-700 mb-2">
                Specialty
              </label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={profile.specialty}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="General Dentistry, Orthodontics, etc."
              />
            </div>

            <div>
              <label htmlFor="clinic_name" className="block text-sm font-medium text-neutral-700 mb-2">
                Clinic/Practice Name
              </label>
              <input
                type="text"
                id="clinic_name"
                name="clinic_name"
                value={profile.clinic_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="Smith Dental Clinic"
              />
            </div>

            <div>
              <label htmlFor="years_of_experience" className="block text-sm font-medium text-neutral-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                id="years_of_experience"
                name="years_of_experience"
                value={profile.years_of_experience}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="10"
                min="0"
                max="50"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="New York, NY, USA"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="website_url" className="block text-sm font-medium text-neutral-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={profile.website_url}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                placeholder="https://www.yourwebsite.com"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-colors duration-200"
                rows={4}
                placeholder="Tell us about yourself, your experience, and your interests in dentistry..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 bg-dental-600 text-white hover:bg-dental-700 disabled:bg-dental-400 disabled:cursor-not-allowed rounded-lg py-3 px-8 font-semibold transition-all duration-200 ease-in-out"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;