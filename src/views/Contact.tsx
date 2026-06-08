"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '@/components/TerminalWindow';
import { AsciiDivider } from '@/components/AsciiDivider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Github, Linkedin, Mail, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const contactMethods = [
  { icon: Mail, label: 'Email', value: 'mjbshahid9919@gmail.com', href: 'mailto:mjbshahid9919@gmail.com' },
  { icon: Github, label: 'GitHub', value: '@Mujeeb02', href: 'https://github.com/Mujeeb02' },
  { icon: Linkedin, label: 'LinkedIn', value: 'Mujeeburrahman', href: 'https://linkedin.com/in/mujeeburrahman' },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '> Initializing contact form...',
    '> Ready to receive transmission.',
    '',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newOutput = [
      ...terminalOutput,
      `> Processing message from ${formData.name}...`,
      `> Validating email: ${formData.email}`,
      '> Encrypting transmission...',
    ];
    setTerminalOutput(newOutput);

    const { error } = await supabase.from('contacts').insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    if (error) {
      setTerminalOutput([...newOutput, `> ✗ Transmission failed: ${error.message}`, '']);
      toast.error('Failed to send message', { description: error.message });
      setIsSubmitting(false);
      return;
    }

    setTerminalOutput([
      ...newOutput,
      '> ✓ Message sent successfully!',
      '> Response expected within 24-48 hours.',
      '',
    ]);

    toast.success('Message sent successfully!', {
      description: "I'll get back to you within 24-48 hours.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-secondary">$</span> ./contact --init
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? Want to collaborate? Or just want to say hi?
            Drop me a message.
          </p>
        </motion.div>

        <AsciiDivider className="mb-12" />

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TerminalWindow title="send_message.sh">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">
                    <span className="text-secondary">$</span> NAME:
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className="bg-terminal-gray border-border focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">
                    <span className="text-secondary">$</span> EMAIL:
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className="bg-terminal-gray border-border focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">
                    <span className="text-secondary">$</span> SUBJECT:
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Project Inquiry"
                    required
                    className="bg-terminal-gray border-border focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">
                    <span className="text-secondary">$</span> MESSAGE:
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your message here..."
                    required
                    rows={6}
                    className="bg-terminal-gray border-border focus:border-primary font-mono resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="neon"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </TerminalWindow>
          </motion.div>

          {/* Terminal Output & Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Terminal Output */}
            <TerminalWindow title="stdout">
              <div className="min-h-[150px] font-mono text-sm">
                {terminalOutput.map((line, index) => (
                  <div
                    key={index}
                    className={
                      line.includes('✓')
                        ? 'text-primary'
                        : line.startsWith('>')
                          ? 'text-muted-foreground'
                          : ''
                    }
                  >
                    {line}
                  </div>
                ))}
                <span className="animate-blink text-primary">█</span>
              </div>
            </TerminalWindow>

            {/* Contact Methods */}
            <TerminalWindow title="contact_info.json">
              <div className="space-y-4">
                {contactMethods.map((method) => (
                  <a
                    key={method.label}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <method.icon className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                    <div>
                      <div className="text-xs text-muted-foreground">{method.label}</div>
                      <div className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {method.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <AsciiDivider className="my-4" variant="dots" />

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-secondary" />
                  SidharthaNagar, Uttar Pradesh
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-secondary" />
                  IST (UTC+5:30)
                </span>
              </div>
            </TerminalWindow>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
