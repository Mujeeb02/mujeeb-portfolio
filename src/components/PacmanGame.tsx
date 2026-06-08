import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Zap, Heart, Volume2, VolumeX } from 'lucide-react';
import { TerminalWindow } from '@/components/TerminalWindow';

// Game constants
const GRID_SIZE = 19;
const SPEED = 180;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_UP';

const INITIAL_PACMAN: Position = { x: 1, y: 1 };
const INITIAL_GHOSTS: Position[] = [
  { x: 17, y: 15 },
  { x: 17, y: 1 },
  { x: 1, y: 15 }
];

// Maze layout (1 = wall, 0 = dot, 2 = empty/eaten, 3 = power pellet)
const LEVEL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const GHOST_COLORS = ['text-red-500', 'text-cyan-400', 'text-pink-400'];
const GHOST_NAMES = ['BLINKY', 'INKY', 'PINKY'];

export const PacmanGame = () => {
  const [pacman, setPacman] = useState<Position>(INITIAL_PACMAN);
  const [ghosts, setGhosts] = useState<Position[]>(INITIAL_GHOSTS);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [map, setMap] = useState<number[][]>(LEVEL_MAP.map(row => [...row]));
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [powerMode, setPowerMode] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerModeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameSpeed = Math.max(80, SPEED - (level - 1) * 15);
  const ghostIntelligence = Math.min(0.85, 0.25 + (level - 1) * 0.1);

  // Track high score in memory for this session
  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const resetGame = useCallback((fullReset = true) => {
    setPacman(INITIAL_PACMAN);
    setGhosts(INITIAL_GHOSTS);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setMap(LEVEL_MAP.map(row => [...row]));
    setPowerMode(false);
    setCombo(0);

    if (fullReset) {
      setScore(0);
      setLevel(1);
      setLives(3);
      setGameState('RUNNING');
    } else {
      setLevel(l => l + 1);
      setGameState('RUNNING');
    }
  }, []);

  const respawnPacman = useCallback(() => {
    setPacman(INITIAL_PACMAN);
    setGhosts(INITIAL_GHOSTS);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setPowerMode(false);
    setGameState('RUNNING');
  }, []);

  // Check if direction is valid
  const canMove = useCallback((pos: Position, dir: Direction) => {
    let newX = pos.x;
    let newY = pos.y;

    if (dir === 'UP') newY -= 1;
    if (dir === 'DOWN') newY += 1;
    if (dir === 'LEFT') newX -= 1;
    if (dir === 'RIGHT') newX += 1;

    return (
      newY >= 0 && newY < map.length &&
      newX >= 0 && newX < map[0].length &&
      map[newY][newX] !== 1
    );
  }, [map]);

  const movePacman = useCallback(() => {
    setMouthOpen(prev => !prev);
    
    setPacman(prev => {
      // Try next direction first
      if (canMove(prev, nextDirection)) {
        setDirection(nextDirection);
        let newX = prev.x;
        let newY = prev.y;

        if (nextDirection === 'UP') newY -= 1;
        if (nextDirection === 'DOWN') newY += 1;
        if (nextDirection === 'LEFT') newX -= 1;
        if (nextDirection === 'RIGHT') newX += 1;

        return { x: newX, y: newY };
      }
      
      // Otherwise continue current direction
      if (canMove(prev, direction)) {
        let newX = prev.x;
        let newY = prev.y;

        if (direction === 'UP') newY -= 1;
        if (direction === 'DOWN') newY += 1;
        if (direction === 'LEFT') newX -= 1;
        if (direction === 'RIGHT') newX += 1;

        return { x: newX, y: newY };
      }
      
      return prev;
    });
  }, [direction, nextDirection, canMove]);

  const moveGhosts = useCallback(() => {
    setGhosts(prevGhosts => {
      return prevGhosts.map((ghost, idx) => {
        const possibleMoves = [
          { x: ghost.x, y: ghost.y - 1 },
          { x: ghost.x, y: ghost.y + 1 },
          { x: ghost.x - 1, y: ghost.y },
          { x: ghost.x + 1, y: ghost.y }
        ].filter(pos =>
          pos.y >= 0 && pos.y < map.length &&
          pos.x >= 0 && pos.x < map[0].length &&
          map[pos.y][pos.x] !== 1
        );

        if (possibleMoves.length === 0) return ghost;

        // In power mode, ghosts run away
        if (powerMode) {
          const fleeMove = possibleMoves.reduce((best, current) => {
            const currentDist = Math.abs(current.x - pacman.x) + Math.abs(current.y - pacman.y);
            const bestDist = Math.abs(best.x - pacman.x) + Math.abs(best.y - pacman.y);
            return currentDist > bestDist ? current : best;
          }, possibleMoves[0]);
          return fleeMove;
        }

        // Each ghost has different behavior
        const intelligence = ghostIntelligence + (idx * 0.05);
        
        if (Math.random() < intelligence) {
          const smartMove = possibleMoves.reduce((best, current) => {
            const currentDist = Math.abs(current.x - pacman.x) + Math.abs(current.y - pacman.y);
            const bestDist = Math.abs(best.x - pacman.x) + Math.abs(best.y - pacman.y);
            return currentDist < bestDist ? current : best;
          }, possibleMoves[0]);
          return smartMove;
        }

        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      });
    });
  }, [map, pacman, powerMode, ghostIntelligence]);

  // Handle collisions and eating
  useEffect(() => {
    if (gameState !== 'RUNNING') return;

    const cell = map[pacman.y]?.[pacman.x];
    
    // Eat regular dot
    if (cell === 0) {
      setScore(s => s + 10);
      setMap(prev => {
        const newMap = prev.map(row => [...row]);
        newMap[pacman.y][pacman.x] = 2;
        return newMap;
      });
    }
    
    // Eat power pellet
    if (cell === 3) {
      setScore(s => s + 50);
      setPowerMode(true);
      setCombo(0);
      setMap(prev => {
        const newMap = prev.map(row => [...row]);
        newMap[pacman.y][pacman.x] = 2;
        return newMap;
      });
      
      // Clear existing timeout
      if (powerModeRef.current) clearTimeout(powerModeRef.current);
      powerModeRef.current = setTimeout(() => {
        setPowerMode(false);
        setCombo(0);
      }, 8000);
    }

    // Ghost collision
    const ghostHit = ghosts.findIndex(g => g.x === pacman.x && g.y === pacman.y);
    if (ghostHit !== -1) {
      if (powerMode) {
        // Eat ghost
        const points = 200 * Math.pow(2, combo);
        setScore(s => s + points);
        setCombo(c => c + 1);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 500);
        
        setGhosts(prev => {
          const newGhosts = [...prev];
          newGhosts[ghostHit] = { x: 9, y: 8 };
          return newGhosts;
        });
      } else {
        // Lose life
        setLives(l => l - 1);
        if (lives <= 1) {
          setGameState('GAME_OVER');
        } else {
          setGameState('PAUSED');
          setTimeout(respawnPacman, 1000);
        }
      }
    }

    // Check level complete
    const dotsLeft = map.flat().filter(cell => cell === 0 || cell === 3).length;
    if (dotsLeft === 0) {
      setGameState('LEVEL_UP');
      setTimeout(() => resetGame(false), 1500);
    }
  }, [pacman, ghosts, map, gameState, powerMode, combo, lives, resetGame, respawnPacman]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'RUNNING') return;

    gameLoopRef.current = setInterval(() => {
      movePacman();
      moveGhosts();
    }, gameSpeed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, movePacman, moveGhosts, gameSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setNextDirection('RIGHT');
          break;
        case ' ':
          if (gameState === 'GAME_OVER') resetGame(true);
          else if (gameState === 'IDLE') setGameState('RUNNING');
          else if (gameState === 'RUNNING') setGameState('PAUSED');
          else if (gameState === 'PAUSED') setGameState('RUNNING');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, resetGame]);

  // Get pacman character based on direction
  const getPacmanChar = () => {
    if (!mouthOpen) return '●';
    switch (direction) {
      case 'RIGHT': return 'ᗧ';
      case 'LEFT': return 'ᗤ';
      case 'UP': return 'ᗢ';
      case 'DOWN': return 'ᗣ';
      default: return 'ᗧ';
    }
  };

  // Render cell
  const renderCell = (cell: number, x: number, y: number) => {
    const isPacman = pacman.x === x && pacman.y === y;
    const ghostIndex = ghosts.findIndex(g => g.x === x && g.y === y);

    if (isPacman) {
      return (
        <motion.span 
          className="text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
          animate={{ scale: mouthOpen ? 1 : 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {getPacmanChar()}
        </motion.span>
      );
    }

    if (ghostIndex !== -1) {
      return (
        <motion.span 
          className={`font-bold ${powerMode ? 'text-blue-400 animate-pulse' : GHOST_COLORS[ghostIndex]} drop-shadow-[0_0_6px_currentColor]`}
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {powerMode ? 'ᗣ' : 'ᗩ'}
        </motion.span>
      );
    }

    if (cell === 1) return <span className="text-primary/50">█</span>;
    if (cell === 3) return (
      <motion.span 
        className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        ◉
      </motion.span>
    );
    if (cell === 0) return <span className="text-primary/40">•</span>;
    return <span className="opacity-0">·</span>;
  };

  const getStatusColor = () => {
    switch (gameState) {
      case 'RUNNING': return powerMode ? 'text-blue-400' : 'text-primary';
      case 'PAUSED': return 'text-yellow-400';
      case 'GAME_OVER': return 'text-destructive';
      case 'LEVEL_UP': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (gameState) {
      case 'RUNNING': return powerMode ? 'POWER_MODE' : 'RUNNING';
      case 'PAUSED': return 'PAUSED';
      case 'GAME_OVER': return 'GAME_OVER';
      case 'LEVEL_UP': return 'LEVEL_UP!';
      default: return 'IDLE';
    }
  };

  return (
    <TerminalWindow 
      title={`pacman.exe [SCORE: ${score.toString().padStart(5, '0')} | HI: ${highScore.toString().padStart(5, '0')} | LVL: ${level}]`} 
      showControls
    >
      <div className="relative font-mono select-none">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-3 text-xs border-b border-primary/30 pb-2">
          <div className="flex items-center gap-4">
            <span className="text-primary">
              <span className="text-muted-foreground">$</span> ./run_game
            </span>
            <div className="flex items-center gap-1">
              {[...Array(lives)].map((_, i) => (
                <Heart key={i} className="w-3 h-3 text-red-500 fill-red-500" />
              ))}
              {[...Array(3 - lives)].map((_, i) => (
                <Heart key={i} className="w-3 h-3 text-muted-foreground/30" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </button>
            <span className={`${getStatusColor()} font-bold`}>
              [{getStatusText()}]
            </span>
          </div>
        </div>

        {/* Power Mode Indicator */}
        <AnimatePresence>
          {powerMode && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex items-center justify-center gap-2 text-xs text-blue-400 bg-blue-400/10 py-1 rounded border border-blue-400/30"
            >
              <Zap className="w-3 h-3 animate-pulse" />
              <span className="animate-pulse font-bold">POWER MODE ACTIVE - EAT THE GHOSTS!</span>
              <Zap className="w-3 h-3 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combo Display */}
        <AnimatePresence>
          {showCombo && combo > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-2xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            >
              +{200 * Math.pow(2, combo - 1)}!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Grid */}
        <div className="relative bg-background/80 border border-primary/40 p-3 rounded overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)]" />
          
          {/* CRT glow effect */}
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_60px_rgba(0,255,0,0.1)]" />

          <div
            className="grid gap-0 relative z-0"
            style={{
              gridTemplateColumns: `repeat(${map[0].length}, 1fr)`,
            }}
          >
            {map.map((row, y) => (
              row.map((cell, x) => (
                <div 
                  key={`${x}-${y}`} 
                  className="flex items-center justify-center text-[11px] sm:text-sm leading-none h-[14px] sm:h-[18px]"
                >
                  {renderCell(cell, x, y)}
                </div>
              ))
            ))}
          </div>

          {/* Start Overlay */}
          <AnimatePresence>
            {gameState === 'IDLE' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/90 z-20 backdrop-blur-sm"
              >
                <motion.div 
                  className="text-center space-y-4"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <motion.p 
                    className="text-primary text-lg font-bold tracking-wider"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {'>'} PRESS SPACE TO START
                  </motion.p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Use <span className="text-secondary font-bold">ARROW KEYS</span> or <span className="text-secondary font-bold">WASD</span> to move</p>
                    <p>Eat <span className="text-primary">●</span> dots and avoid <span className="text-red-500">ᗩ</span> ghosts</p>
                    <p>Grab <span className="text-primary">◉</span> power pellets to eat ghosts!</p>
                  </div>
                  <div className="flex justify-center gap-4 pt-2 text-[10px] text-muted-foreground/60">
                    <span>HIGH SCORE: {highScore}</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paused Overlay */}
          <AnimatePresence>
            {gameState === 'PAUSED' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/80 z-20"
              >
                <motion.p 
                  className="text-yellow-400 text-lg font-bold"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  ▐▐ PAUSED
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Up Overlay */}
          <AnimatePresence>
            {gameState === 'LEVEL_UP' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-primary/20 z-20 backdrop-blur-sm"
              >
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-primary text-2xl font-bold">LEVEL {level} COMPLETE!</p>
                  <p className="text-sm text-muted-foreground mt-2">Get ready for level {level + 1}...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState === 'GAME_OVER' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-destructive/20 z-20 backdrop-blur-sm"
              >
                <motion.div 
                  className="text-center space-y-3"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <Skull className="w-12 h-12 mx-auto text-destructive animate-pulse" />
                  <p className="text-destructive font-bold text-xl">GAME OVER</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Final Score: <span className="text-primary font-bold">{score}</span></p>
                    <p>Level Reached: <span className="text-secondary">{level}</span></p>
                    {score >= highScore && score > 0 && (
                      <p className="text-yellow-400 font-bold animate-pulse">🏆 NEW HIGH SCORE!</p>
                    )}
                  </div>
                  <motion.button
                    onClick={() => resetGame(true)}
                    className="mt-2 px-4 py-1 text-xs border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    [SPACE] RESTART
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ghost Legend */}
        <div className="mt-3 flex justify-center gap-4 text-[10px]">
          {GHOST_NAMES.map((name, i) => (
            <span key={name} className={GHOST_COLORS[i]}>
              ᗩ {name}
            </span>
          ))}
        </div>

        {/* Controls Footer */}
        <div className="mt-2 text-[10px] text-muted-foreground flex justify-between items-center border-t border-primary/20 pt-2">
          <span><span className="text-secondary">[SPACE]</span> pause/resume</span>
          <span><span className="text-secondary">[WASD/↑↓←→]</span> move</span>
        </div>
      </div>
    </TerminalWindow>
  );
};