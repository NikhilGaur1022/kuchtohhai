// src/types/professor.ts

export interface Professor {
  // Core profile fields
  id: string;
  role: string;
  is_professor: boolean;
  full_name: string;
  email: string;
  phone?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  website_url?: string;
  years_of_experience?: number;
  clinic_name?: string;
  avatar_url?: string;
  
  // Professor-specific fields
  institution?: string;
  university?: string;
  position?: string;
  publications_count: number;
  courses_taught?: string[];
  research_interests?: string[];
  education?: any;
  certifications?: string[];
  achievements?: ProfessorAchievement[];
  is_featured: boolean;
  professor_since?: string;
  display_order: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ProfessorStats {
  id: number;
  professor_id: string;
  articles_published: number;
  total_citations: number;
  courses_count: number;
  students_taught: number;
  research_papers: number;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  professor_id: string;
  duration?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  thumbnail_url?: string;
  price?: number;
  is_active: boolean;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProfessorAchievement {
  id: number;
  professor_id: string;
  title: string;
  description?: string;
  date_achieved?: string;
  category?: string;
  icon?: string;
  is_featured: boolean;
  created_at: string;
}

export interface ProfessorWithStats extends Professor {
  stats?: ProfessorStats | null;
  achievements?: ProfessorAchievement[];
  courses?: Course[];
}

export interface ProfessorCardData {
  id: string;
  name: string;
  position: string;
  institution: string;
  specialty: string;
  avatar_url?: string;
  courses_count: number;
  publications_count: number;
  is_featured: boolean;
}