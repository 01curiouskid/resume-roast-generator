
import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { RandomTitle } from '@/components/RandomTitle';
import { ResumeUploader } from '@/components/ResumeUploader';
import { RoastDisplay } from '@/components/RoastDisplay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { requestRoast } from '@/services/roastService';
import { getResumeStatus } from '@/services/resumeService';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadError, setShowUploadError] = useState(false);
  const [roastContent, setRoastContent] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  
  const handleUpload = useCallback((file: File, id: string) => {
    setResumeFile(file);
    setResumeId(id);
  }, []);
  
  // Poll for resume status
  useEffect(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    if (resumeId && isLoading) {
      const interval = window.setInterval(async () => {
        try {
          const status = await getResumeStatus(resumeId);
          console.log('Resume status:', status);
          
          if (status === 'completed') {
            clearInterval(interval);
            setPollingInterval(null);
            setIsLoading(false);
            
            // Get the roast result
            const response = await requestRoast(resumeId);
            if (response.success) {
              setRoastContent(response.content);
              setShareId(response.shareId);
              toast.success("Your resume has been roasted!", {
                description: "Enjoy the brutally honest feedback."
              });
            } else {
              toast.error("Failed to generate roast", {
                description: response.error || "Something went wrong"
              });
            }
          } else if (status === 'error') {
            clearInterval(interval);
            setPollingInterval(null);
            setIsLoading(false);
            toast.error("Processing failed", {
              description: "Something went wrong while processing your resume."
            });
          }
        } catch (error) {
          console.error('Error polling resume status:', error);
        }
      }, 2000);
      
      setPollingInterval(interval as unknown as number);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [resumeId, isLoading]);
  
  const handleRoast = async () => {
    if (!resumeId) {
      setShowUploadError(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await requestRoast(resumeId);
      
      if (response.success) {
        setRoastContent(response.content);
        setShareId(response.shareId);
        setIsLoading(false);
        toast.success("Your resume has been roasted!", {
          description: "Enjoy the brutally honest feedback."
        });
      } else {
        // If we get an immediate error, display it
        setIsLoading(false);
        toast.error("Failed to generate roast", {
          description: response.error || "Something went wrong"
        });
      }
    } catch (error) {
      console.error('Error requesting roast:', error);
      setIsLoading(false);
      toast.error("Failed to generate roast", {
        description: "An unexpected error occurred"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12 py-8 px-4">
        <RandomTitle className="text-center mb-4 animate-fade-in" />
        
        {!roastContent ? (
          <>
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
          </>
        ) : (
          <RoastDisplay 
            content={roastContent} 
            shareId={shareId || undefined}
            className="animate-fade-in"
          />
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
