
import { supabase } from "@/integrations/supabase/client";

export interface RoastResponse {
  roastId: string;
  shareId: string;
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Request a roast for a resume
 */
export async function requestRoast(resumeId: string): Promise<RoastResponse> {
  try {
    // Call the roast-resume edge function
    const { data, error } = await supabase.functions.invoke('roast-resume', {
      body: { resumeId },
    });

    if (error) {
      console.error('Error requesting roast:', error);
      return { 
        roastId: '', 
        shareId: '',
        content: '',
        success: false, 
        error: `Error requesting roast: ${error.message}` 
      };
    }

    return {
      roastId: data.roastId,
      shareId: data.shareId,
      content: data.content,
      success: true
    };
  } catch (error) {
    console.error('Unexpected error during roast request:', error);
    return { 
      roastId: '', 
      shareId: '',
      content: '',
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Get a roast by ID
 */
export async function getRoast(roastId: string) {
  const { data, error } = await supabase
    .from('roasts')
    .select('*')
    .eq('id', roastId)
    .single();

  if (error) {
    console.error('Error fetching roast:', error);
    return null;
  }

  return data;
}

/**
 * Get a roast by share ID
 */
export async function getRoastByShareId(shareId: string) {
  const { data, error } = await supabase
    .from('roasts')
    .select('*')
    .eq('share_id', shareId)
    .single();

  if (error) {
    console.error('Error fetching roast by share ID:', error);
    return null;
  }

  return data;
}
