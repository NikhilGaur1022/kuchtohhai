// src/pages/ProfessorsPage.tsx

import React, { useEffect, useState } from 'react';
import { Search, Filter, SortAsc, Users, BookOpen, Award, GraduationCap } from 'lucide-react';
import PageContainer from '../components/common/PageContainer';
import ProfessorCard from '../components/professors/ProfessorCard';
import { supabase } from '../lib/supabase';
import type { ProfessorCardData } from '../types/professor';

const ProfessorsPage: React.FC = () => {
  const [professors, setProfessors] = useState<ProfessorCardData[]>([]);
  const [filteredProfessors, setFilteredProfessors] = useState<ProfessorCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'publications' | 'courses'>('name');

  // Fetch professors data
  useEffect(() => {
    const fetchProfessors = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Fetch professors with stats using a proper join
    const { data: professorsData, error: professorsError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        specialty,
        institution,
        university,
        position,
        avatar_url,
        publications_count,
        is_featured,
        display_order,
        professor_stats (
          courses_count
        )
      `)
      .eq('is_professor', true)
      .order('display_order', { ascending: true });

    if (professorsError) {
      console.error('Error fetching professors:', professorsError);
      throw professorsError;
    }

    if (!professorsData || professorsData.length === 0) {
      setError('No professors found in database');
      return;
    }

    console.log('Found professors:', professorsData);

    // Format the data - handle the array structure of professor_stats
    const formattedProfessors: ProfessorCardData[] = professorsData.map(prof => {
      // professor_stats is an array, so we need to get the first element
      const stats = Array.isArray(prof.professor_stats) ? prof.professor_stats[0] : prof.professor_stats;
      
      return {
        id: prof.id,
        name: prof.full_name || 'Unknown Professor',
        position: prof.position || 'Professor',
        institution: prof.institution || prof.university || 'Institution',
        specialty: prof.specialty || 'General Dentistry',
        avatar_url: prof.avatar_url || undefined,
        courses_count: stats?.courses_count || 3, // Default to 3 if no stats
        publications_count: prof.publications_count || 0,
        is_featured: prof.is_featured || false,
      };
    });

    console.log('Formatted professors:', formattedProfessors);

    setProfessors(formattedProfessors);
    setFilteredProfessors(formattedProfessors);
    
  } catch (err) {
    console.error('Error fetching professors:', err);
    setError(`Failed to load professors: ${err instanceof Error ? err.message : 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};
    fetchProfessors();
  }, []);

  // Filter and sort professors
  useEffect(() => {
    let filtered = professors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(prof => prof.specialty === selectedSpecialty);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'publications':
          return b.publications_count - a.publications_count;
        case 'courses':
          return b.courses_count - a.courses_count;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Featured professors first
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    setFilteredProfessors(filtered);
  }, [professors, searchTerm, selectedSpecialty, sortBy]);

  const specialties = Array.from(new Set(professors.map(prof => prof.specialty)));
  const totalProfessors = professors.length;
  const totalPublications = professors.reduce((sum, prof) => sum + prof.publications_count, 0);
  const totalCourses = professors.reduce((sum, prof) => sum + prof.courses_count, 0);
  const featuredProfessors = professors.filter(prof => prof.is_featured).length;

  useEffect(() => {
    document.title = 'Professors | DentalReach';
  }, []);

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-dental-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading professors...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
        <PageContainer>
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-dental-600 text-white rounded-lg hover:bg-dental-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className=" pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dental-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Meet Our Professors</h1>
            <p className="text-lg opacity-90 mb-8">
              Discover world-class dental educators and researchers who are shaping the future of dentistry
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{totalProfessors}</div>
                <div className="text-xs opacity-80">Expert Professors</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{totalPublications}</div>
                <div className="text-xs opacity-80">Publications</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{totalCourses}</div>
                <div className="text-xs opacity-80">Courses</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{featuredProfessors}</div>
                <div className="text-xs opacity-80">Featured</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search professors, specialties, institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Specialty Filter */}
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'publications' | 'courses')}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="publications">Sort by Publications</option>
                  <option value="courses">Sort by Courses</option>
                </select>
                <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-gray-600 text-sm">
            Showing {filteredProfessors.length} of {totalProfessors} professors
          </div>
        </div>
      </section>

      {/* Professors Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProfessors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No professors found</div>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProfessors.map((professor) => (
                <ProfessorCard
                  key={professor.id}
                  professor={professor}
                  className="w-full"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-gradient-to-r from-dental-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Want to Become a Featured Professor?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our prestigious community of dental educators and share your expertise with professionals worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-dental-600 text-white rounded-lg hover:bg-dental-700 transition-colors font-semibold">
                Apply Now
              </button>
              <button className="px-8 py-4 border-2 border-dental-600 text-dental-600 rounded-lg hover:bg-dental-50 transition-colors font-semibold">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessorsPage;