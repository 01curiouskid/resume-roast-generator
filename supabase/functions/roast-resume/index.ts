
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!resumeContent) {
      // Simulate text extraction (In a real app, you would use a PDF extraction service)
      resumeContent = "This is a simulated resume content. In a real application, we would extract the text from the PDF.";
      
      // Update the resume with the extracted content
      await supabase
        .from('resumes')
        .update({ content: resumeContent })
        .eq('id', resumeId);
    }
    
    // Generate the roast using the OpenAI API
    const roastContent = await generateRoastWithOpenAI(resumeContent);
    
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

async function generateRoastWithOpenAI(resumeContent: string): Promise<string> {
  if (!openAIApiKey) {
    console.warn("No OpenAI API key set - using mock response");
    return mockRoastResponse(resumeContent);
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      console.error('OpenAI API error:', data.error);
      return mockRoastResponse(resumeContent);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
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
