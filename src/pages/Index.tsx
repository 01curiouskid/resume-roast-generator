
import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { RandomTitle } from '@/components/RandomTitle';
import { ResumeUploader } from '@/components/ResumeUploader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpload = useCallback((file: File) => {
    setResumeFile(file);
    // In Phase 1, we're just mocking the upload
    toast.success("Resume uploaded successfully!", {
      description: "We're ready to roast your professional life choices!"
    });
  }, []);
  
  const handleRoast = () => {
    // This is just a placeholder for Phase 1
    setIsLoading(true);
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      toast.info("Roasting feature coming soon!", {
        description: "Phase 1 is just the UI. The roasting feature will be added in Phase 2!"
      });
    }, 2000);
  };
  
  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12 py-8 px-4">
        <RandomTitle className="text-center mb-4 animate-fade-in" />
        
        <div className="w-full">
          <ResumeUploader
            onUpload={handleUpload}
            className="mx-auto animate-fade-in"
          />
        </div>
        
        {resumeFile && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <Button 
              onClick={handleRoast}
              className="btn-glow bg-roast-purple hover:bg-roast-purple/90 text-white font-medium px-8 py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Preparing to roast..." : "Roast Me!"}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center max-w-md">
              By clicking "Roast Me", you acknowledge that you're subjecting your resume to merciless mockery.
              <br />
              <span className="text-xs italic">For entertainment purposes only.</span>
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
