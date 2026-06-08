import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <section className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
      <div className="text-center">
        <pre className="text-primary text-xs md:text-sm mb-8 font-mono">{`
  _  _    ___  _  _   
 | || |  / _ \\| || |  
 | || |_| | | | || |_ 
 |__   _| | | |__   _|
    | | | |_| |  | |  
    |_|  \\___/   |_|  
`}</pre>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          <span className="text-destructive">ERROR:</span> Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 font-mono text-sm">
          $ cat /requested/path<br />
          <span className="text-destructive">cat: No such file or directory</span>
        </p>
        <Button variant="neon" asChild>
          <Link href="/">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFound;
