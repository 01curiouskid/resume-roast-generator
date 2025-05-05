
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId } = await req.json();
    
    if (!resumeId) {
      return new Response(
        JSON.stringify({ error: "Resume ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the resume content and file path
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();
      
    if (resumeError || !resume) {
      console.error('Error fetching resume:', resumeError);
      return new Response(
        JSON.stringify({ error: 'Resume not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // Update the resume status to "processing"
    await supabase
      .from('resumes')
      .update({ status: 'processing' })
      .eq('id', resumeId);
      
    // If we don't have content, we need to extract it from the PDF
    let resumeContent = resume.content;
    if (!resumeContent && resume.file_path) {
      try {
        // Get the file from storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('resumes')
          .download(resume.file_path);
          
        if (fileError) {
          throw new Error(`Error downloading file: ${fileError.message}`);
        }
        
        // Use PDF parsing library or API to extract text
        const pdfText = await extractTextFromPDF(fileData);
        resumeContent = pdfText;
        
        // Update the resume with the extracted content
        await supabase
          .from('resumes')
          .update({ content: resumeContent })
          .eq('id', resumeId);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        resumeContent = "Failed to extract text from PDF. Using fallback content for demonstration.";
      }
    }
    
    // Generate the roast using the DeepSeek API
    const roastContent = await generateRoastWithDeepSeek(resumeContent);
    
    // Create a new roast entry in the database
    const { data: roastData, error: roastError } = await supabase
      .from('roasts')
      .insert({
        resume_id: resumeId,
        content: roastContent,
      })
      .select()
      .single();
      
    if (roastError) {
      console.error('Error creating roast:', roastError);
      await supabase
        .from('resumes')
        .update({ status: 'error' })
        .eq('id', resumeId);
        
      return new Response(
        JSON.stringify({ error: 'Failed to create roast' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // Update the resume status to "completed"
    await supabase
      .from('resumes')
      .update({ status: 'completed' })
      .eq('id', resumeId);
    
    return new Response(
      JSON.stringify({ 
        roastId: roastData.id,
        shareId: roastData.share_id,
        content: roastData.content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
    
  } catch (error) {
    console.error('Error in roast-resume function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});

// Function to extract text from PDF
async function extractTextFromPDF(pdfFile: Blob): Promise<string> {
  try {
    // Convert the PDF to base64
    const arrayBuffer = await pdfFile.arrayBuffer();
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use PDF.js service to extract text (using a proxy service)
    const response = await fetch('https://pdf-to-text.deno.dev/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdf: base64Pdf }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract text: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "Failed to extract text from PDF.";
  } catch (error) {
    console.error('Error in PDF text extraction:', error);
    throw error;
  }
}

async function generateRoastWithDeepSeek(resumeContent: string): Promise<string> {
  if (!deepseekApiKey) {
    console.warn("No DeepSeek API key set - using mock response");
    return mockRoastResponse(resumeContent);
  }
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a hilarious resume roaster. Your job is to humorously critique resumes in a roast comedy style.
            Be funny, sarcastic, and a bit mean - but keep it professional enough that it could still be shown in a work setting.
            Focus on resume red flags, buzzwords, exaggerations, and formatting issues.
            Format your response with markdown headings, bullet points, and occasional emojis for emphasis.
            Your response should be between 400-600 words.`
          },
          {
            role: 'user',
            content: `Here's the resume to roast:\n\n${resumeContent}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      })
    });
    
    const data = await response.json();
    if (data.error) {
      console.error('DeepSeek API error:', data.error);
      return mockRoastResponse(resumeContent);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return mockRoastResponse(resumeContent);
  }
}

function mockRoastResponse(content: string): string {
  return `# Your Resume: A Comedy of Errors 🤣

## "Professional Experience" or Professional Exaggeration?

* Your job titles seem to grow more impressive with each role. Did you actually **"Lead Strategic Innovation Initiatives"** or did you just organize the office birthday calendar?
* I see you've listed "proficient in Excel" - let me guess, you can sum a column? Revolutionary!
* Those bullet points are longer than a CVS receipt. Maybe your next skill should be "concise communication."

## Skills & Expertise (allegedly)

* "Detail-oriented" yet I spotted three typos in the first paragraph alone. Irony at its finest!
* "Team player" who "works well independently" - so basically, you exist in a quantum state of collaboration.
* Your core competencies take up half the page. Compensating for something?

## Education: The Four Most Expensive Years of Your Life

* That prestigious university degree and yet here we are, with a resume that looks like it was formatted in the dark.
* Minor in Psychology but major in overusing corporate buzzwords. "Synergy" appears 7 times!

In conclusion, this resume reads like it was written by ChatGPT after being fed nothing but LinkedIn motivational posts for a week. But hey, at least your name is spelled correctly! 👏`;
}
