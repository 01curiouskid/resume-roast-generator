
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { RoastDisplay } from '@/components/RoastDisplay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRoastByShareId } from '@/services/roastService';

const Share = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [roastContent, setRoastContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRoast = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }
      
      try {
        const roast = await getRoastByShareId(shareId);
        
        if (roast) {
          setRoastContent(roast.content);
        } else {
          setError("Roast not found");
        }
      } catch (err) {
        console.error('Error fetching roast:', err);
        setError("Failed to load roast");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoast();
  }, [shareId]);
  
  const handleCreateYourOwn = () => {
    window.location.href = '/';
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 py-12 px-4">
          <h1 className="text-3xl font-bold text-white">Loading Roast...</h1>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 py-12 px-4">
          <h1 className="text-3xl font-bold text-white">Oops!</h1>
          <p className="text-xl text-muted-foreground text-center">{error}</p>
          <Button onClick={handleCreateYourOwn} className="mt-4">
            Create Your Own Roast
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12 py-8 px-4">
        <h1 className="text-3xl md:text-5xl font-bold gradient-text animate-fade-in">
          Someone's Resume Got Roasted!
        </h1>
        
        {roastContent && (
          <RoastDisplay 
            content={roastContent}
            className="animate-fade-in"
          />
        )}
        
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Button 
            onClick={handleCreateYourOwn}
            className="btn-glow bg-roast-purple hover:bg-roast-purple/90 text-white font-medium px-8 py-6 text-lg"
          >
            Create Your Own Roast
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Share;
