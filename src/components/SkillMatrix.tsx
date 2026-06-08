import { cn } from '@/lib/utils';

interface Skill {
  name: string;
  level: number; // 0-100
  category?: string;
}

interface SkillBarProps {
  skill: Skill;
  delay?: number;
}

export const SkillBar = ({ skill, delay = 0 }: SkillBarProps) => {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-foreground font-mono">
          <span className="text-muted-foreground">{'>'}</span> {skill.name}
        </span>
        <span className="text-xs text-muted-foreground">
          [{skill.level}%]
        </span>
      </div>
      <div className="h-2 bg-terminal-gray border border-border overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out',
            'group-hover:shadow-[0_0_10px_hsl(var(--neon-green)/0.5)]'
          )}
          style={{
            width: `${skill.level}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
};

interface SkillMatrixProps {
  skills: Skill[];
}

export const SkillMatrix = ({ skills }: SkillMatrixProps) => {
  return (
    <div className="grid gap-4">
      {skills.map((skill, index) => (
        <SkillBar key={skill.name} skill={skill} delay={index * 100} />
      ))}
    </div>
  );
};
