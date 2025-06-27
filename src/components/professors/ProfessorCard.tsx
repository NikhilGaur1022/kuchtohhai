// src/components/professors/ProfessorCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, MapPin } from 'lucide-react';
import type { ProfessorCardData } from '../../types/professor';

interface ProfessorCardProps {
  professor: ProfessorCardData;
  className?: string;
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ professor, className = '' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      'Periodontology': 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      'Oral Surgery': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'Orthodontics': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'Endodontics': 'bg-gradient-to-br from-orange-400 to-orange-600',
      'Prosthodontics': 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'Oral Medicine': 'bg-gradient-to-br from-pink-400 to-pink-600',
      'Pediatric Dentistry': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'General Dentistry': 'bg-gradient-to-br from-gray-400 to-gray-600',
    };
    
    return colors[specialty] || 'bg-gradient-to-br from-dental-400 to-dental-600';
  };

  return (
    <div className={`group relative ${className}`}>
      <Link 
        to={`/professors/${professor.id}`}
        className="block"
      >
        <div className={`relative bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${professor.is_featured ? 'h-[450px]' : 'h-[420px]'}`}>
          
          {/* Featured badge - More space for featured cards */}
          {professor.is_featured && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                FEATURED
              </div>
            </div>
          )}

          {/* Header with name - Extra top padding for featured cards */}
          <div className={`px-5 pb-3 ${professor.is_featured ? 'pt-12' : 'pt-6'}`}>
            <div className="h-16 flex flex-col justify-start">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-dental-600 transition-colors line-clamp-2 leading-tight">
                {professor.name.toUpperCase()}
              </h3>
              {/* Animated line */}
              <div className="w-14 h-0.5 bg-gray-200 group-hover:bg-dental-400 group-hover:w-full transition-all duration-500 ease-out"></div>
            </div>
          </div>

          {/* Avatar Section - Fixed height */}
          <div className="px-5 pb-3 h-40">
            <div className="relative h-full">
              <div className={`w-full h-36 rounded-2xl ${getSpecialtyColor(professor.specialty)} p-1 shadow-lg`}>
                <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                  {professor.avatar_url ? (
                    <img
                      src={professor.avatar_url}
                      alt={professor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-2xl font-bold text-gray-600">
                        {getInitials(professor.name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Courses count badge - Fixed position */}
              {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-dental-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {professor.courses_count} courses
                </div>
              </div> */}
            </div>
          </div>

          {/* Content section - Fixed height and flex layout */}
          <div className="px-5 pt-4 pb-4 h-32 flex flex-col">
            
            {/* Position and Institution - Fixed height */}
            <div className="h-12 mb-2">
              <p className="text-base font-semibold text-gray-900 mb-1 truncate">
                {professor.position}
              </p>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate">{professor.institution}</span>
              </div>
            </div>

            {/* Specialization - Fixed height */}
            <div className="h-8 mb-3">
              <div className="flex items-start">
                <span className="text-dental-400 font-semibold text-xs mr-2 whitespace-nowrap">Specialization:</span>
                <span className="text-gray-700 text-xs font-medium truncate">
                  {professor.specialty}
                </span>
              </div>
            </div>

            {/* Stats - Fixed height */}
            <div className="h-6 flex items-center justify-between mb-3">
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                <BookOpen className="w-3 h-3 mr-1 text-blue-600" />
                <span className="text-blue-700 font-medium text-xs">{professor.publications_count}</span>
              </div>
              <div className="flex items-center bg-green-50 px-2 py-1 rounded-md">
                <GraduationCap className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-700 font-medium text-xs">{professor.courses_count}</span>
              </div>
            </div>

            {/* About Button - Fixed at bottom */}
            <div className="flex-1 flex items-end justify-center">
              <div className="inline-flex items-center text-dental-600 hover:text-dental-700 font-semibold text-xs group/link transition-colors">
                <span>View Profile</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover/link:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-dental-50 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-3xl" />
        </div>
      </Link>
    </div>
  );
};

export default ProfessorCard;