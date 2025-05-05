
import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { RandomTitle } from '@/components/RandomTitle';
import { ResumeUploader } from '@/components/ResumeUploader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadError, setShowUploadError] = useState(false);
  
  const handleUpload = useCallback((file: File, id: string) => {
    setResumeFile(file);
    setResumeId(id);
  }, []);
  
  const handleRoast = () => {
    if (!resumeId) {
      setShowUploadError(true);
      return;
    }
    
    setIsLoading(true);
    // Simulate loading time for Phase 2
    // In Phase 3, we'll replace with actual roast generation
    setTimeout(() => {
      setIsLoading(false);
      toast.info("Roasting feature coming soon!", {
        description: "Phase 2 includes file upload. The roasting feature will be added in Phase 3!"
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
      
      <AlertDialog open={showUploadError} onOpenChange={setShowUploadError}>
        <AlertDialogContent>
          <AlertDialogTitle>Upload Error</AlertDialogTitle>
          <AlertDialogDescription>
            There was a problem with your resume upload. Please try uploading again.
          </AlertDialogDescription>
          <Button onClick={() => setShowUploadError(false)} className="mt-4">
            OK
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Index;
