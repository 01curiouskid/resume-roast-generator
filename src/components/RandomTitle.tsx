
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const titles = [
  "Another Day, Another Delusion",
  "Resume: The Fiction Section",
  "Your Career, But Funny",
  "Lies, Damned Lies, and Resumes",
  "In a World Full of Qualified People...",
  "Resume: Corporate Fan Fiction",
  "Career Aspirations vs Reality",
  "Resumes: When Creative Writing Pays Off",
  "Professional Delusions, Documented",
  "Let's Roast Your Professional Life Choices"
];

export function RandomTitle({ className }: { className?: string }) {
  const [title, setTitle] = useState("");
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * titles.length);
    setTitle(titles[randomIndex]);
  }, []);
  
  return (
    <h1 className={cn("text-3xl md:text-5xl font-bold gradient-text", className)}>
      {title}
    </h1>
  );
}
