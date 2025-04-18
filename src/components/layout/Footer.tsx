import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const footerLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/terms', label: 'Terms' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/contact', label: 'Contact' },
  { path: '/faq', label: 'FAQ' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row md:py-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} IdeaCollabHub. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
