"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, Cpu, Terminal, Zap } from 'lucide-react';
import { GlitchText } from '@/components/GlitchText';
import { AsciiDivider } from '@/components/AsciiDivider';
import { HomeTerminal } from '@/components/HomeTerminal';
import { PacmanGame } from '@/components/PacmanGame';
import { FeaturedShowcase } from '@/components/FeaturedShowcase';
import { GitHubStats } from '@/components/GitHubStats';

const asciiLines = [
  "██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗ ███████╗██████╗ ",
  "██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗██╔════╝██╔══██╗",
  "██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝█████╗  ██████╔╝",
  "██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗",
  "██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║     ███████╗██║  ██║",
  "╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝",
];

const stats = [
  { icon: Code2, label: 'Projects Built', value: '10+' },
  { icon: Cpu, label: 'Technologies', value: '25+' },
  { icon: Terminal, label: 'DSA Problems', value: '530+' },
  { icon: Zap, label: 'Cups of Coffee', value: '∞' },
];

const Index = () => {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Animated ASCII Art with Glow */}
          <div className="hidden md:block text-center mb-4 overflow-x-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              className="inline-block relative"
            >
              {/* Glow layer behind ASCII */}
              <motion.div
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 blur-xl bg-primary/20 rounded-full"
              />

              {asciiLines.map((line, index) => (
                <motion.pre
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: "easeOut"
                  }}
                  className="text-primary text-[5px] sm:text-[8px] md:text-xs leading-tight font-mono whitespace-pre relative z-10"
                  style={{
                    textShadow: '0 0 20px hsl(var(--neon-green) / 0.7), 0 0 40px hsl(var(--neon-green) / 0.4)'
                  }}
                >
                  {line}
                </motion.pre>
              ))}
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mb-6 hidden md:block"
          >
            <p className="text-muted-foreground text-sm md:text-base font-mono">
              <span className="text-secondary">{">"}</span> Full Stack Developer
              <span className="text-primary mx-2">|</span>
              Building Digital Experiences
              <span className="text-primary mx-2">|</span>
              Mujeeburrahman <span className="text-secondary">{"<"}</span>
            </p>
          </motion.div>

          {/* Mobile Title */}
          <div className="md:hidden text-center mb-6">
            <GlitchText
              text="DEVELOPER"
              as="h1"
              className="text-4xl font-bold text-primary neon-text"
            />
            <p className="text-muted-foreground mt-2 text-sm">Mujeeburrahman</p>
          </div>

          {/* Interactive Terminal & Game Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <h3 className="text-primary font-mono text-sm mb-2 text-center lg:text-left blink-text">
                {'>'} SYSTEM_TERMINAL
              </h3>
              <HomeTerminal />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full"
            >
              <h3 className="text-secondary font-mono text-sm mb-2 text-center lg:text-left blink-text">
                {'>'} SYSTEM_ENTERTAINMENT_MODULE
              </h3>
              <PacmanGame />
            </motion.div>
          </div>

          <AsciiDivider className="my-10" variant="dots" />

          {/* Stats with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showStats ? 1 : 0, y: showStats ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: showStats ? 1 : 0, scale: showStats ? 1 : 0.9 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 30px hsl(var(--neon-green) / 0.3)',
                }}
                className="relative p-[1px] rounded-lg bg-gradient-to-br from-primary/50 via-transparent to-secondary/50 group cursor-default"
              >
                <div className="p-4 rounded-lg bg-card/80 backdrop-blur-sm text-center h-full">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-secondary group-hover:text-primary transition-colors duration-300" />
                  <motion.div
                    className="text-2xl font-bold text-foreground mb-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Enhanced Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-muted-foreground"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs font-mono">scroll to explore</span>
            <div className="w-5 h-8 rounded-full border border-primary/50 flex justify-center pt-1">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-2 bg-primary rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* GitHub Stats Section */}
      <section className="py-20 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono">
                LIVE DATA FROM GITHUB API
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              <span className="text-secondary">{'//'}</span> GitHub Profile
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Real-time profile snapshot and language breakdown from my open-source work
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <GitHubStats />
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-20 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              <span className="text-secondary">{'//'}</span> Featured Work & Writing
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A live feed of projects I'm proud of and articles fresh from the editor
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <FeaturedShowcase />
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              <span className="text-secondary">{'//'}</span> Quick Navigation
            </h2>
            <p className="text-muted-foreground">Or use the terminal above to navigate</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { to: '/about', title: 'About Me', desc: 'Learn more about my journey and expertise', cmd: 'cat about.md' },
              { to: '/blog', title: 'Blog Posts', desc: 'Technical articles and tutorials', cmd: 'ls ./blog' },
              { to: '/projects', title: 'Projects', desc: 'Explore my open source work', cmd: 'git log --oneline' },
            ].map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={item.to}
                  className="block p-6 border border-border bg-card/30 hover:border-primary hover:bg-card/50 transition-all duration-300 group"
                >
                  <div className="text-xs text-muted-foreground mb-2 font-mono">
                    $ {item.cmd}
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
