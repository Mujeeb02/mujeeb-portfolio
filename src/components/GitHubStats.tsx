import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Code2,
  ExternalLink,
  Flame,
  GitFork,
  Github,
  Loader2,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const GITHUB_USERNAME = 'Mujeeb02';
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface GitHubUser {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  updated_at: string;
}

interface LanguageStats {
  [key: string]: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

interface ContributionGraphProps {
  contributions: ContributionDay[];
  totalsByYear: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#777BB4',
  Shell: '#89e051',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#fa7343',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
};

const statToneStyles = {
  primary: {
    iconWrap: 'bg-primary/10',
    icon: 'text-primary',
  },
  secondary: {
    iconWrap: 'bg-secondary/10',
    icon: 'text-secondary',
  },
  accent: {
    iconWrap: 'bg-accent',
    icon: 'text-accent-foreground',
  },
} as const;

const contributionLevelStyles = {
  0: 'bg-muted/20 border-border/30 text-muted-foreground/60',
  1: 'bg-primary/15 border-primary/20 text-foreground shadow-[0_0_8px_hsl(var(--primary)/0.1)]',
  2: 'bg-primary/30 border-primary/30 text-foreground shadow-[0_0_10px_hsl(var(--primary)/0.2)]',
  3: 'bg-primary/55 border-primary/50 text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]',
  4: 'bg-primary border-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.5)]',
} as const;

const padNumber = (value: number) => String(value).padStart(2, '0');

const createIsoDate = (year: number, monthIndex: number, day: number) => {
  return `${year}-${padNumber(monthIndex + 1)}-${padNumber(day)}`;
};

const parseLocalDate = (dateString: string) => new Date(`${dateString}T00:00:00`);

const formatDateLabel = (dateString: string, options: Intl.DateTimeFormatOptions) => {
  return new Intl.DateTimeFormat('en-US', options).format(parseLocalDate(dateString));
};

const getDayDifference = (previousDate: string, nextDate: string) => {
  const previous = parseLocalDate(previousDate).getTime();
  const next = parseLocalDate(nextDate).getTime();
  return Math.round((next - previous) / 86400000);
};

const getLongestStreak = (days: ContributionDay[]) => {
  const activeDays = [...days]
    .filter((day) => day.count > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!activeDays.length) return 0;

  let longest = 1;
  let current = 1;

  for (let index = 1; index < activeDays.length; index += 1) {
    if (getDayDifference(activeDays[index - 1].date, activeDays[index].date) === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  delay,
  tone = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delay: number;
  tone?: keyof typeof statToneStyles;
}) => {
  const styles = statToneStyles[tone];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative border border-border bg-card/50 backdrop-blur-sm p-4 rounded-lg hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', styles.iconWrap)}>
            <Icon className={cn('w-5 h-5', styles.icon)} />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LanguageBar = ({ languages }: { languages: LanguageStats }) => {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sortedLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="border border-border bg-card/50 backdrop-blur-sm p-6 rounded-lg"
    >
      <h3 className="text-primary font-mono text-sm mb-4 flex items-center gap-2">
        <Code2 className="w-4 h-4" />
        Most Used Languages
      </h3>

      <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-muted/30">
        {sortedLanguages.map(([lang, bytes]) => {
          const percentage = (bytes / total) * 100;
          return (
            <motion.div
              key={lang}
              initial={{ width: 0 }}
              whileInView={{ width: `${percentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-full"
              style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#6e7681' }}
              title={`${lang}: ${percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sortedLanguages.map(([lang, bytes]) => {
          const percentage = ((bytes / total) * 100).toFixed(1);
          return (
            <div key={lang} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#6e7681' }}
              />
              <span className="text-muted-foreground truncate">{lang}</span>
              <span className="text-foreground font-mono ml-auto">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const TopRepos = ({ repos }: { repos: GitHubRepo[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.4 }}
    className="border border-border bg-card/50 backdrop-blur-sm p-6 rounded-lg"
  >
    <h3 className="text-primary font-mono text-sm mb-4 flex items-center gap-2">
      <BookOpen className="w-4 h-4" />
      Top Repositories
    </h3>

    <div className="space-y-3">
      {repos.slice(0, 4).map((repo, index) => (
        <motion.a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="block p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-primary/30 transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-mono text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {repo.name}
              </h4>
              {repo.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {repo.description}
                </p>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#6e7681' }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {repo.forks_count}
            </span>
          </div>
        </motion.a>
      ))}
    </div>
  </motion.div>
);

const ContributionGraph = ({ contributions, totalsByYear, loading, error }: ContributionGraphProps) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);

  const availableYears = useMemo(() => {
    const years = new Set<number>();

    Object.keys(totalsByYear).forEach((year) => years.add(Number(year)));
    contributions.forEach((day) => years.add(Number(day.date.slice(0, 4))));

    return Array.from(years).sort((a, b) => b - a);
  }, [contributions, totalsByYear]);

  useEffect(() => {
    if (!availableYears.length) return;

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
      setSelectedMonth('all');
    }
  }, [availableYears, selectedYear]);

  const selectedYearDays = useMemo(() => {
    return contributions.filter((day) => Number(day.date.slice(0, 4)) === selectedYear);
  }, [contributions, selectedYear]);

  const monthlyStats = useMemo(() => {
    return MONTH_LABELS.map((label, index) => {
      const days = selectedYearDays.filter((day) => Number(day.date.slice(5, 7)) === index + 1);
      const total = days.reduce((sum, day) => sum + day.count, 0);
      const activeDays = days.filter((day) => day.count > 0).length;
      const peak = days.reduce<ContributionDay | null>((best, day) => {
        if (!best || day.count > best.count) return day;
        return best;
      }, null);

      return {
        index,
        label,
        total,
        activeDays,
        peak,
        days,
      };
    });
  }, [selectedYearDays]);

  const selectedMonthDays = useMemo(() => {
    if (selectedMonth === 'all') return selectedYearDays;
    return monthlyStats[selectedMonth]?.days ?? [];
  }, [monthlyStats, selectedMonth, selectedYearDays]);

  const selectedTotal = useMemo(() => {
    if (selectedMonth === 'all') {
      return totalsByYear[String(selectedYear)] ?? selectedYearDays.reduce((sum, day) => sum + day.count, 0);
    }

    return selectedMonthDays.reduce((sum, day) => sum + day.count, 0);
  }, [selectedMonth, selectedMonthDays, selectedYear, selectedYearDays, totalsByYear]);

  const activeDays = useMemo(() => {
    return selectedMonthDays.filter((day) => day.count > 0).length;
  }, [selectedMonthDays]);

  const longestStreak = useMemo(() => {
    return getLongestStreak(selectedMonthDays);
  }, [selectedMonthDays]);

  const peakDay = useMemo(() => {
    return selectedMonthDays
      .filter((day) => day.count > 0)
      .reduce<ContributionDay | null>((best, day) => {
        if (!best || day.count > best.count) return day;
        return best;
      }, null);
  }, [selectedMonthDays]);

  const mostActiveMonth = useMemo(() => {
    return [...monthlyStats].sort((a, b) => b.total - a.total)[0] ?? null;
  }, [monthlyStats]);

  const maxMonthTotal = useMemo(() => {
    return Math.max(...monthlyStats.map((month) => month.total), 1);
  }, [monthlyStats]);

  const calendarCells = useMemo(() => {
    if (selectedMonth === 'all') return [];

    const monthData = monthlyStats[selectedMonth];
    const firstDayOffset = new Date(selectedYear, selectedMonth, 1).getDay();
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const contributionsMap = new Map(monthData.days.map((day) => [day.date, day]));
    const cells: Array<ContributionDay | null> = [];

    for (let index = 0; index < firstDayOffset; index += 1) {
      cells.push(null);
    }

    for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
      const isoDate = createIsoDate(selectedYear, selectedMonth, dayNumber);
      cells.push(
        contributionsMap.get(isoDate) ?? {
          date: isoDate,
          count: 0,
          level: 0,
        },
      );
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [monthlyStats, selectedMonth, selectedYear]);

  const activeDaysList = useMemo(() => {
    return [...selectedMonthDays]
      .filter((day) => day.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.date.localeCompare(b.date);
      });
  }, [selectedMonthDays]);

  const selectedLabel = selectedMonth === 'all' ? `${selectedYear}` : `${MONTH_LABELS[selectedMonth]} ${selectedYear}`;
  const githubFrom = selectedMonth === 'all' ? `${selectedYear}-01-01` : createIsoDate(selectedYear, selectedMonth, 1);
  const githubTo =
    selectedMonth === 'all'
      ? `${selectedYear}-12-31`
      : createIsoDate(selectedYear, selectedMonth, new Date(selectedYear, selectedMonth + 1, 0).getDate());

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="border border-border bg-card/50 backdrop-blur-sm p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 text-primary font-mono text-sm mb-6">
          <Flame className="w-4 h-4" />
          Contribution Activity
        </div>
        <div className="flex items-center justify-center min-h-[280px]">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="font-mono text-xs">Loading contribution activity...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !availableYears.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="border border-border bg-card/50 backdrop-blur-sm p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 text-primary font-mono text-sm mb-4">
          <Flame className="w-4 h-4" />
          Contribution Activity
        </div>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {error ?? 'Contribution data is currently unavailable.'}
          </p>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-mono text-xs"
          >
            <Github className="w-3 h-3" />
            View activity on GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="border border-border bg-card/50 backdrop-blur-sm p-6 rounded-lg space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-primary font-mono text-sm flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Contribution Activity
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Explore yearly totals, monthly distribution, and daily activity for a specific month.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[130px] font-mono text-xs">
              <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth === 'all' ? 'all' : String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(value === 'all' ? 'all' : Number(value))}
          >
            <SelectTrigger className="w-[160px] font-mono text-xs">
              <SelectValue placeholder="Filter month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {MONTH_LABELS.map((month, index) => (
                <SelectItem key={month} value={String(index)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total contributions', value: selectedTotal },
          { label: 'Active days', value: activeDays },
          { label: 'Longest streak', value: `${longestStreak}d` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-mono">{item.label}</p>
            <p className="mt-2 text-2xl font-bold font-mono text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-mono">Peak day in {selectedLabel}</p>
          <p className="text-sm text-foreground font-medium mt-1">
            {peakDay
              ? `${formatDateLabel(peakDay.date, {
                  month: 'short',
                  day: 'numeric',
                  year: selectedMonth === 'all' ? 'numeric' : undefined,
                })} · ${peakDay.count} contribution${peakDay.count === 1 ? '' : 's'}`
              : 'No contributions recorded for this period.'}
          </p>
        </div>
        {selectedMonth === 'all' && mostActiveMonth ? (
          <div className="text-sm text-muted-foreground font-mono">
            Best month: <span className="text-foreground">{mostActiveMonth.label}</span> · {mostActiveMonth.total}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSelectedMonth('all')}
          className={cn(
            'rounded-lg border p-4 text-left transition-all',
            selectedMonth === 'all'
              ? 'border-primary bg-primary/10 shadow-sm'
              : 'border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/30',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm text-foreground">All months</span>
            <span className="text-xs text-muted-foreground">Year</span>
          </div>
          <p className="text-2xl font-bold font-mono text-primary mt-3">{totalsByYear[String(selectedYear)] ?? selectedTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Total activity in {selectedYear}</p>
        </motion.button>

        {monthlyStats.map((month) => (
          <motion.button
            key={month.label}
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedMonth(month.index)}
            className={cn(
              'rounded-lg border p-4 text-left transition-all',
              selectedMonth === month.index
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/30',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-foreground">{month.label}</span>
              <span className="text-xs text-muted-foreground">{month.activeDays}d</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground mt-3">{month.total}</p>
            <div className="mt-3 h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', month.total > 0 ? 'bg-primary' : 'bg-muted')}
                style={{ width: `${(month.total / maxMonthTotal) * 100}%` }}
              />
            </div>
          </motion.button>
        ))}
      </div>

      {selectedMonth === 'all' ? (
        <div className="rounded-lg border border-border bg-muted/20 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-mono text-sm text-foreground">Year overview</p>
              <p className="text-xs text-muted-foreground mt-1">Choose any month above to inspect its daily contribution pattern.</p>
            </div>
            <a
              href={`https://github.com/${GITHUB_USERNAME}?tab=overview&from=${githubFrom}&to=${githubTo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-mono"
            >
              <Github className="w-3 h-3" />
              Open on GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            {monthlyStats
              .filter((month) => month.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((month) => (
                <div key={month.label} className="flex items-center gap-3">
                  <div className="w-10 text-xs text-muted-foreground font-mono">{month.label}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(month.total / maxMonthTotal) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-mono text-foreground">{month.total}</div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.35fr_0.9fr] gap-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="font-mono text-sm text-foreground">Daily heatmap · {selectedLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">Each tile represents one day in the selected month.</p>
              </div>
              <a
                href={`https://github.com/${GITHUB_USERNAME}?tab=overview&from=${githubFrom}&to=${githubTo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-mono"
              >
                <ExternalLink className="w-3 h-3" />
                View source
              </a>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAY_LABELS.map((day) => (
                <div key={day} className="text-[11px] text-muted-foreground font-mono text-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, index) => (
                <motion.div
                  key={day ? day.date : `empty-${index}`}
                  whileHover={day ? { scale: 1.04 } : undefined}
                  className={cn(
                    'aspect-square rounded-md border flex flex-col items-center justify-center text-[11px] font-mono transition-colors',
                    day ? contributionLevelStyles[day.level as keyof typeof contributionLevelStyles] ?? contributionLevelStyles[0] : 'border-transparent bg-transparent',
                  )}
                  title={
                    day
                      ? `${formatDateLabel(day.date, { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.count} contribution${day.count === 1 ? '' : 's'}`
                      : undefined
                  }
                >
                  {day ? (
                    <>
                      <span>{Number(day.date.slice(8, 10))}</span>
                      {day.count > 0 ? <span className="text-[10px] opacity-80">{day.count}</span> : null}
                    </>
                  ) : null}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn('w-4 h-4 rounded-sm border', contributionLevelStyles[level as keyof typeof contributionLevelStyles])}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="mb-4">
              <p className="font-mono text-sm text-foreground">Active days</p>
              <p className="text-xs text-muted-foreground mt-1">Sorted by contribution count for {selectedLabel}.</p>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {activeDaysList.length ? (
                activeDaysList.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-md border border-border bg-background/40 px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm text-foreground font-medium">
                        {formatDateLabel(day.date, { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {WEEKDAY_LABELS[parseLocalDate(day.date).getDay()]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono text-primary">{day.count}</p>
                      <p className="text-[11px] text-muted-foreground">contributions</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No contribution activity recorded for this month.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ProfileCard = ({ user }: { user: GitHubUser }) => {
  const joinDate = new Date(user.created_at);
  const yearsSince = new Date().getFullYear() - joinDate.getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="border border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 rounded-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent" />

      <div className="flex items-start gap-4">
        <motion.img
          src={user.avatar_url}
          alt={user.name || user.login}
          className="w-20 h-20 rounded-full border-2 border-primary/50"
          whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary))' }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-foreground truncate">
            {user.name || user.login}
          </h3>
          <p className="text-primary font-mono text-sm">@{user.login}</p>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-primary">{user.public_repos}</p>
          <p className="text-xs text-muted-foreground">Repos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-secondary">{user.followers}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-foreground">{user.following}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Member since {joinDate.getFullYear()} ({yearsSince}+ years)</span>
      </div>

      <motion.a
        href={user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 w-full mt-6 py-3 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary text-primary rounded-lg transition-all font-mono text-sm"
      >
        <Github className="w-4 h-4" />
        View Full Profile
        <ExternalLink className="w-3 h-3" />
      </motion.a>
    </motion.div>
  );
};

export const GitHubStats = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [languages, setLanguages] = useState<LanguageStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [contributionTotals, setContributionTotals] = useState<Record<string, number>>({});
  const [contributionLoading, setContributionLoading] = useState(true);
  const [contributionError, setContributionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        setContributionLoading(true);

        const [userResult, reposResult, contributionResult] = await Promise.allSettled([
          fetchJson<GitHubUser>(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetchJson<GitHubRepo[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
          fetchJson<ContributionResponse>(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`),
        ]);

        if (userResult.status !== 'fulfilled' || reposResult.status !== 'fulfilled') {
          throw new Error('Failed to fetch GitHub data');
        }

        const userData = userResult.value;
        const reposData = reposResult.value;

        setUser(userData);
        setRepos(reposData.sort((a, b) => b.stargazers_count - a.stargazers_count));

        const stars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const forks = reposData.reduce((acc, repo) => acc + repo.forks_count, 0);
        setTotalStars(stars);
        setTotalForks(forks);

        const langStats: LanguageStats = {};
        reposData.forEach((repo) => {
          if (repo.language) {
            langStats[repo.language] = (langStats[repo.language] || 0) + 1;
          }
        });
        setLanguages(langStats);

        if (contributionResult.status === 'fulfilled') {
          setContributions(contributionResult.value.contributions ?? []);
          setContributionTotals(contributionResult.value.total ?? {});
          setContributionError(null);
        } else {
          setContributionError('Unable to load month-wise contribution data right now.');
        }

        setError(null);
      } catch (err) {
        setError('Failed to load GitHub stats. Please try again later.');
        console.error('GitHub API error:', err);
      } finally {
        setLoading(false);
        setContributionLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-mono text-sm">Loading GitHub stats...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground text-center">{error}</p>
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-mono text-sm"
        >
          Visit GitHub Profile →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Repositories" value={user.public_repos} delay={0.1} />
        <StatCard icon={Star} label="Total Stars" value={totalStars} delay={0.15} tone="accent" />
        <StatCard icon={GitFork} label="Total Forks" value={totalForks} delay={0.2} tone="secondary" />
        <StatCard icon={Users} label="Followers" value={user.followers} delay={0.25} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ProfileCard user={user} />
        <LanguageBar languages={languages} />
      </div>
    </div>
  );
};

// Components kept in file for future re-use; reference to silence unused warnings
void TopRepos; void ContributionGraph;
