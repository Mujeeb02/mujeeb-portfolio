"use client";

import { motion } from 'framer-motion';
import { TerminalWindow } from '@/components/TerminalWindow';
import { AsciiDivider } from '@/components/AsciiDivider';
import { SkillMatrix } from '@/components/SkillMatrix';
import { Calendar, MapPin, Briefcase, GraduationCap, Award, ExternalLink } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const About = () => {
  const { bio, skills, experiences, certifications, loading } = useSiteContent();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-secondary">$</span> cat about.md
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {bio?.headline ?? 'Full Stack Developer'}
          </p>
        </motion.div>

        <AsciiDivider className="mb-12" />

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <TerminalWindow title="bio.txt">
              <div className="space-y-4 text-sm">
                {(bio?.paragraphs ?? []).map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">
                    <span className="text-secondary">{'>'}</span> {p}
                  </p>
                ))}
                <div className="flex flex-wrap gap-4 pt-4 text-xs">
                  {bio?.location && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3 text-secondary" /> {bio.location}
                    </span>
                  )}
                  {bio?.availability && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="w-3 h-3 text-secondary" /> {bio.availability}
                    </span>
                  )}
                </div>
                {loading && !bio && <p className="text-muted-foreground">Loading bio...</p>}
              </div>
            </TerminalWindow>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <TerminalWindow title="skills.json">
              <SkillMatrix skills={skills.map(s => ({ name: s.name, level: s.level, category: s.category }))} />
            </TerminalWindow>
          </motion.div>
        </div>

        <AsciiDivider className="my-12" variant="wave" />

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <span className="text-secondary">{'//'}</span> Experience
          </h2>
          <div className="space-y-6">
            {experiences.map((job, index) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }} viewport={{ once: true }}
                className="p-6 border border-border bg-card/30 hover:border-primary transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                  <span className="text-xs text-muted-foreground px-2 py-1 border border-border">{job.period}</span>
                </div>
                <p className="text-secondary text-sm mb-3">{job.company}</p>
                <p className="text-muted-foreground text-sm mb-4 whitespace-pre-line">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.technologies.map((tech) => (
                    <span key={tech} className="text-xs px-2 py-1 bg-terminal-gray text-muted-foreground">{tech}</span>
                  ))}
                </div>
              </motion.div>
            ))}
            {experiences.length === 0 && <p className="text-muted-foreground text-center py-8">No experience added yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" />
            <span className="text-secondary">{'//'}</span> Certifications
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <motion.div key={cert.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }} viewport={{ once: true }}
                className="p-4 border border-border bg-card/30 hover:border-secondary transition-all duration-300 text-center">
                {cert.image_url ? (
                  <img src={cert.image_url} alt={cert.name} className="w-full h-28 object-cover rounded mb-3" />
                ) : (
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-secondary" />
                )}
                <h3 className="font-bold text-foreground text-sm mb-1">{cert.name}</h3>
                {cert.issuer && <p className="text-xs text-secondary">{cert.issuer}</p>}
                <span className="text-xs text-muted-foreground">{cert.year}</span>
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            ))}
            {certifications.length === 0 && <p className="text-muted-foreground text-center py-8 col-span-full">No certifications added yet.</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
