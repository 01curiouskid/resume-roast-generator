
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';

interface RoastDisplayProps {
  content: string;
  shareId?: string;
  className?: string;
}

export function RoastDisplay({ content, shareId, className }: RoastDisplayProps) {
  const [shareUrl, setShareUrl] = useState<string>('');
  
  useEffect(() => {
    if (shareId) {
      // Construct the share URL based on the current URL
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/share/${shareId}`);
    }
  }, [shareId]);
  
  const handleCopyRoast = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard", {
      description: "The roast has been copied to your clipboard"
    });
  };
  
  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied", {
        description: "Anyone with this link can view the roast"
      });
    }
  };
  
  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Resume Roast</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyRoast}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            {shareUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyShareLink}
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </div>
  );
}
