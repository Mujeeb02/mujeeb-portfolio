import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Star, GitFork, Heart, MessageSquare, Send, X, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { useProjects, Project } from '@/contexts/ProjectContext';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={cn(
            'transition-colors',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          )}
        >
          <Star
            className={cn(
              'w-4 h-4 transition-colors',
              (hoverRating || rating) >= star
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const { likeProject, unlikeProject, isLiked, addReview, getAverageRating } = useProjects();
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });

  const liked = isLiked(project.id);
  const avgRating = getAverageRating(project.id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      unlikeProject(project.id);
    } else {
      likeProject(project.id);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.comment.trim()) {
      addReview(project.id, newReview.rating, newReview.comment.trim(), newReview.author.trim() || 'Anonymous');
      setNewReview({ author: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        'group relative p-6 border border-border bg-card/50 backdrop-blur-sm transition-all duration-500',
        'hover:border-primary hover:shadow-[0_0_30px_hsl(var(--neon-green)/0.2)]',
        project.featured && 'border-primary/50'
      )}
    >
      {/* Scanline effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent animate-scan-line" />
      </div>

      {/* Featured badge */}
      {project.featured && (
        <div className="absolute -top-3 left-4 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold">
          FEATURED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          <span className="text-secondary">./</span>
          {project.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {project.stars !== undefined && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {project.stars}
            </span>
          )}
          {project.forks !== undefined && (
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {project.forks}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        <span className="text-secondary">{'//'}</span> {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs border border-border text-muted-foreground hover:border-secondary hover:text-secondary transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Like & Review Stats */}
      <div className="flex items-center gap-4 mb-4 py-3 border-t border-b border-border/50">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-2 text-sm transition-all duration-300',
            liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
          )}
        >
          <Heart className={cn('w-4 h-4 transition-transform', liked && 'fill-current scale-110')} />
          <span>{project.likes}</span>
        </button>

        <button
          onClick={() => setShowReviews(!showReviews)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{project.reviews.length} reviews</span>
        </button>

        {avgRating > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-muted-foreground">({avgRating.toFixed(1)})</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {project.githubUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
              Source
            </a>
          </Button>
        )}
        {project.liveUrl && (
          <Button variant="secondary" size="sm" asChild>
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Demo
            </a>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="ml-auto"
        >
          <MessageSquare className="w-4 h-4" />
          Review
        </Button>
      </div>

      {/* Reviews Section */}
      <AnimatePresence>
        {showReviews && project.reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border/50 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Reviews</h4>
              <button onClick={() => setShowReviews(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            {project.reviews.slice(0, 3).map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-background/50 border border-border/50 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{review.author}</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-xs text-muted-foreground">{review.comment}</p>
                <span className="text-xs text-muted-foreground/50 mt-1 block">{review.date}</span>
              </motion.div>
            ))}
            {project.reviews.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{project.reviews.length - 3} more reviews
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="mt-4 pt-4 border-t border-border/50 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Write a Review</h4>
              <button type="button" onClick={() => setShowReviewForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <Input
              placeholder="Your name (optional)"
              value={newReview.author}
              onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
              className="bg-background/50 text-sm"
            />
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rating:</span>
              <StarRating
                rating={newReview.rating}
                onRate={(r) => setNewReview({ ...newReview, rating: r })}
                interactive
              />
            </div>
            
            <Textarea
              placeholder="Share your thoughts..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="bg-background/50 text-sm min-h-[80px]"
            />
            
            <Button type="submit" size="sm" className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Corner decoration */}
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.article>
  );
};
