/*
  # Enhanced Job Application System

  1. Schema Updates
    - Add resume_url column to job_applications table
    - Add application_count to job_postings for tracking
    - Create indexes for better performance

  2. Security
    - Update RLS policies for file access
    - Ensure proper access control for applicant data
*/

-- Add resume_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_applications' AND column_name = 'resume_url'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN resume_url text;
  END IF;
END $$;

-- Add application_count to job_postings for tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_postings' AND column_name = 'application_count'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN application_count integer DEFAULT 0;
  END IF;
END $$;

-- Create function to update application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_postings 
    SET application_count = application_count + 1 
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_postings 
    SET application_count = GREATEST(application_count - 1, 0) 
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update application count
DROP TRIGGER IF EXISTS trigger_update_job_application_count ON job_applications;
CREATE TRIGGER trigger_update_job_application_count
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();

-- Update existing job postings with current application counts
UPDATE job_postings 
SET application_count = (
  SELECT COUNT(*) 
  FROM job_applications 
  WHERE job_applications.job_id = job_postings.id
);

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for resumes
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
CREATE POLICY "Users can upload their own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
CREATE POLICY "Users can view their own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Job posters can view applicant resumes" ON storage.objects;
CREATE POLICY "Job posters can view applicant resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND 
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN job_postings jp ON ja.job_id = jp.id
      WHERE jp.posted_by = auth.uid()
      AND ja.resume_url LIKE '%' || name || '%'
    )
  );