
-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to resumes for simplicity in this demo
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
