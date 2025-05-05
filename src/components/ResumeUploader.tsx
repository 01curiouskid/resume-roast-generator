
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeUploaderProps {
  className?: string;
  onUpload: (file: File) => void;
}

export function ResumeUploader({ className, onUpload }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };
  
  const validateAndProcessFile = (file: File) => {
    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file", {
        description: "Only PDF files are supported"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 5MB"
      });
      return;
    }
    
    setFileName(file.name);
    onUpload(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div 
      className={cn(className, "w-full max-w-md")}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        className="hidden" 
        accept=".pdf" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <div 
        className={cn(
          "upload-zone",
          isDragging && "border-primary bg-primary/10",
          fileName && "bg-muted"
        )}
      >
        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="h-10 w-10 text-primary animate-bounce-slow" />
            <p className="font-medium">{fileName}</p>
            <Button className="btn-glow">Get Roasted</Button>
          </div>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary animate-bounce-slow" />
            </div>
            <p className="text-lg font-medium mb-2">Upload Your Resume</p>
            <p className="text-sm text-muted-foreground text-center">
              Drag & drop your PDF resume or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Max file size: 5MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
