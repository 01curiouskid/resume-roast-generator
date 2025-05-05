
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface ResumeUploadResponse {
  resumeId: string;
  success: boolean;
  error?: string;
}

/**
 * Upload a resume file to Supabase storage and create a record in the resumes table
 */
export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  try {
    // Create a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { 
        resumeId: '', 
        success: false, 
        error: `Error uploading file: ${uploadError.message}` 
      };
    }

    // Create a record in the resumes table
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        file_path: filePath,
        status: 'uploaded'
      })
      .select('id')
      .single();

    if (resumeError) {
      console.error('Error creating resume record:', resumeError);
      return { 
        resumeId: '', 
        success: false, 
        error: `Error creating resume record: ${resumeError.message}` 
      };
    }

    return {
      resumeId: resumeData.id,
      success: true
    };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return { 
      resumeId: '', 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Get the status of a resume processing
 */
export async function getResumeStatus(resumeId: string): Promise<string> {
  const { data, error } = await supabase
    .from('resumes')
    .select('status')
    .eq('id', resumeId)
    .single();

  if (error) {
    console.error('Error fetching resume status:', error);
    return 'error';
  }

  return data.status;
}

/**
 * Get a resume by ID
 */
export async function getResume(resumeId: string) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (error) {
    console.error('Error fetching resume:', error);
    return null;
  }

  return data;
}
