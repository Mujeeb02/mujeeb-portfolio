import { Github, Linkedin, Mail } from 'lucide-react';
import { AsciiDivider } from './AsciiDivider';

const socialLinks = [
  { icon: Github, href: 'https://github.com/Mujeeb02', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/mujeeburrahman', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:mjbshahid9919@gmail.com', label: 'Email' },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <AsciiDivider className="mb-6" variant="line" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">©</span> {new Date().getFullYear()} mujeeburrahman
            <span className="text-secondary"> :: </span>
            built with <span className="text-primary">{'<code/>'}</span> & ☕
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="text-xs text-muted-foreground font-mono hidden md:block">
            <span className="text-secondary">status:</span>{' '}
            <span className="text-primary animate-pulse">● online</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <pre className="text-xs text-muted-foreground/50 hidden md:block">
            {`  _____   _____   _____   _____   _____
 |     | |     | |     | |     | |     |
 |_____| |_____| |_____| |_____| |_____|`}
          </pre>
        </div>
      </div>
    </footer>
  );
};
