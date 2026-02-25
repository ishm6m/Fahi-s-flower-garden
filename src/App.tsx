import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Music, Lock, Unlock, X, Feather, Sprout, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDistanceToNow } from 'date-fns';

// --- Types ---
type FlowerType = 'rose' | 'tulip' | 'daisy' | 'sunflower' | 'lily';
type FlowerColor = 'pink' | 'red' | 'purple' | 'yellow' | 'white' | 'blue';

interface Flower {
  id: number;
  type: FlowerType;
  color: FlowerColor;
  x: number;
  y: number;
  message?: string;
  author: string;
  isLocked?: boolean;
  likes: number;
}

// --- Components ---

// Botanical Flower Icons - More illustrative/sketchy style
const FlowerIcon = ({ type, color, className }: { type: FlowerType, color: string, className?: string }) => {
  const getColorHex = (c: FlowerColor) => {
    switch (c) {
      case 'pink': return '#e5989b';
      case 'red': return '#d62828';
      case 'purple': return '#9d8189';
      case 'yellow': return '#fcbf49';
      case 'white': return '#fdfcdc';
      case 'blue': return '#a2d2ff';
      default: return '#e5989b';
    }
  };

  const fill = getColorHex(color as FlowerColor);
  const stroke = "#292524"; // Dark ink color for outlines

  // Shared stem style
  const Stem = () => (
    <path d="M12 22c0-6 2-10 2-14" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  );

  const Leaf = ({ side = 'left', y = 16 }: { side?: 'left'|'right', y?: number }) => (
    <path 
      d={side === 'left' ? `M12 ${y}c-4 0-6-4-6-4s4 2 6 4z` : `M14 ${y}c4 0 6-4 6-4s-4 2-6 4z`} 
      fill="#84a98c" 
      stroke={stroke} 
      strokeWidth="1" 
      opacity="0.8"
    />
  );

  if (type === 'rose') {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <Stem />
        <Leaf side="left" y={16} />
        <Leaf side="right" y={18} />
        <path d="M12 4c-3 0-5 2-5 5 0 3 3 5 5 8 2-3 5-5 5-8 0-3-2-5-5-5z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M12 4c0 0-2 2-2 4s2 4 2 4 2-2 2-4-2-4z" fill="rgba(255,255,255,0.3)" />
        <path d="M12 9c-1 0-2-1-2-2s1-2 2-2" stroke={stroke} strokeWidth="1" fill="none" />
      </svg>
    );
  }
  if (type === 'tulip') {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <Stem />
        <path d="M12 18c-4 0-6-6-6-6s2-6 6-6 6 6 6 6-2 6-6 6z" fill="#84a98c" opacity="0.5" />
        <path d="M8 5c0 5 4 9 4 9s4-4 4-9c0-3-2-4-4-4s-4 1-4 4z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M12 14v-4" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }
  if (type === 'daisy') {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <Stem />
        <Leaf side="right" y={17} />
        <g transform="translate(12, 8)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <ellipse key={i} cx="0" cy="-5" rx="1.5" ry="4" fill={fill} stroke={stroke} strokeWidth="0.5" transform={`rotate(${deg})`} />
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#fcbf49" stroke={stroke} strokeWidth="1" />
        </g>
      </svg>
    );
  }
  if (type === 'sunflower') {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <Stem />
        <Leaf side="left" y={15} />
        <Leaf side="right" y={19} />
        <g transform="translate(12, 8)">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
             <path key={i} d="M0 -3 L1 -7 L0 -8 L-1 -7 Z" fill={fill} stroke={stroke} strokeWidth="0.5" transform={`rotate(${deg})`} />
          ))}
          <circle cx="0" cy="0" r="3.5" fill="#5c4033" stroke={stroke} strokeWidth="1" />
          <circle cx="0" cy="0" r="3.5" fill="url(#dots)" fillOpacity="0.5" />
        </g>
      </svg>
    );
  }
  // Lily
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <Stem />
       <path d="M12 16c0-4-3-8-3-8s-2-2-2 0 3 8 5 8z" fill={fill} stroke={stroke} strokeWidth="1" />
       <path d="M12 16c0-4 3-8 3-8s2-2 2 0-3 8-5 8z" fill={fill} stroke={stroke} strokeWidth="1" />
       <path d="M12 16c0-5 0-9 0-9" stroke={stroke} strokeWidth="1" />
       <path d="M12 8l-1-2m1 2l1-2" stroke={stroke} strokeWidth="1" />
    </svg>
  );
};

// 2. Main App Component
export default function App() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  // Creator State
  const [newFlowerType, setNewFlowerType] = useState<FlowerType>('rose');
  const [newFlowerColor, setNewFlowerColor] = useState<FlowerColor>('pink');
  const [newMessage, setNewMessage] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gardenRef = useRef<HTMLDivElement>(null);

  // Fetch flowers
  const fetchFlowers = async () => {
    const headers: Record<string, string> = {};
    if (isAdmin) {
      headers['x-admin-secret'] = 'fariha123';
    }
    
    try {
      const res = await fetch('/api/flowers', { headers });
      const data = await res.json();
      setFlowers(data);
    } catch (err) {
      console.error("Failed to fetch flowers", err);
    }
  };

  useEffect(() => {
    fetchFlowers();
    const interval = setInterval(fetchFlowers, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Handle Garden Click (to plant)
  const handleGardenClick = (e: React.MouseEvent) => {
    if (selectedFlower) {
      setSelectedFlower(null);
      return;
    }
    
    if (!gardenRef.current) return;
    const rect = gardenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Ensure we don't plant too close to edges
    if (y > 90) return; 

    setClickPosition({ x, y });
    setShowCreator(true);
  };

  // Plant Flower
  const plantFlower = async () => {
    if (!clickPosition) return;
    
    try {
      await fetch('/api/flowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newFlowerType,
          color: newFlowerColor,
          x: clickPosition.x,
          y: clickPosition.y,
          message: newMessage,
          author: newAuthor || 'Anonymous'
        })
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e5989b', '#b5838d', '#ffb4a2']
      });
      
      setShowCreator(false);
      setNewMessage('');
      setNewAuthor('');
      fetchFlowers();
    } catch (err) {
      console.error("Failed to plant flower", err);
    }
  };

  // Login
  const handleLogin = async (password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setShowLogin(false);
        confetti({
          particleCount: 150,
          spread: 100,
          colors: ['#84a98c', '#e5989b']
        });
      } else {
        alert('Incorrect password, my love!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startDate = new Date('2023-01-01'); 
  const daysSince = formatDistanceToNow(startDate);

  return (
    <div className="min-h-screen overflow-hidden relative font-serif bg-stone-100 text-stone-800 selection:bg-rose-200">
      
      {/* Background Music */}
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=relaxing-light-background-116701.mp3" />

      {/* Header - Styled like a book title */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="border-b-2 border-stone-800 pb-2 inline-block">
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-stone-800">
              Fahi's Flower Garden
            </h1>
          </div>
          <p className="text-lg mt-2 font-hand text-stone-600 -rotate-2 ml-4">
            For Fariha, my love.
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (audioPlaying) audioRef.current.pause();
                else audioRef.current.play();
                setAudioPlaying(!audioPlaying);
              }
            }}
            className="w-12 h-12 rounded-full border-2 border-stone-800 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <Music size={20} className={audioPlaying ? 'animate-pulse text-rose-500' : 'text-stone-600'} />
          </button>
          
          <button 
            onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}
            className={`w-12 h-12 rounded-full border-2 border-stone-800 flex items-center justify-center hover:bg-stone-200 transition-colors ${isAdmin ? 'bg-rose-100' : ''}`}
          >
            {isAdmin ? <Unlock size={20} className="text-rose-600" /> : <Lock size={20} className="text-stone-600" />}
          </button>
        </div>
      </header>

      {/* Main Garden Area */}
      <div 
        ref={gardenRef}
        className="absolute inset-0 z-0 cursor-crosshair"
        onClick={handleGardenClick}
      >
        {/* Ground/Grass - Watercolor style */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-stone-200 to-transparent opacity-50 pointer-events-none" />
        
        {/* Decorative elements */}
        <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
           <Sprout size={120} strokeWidth={0.5} />
        </div>

        {/* Flowers */}
        <AnimatePresence>
          {flowers.map((flower) => (
            <motion.div
              key={`${flower.id}-${flower.x}-${flower.y}`}
              className="absolute cursor-grab active:cursor-grabbing group origin-bottom"
              style={{ left: `${flower.x}%`, top: `${flower.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              drag
              dragConstraints={gardenRef}
              dragMomentum={false}
              onDragEnd={(event, info) => {
                if (!gardenRef.current) return;
                const rect = gardenRef.current.getBoundingClientRect();
                const deltaXPercent = (info.offset.x / rect.width) * 100;
                const deltaYPercent = (info.offset.y / rect.height) * 100;
                
                const newX = Math.max(0, Math.min(100, flower.x + deltaXPercent));
                const newY = Math.max(0, Math.min(90, flower.y + deltaYPercent)); // Keep within bounds (90% max y)

                // Optimistic update
                setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, x: newX, y: newY } : f));

                // API update
                fetch(`/api/flowers/${flower.id}/position`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ x: newX, y: newY })
                });
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Only open if not dragged (simple check: if offset is small)
                // But Framer Motion handles click vs drag reasonably well.
                // Let's rely on standard click.
                setSelectedFlower(flower);
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <FlowerIcon 
                  type={flower.type} 
                  color={flower.color} 
                  className="w-16 h-16 md:w-24 md:h-24 drop-shadow-sm filter hover:brightness-110 transition-all" 
                />
                
                {/* Name Tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-stone-300 px-2 py-1 shadow-sm text-xs font-serif whitespace-nowrap z-20">
                  {flower.author}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="font-hand text-xl text-stone-500 bg-white/50 px-4 py-2 rounded-lg border border-stone-200 backdrop-blur-sm">
          Chapter 1: {daysSince} of us.
        </div>
      </div>

      {/* Empty State Hint */}
      {flowers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center opacity-40">
            <p className="font-hand text-3xl text-stone-400 rotate-2">Click anywhere to plant a memory...</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {/* Creator Modal - Letter Style */}
        {showCreator && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, rotate: -1 }} animate={{ scale: 1, y: 0, rotate: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#fdfbf7] p-8 shadow-2xl relative border border-stone-200"
              style={{ backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
              {/* Tape effect */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/80 rotate-1 shadow-sm border-l border-r border-white/50" />

              <button onClick={() => setShowCreator(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800">
                <X size={24} />
              </button>

              <h2 className="font-serif text-3xl font-bold text-stone-800 mb-6 border-b border-stone-300 pb-2">
                Plant a Seed
              </h2>

              <div className="space-y-6">
                {/* Selection Row */}
                <div className="flex gap-6 overflow-x-auto pb-2">
                  <div className="flex-1">
                    <label className="font-serif text-sm text-stone-500 mb-2 block">Species</label>
                    <div className="flex gap-2">
                      {(['rose', 'tulip', 'daisy', 'sunflower', 'lily'] as FlowerType[]).map(t => (
                        <button 
                          key={t}
                          onClick={() => setNewFlowerType(t)}
                          className={`p-2 rounded-lg border transition-all ${newFlowerType === t ? 'border-stone-800 bg-stone-100' : 'border-transparent hover:bg-stone-50'}`}
                        >
                          <FlowerIcon type={t} color={newFlowerColor} className="w-8 h-8" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                   <label className="font-serif text-sm text-stone-500 mb-2 block">Pigment</label>
                   <div className="flex gap-3">
                    {(['pink', 'red', 'purple', 'yellow', 'white', 'blue'] as FlowerColor[]).map(c => (
                      <button 
                        key={c}
                        onClick={() => setNewFlowerColor(c)}
                        className={`w-6 h-6 rounded-full border border-stone-300 shadow-sm transition-transform hover:scale-110 ${newFlowerColor === c ? 'ring-2 ring-stone-400 ring-offset-2' : ''}`}
                        style={{ backgroundColor: c === 'white' ? '#fdfcdc' : c === 'pink' ? '#e5989b' : c === 'red' ? '#d62828' : c === 'purple' ? '#9d8189' : c === 'yellow' ? '#fcbf49' : '#a2d2ff' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Message - Letter style */}
                <div className="relative">
                  <label className="font-serif text-sm text-stone-500 mb-2 block">Your Note</label>
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Dearest Fariha..."
                    className="w-full p-4 bg-white border border-stone-200 shadow-inner min-h-[120px] font-hand text-xl leading-relaxed focus:outline-none focus:border-stone-400 resize-none"
                  />
                  <Feather className="absolute bottom-4 right-4 text-stone-300" size={20} />
                </div>

                <div>
                  <label className="font-serif text-sm text-stone-500 mb-2 block">Signed By</label>
                  <input 
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full p-2 border-b border-stone-300 bg-transparent focus:outline-none focus:border-stone-800 font-serif"
                  />
                </div>

                <button 
                  onClick={plantFlower}
                  disabled={!newMessage}
                  className="w-full py-3 bg-stone-800 text-stone-100 font-serif text-lg tracking-wide hover:bg-stone-700 transition-colors shadow-lg mt-4 disabled:opacity-50"
                >
                  Plant in Garden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* View Message Modal - Envelope Style */}
        {selectedFlower && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedFlower(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, rotateX: 90 }} animate={{ scale: 1, rotateX: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-md bg-[#fffdf5] p-8 shadow-2xl relative border-8 border-double border-stone-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedFlower(null)}
                className="absolute top-2 right-2 p-2 hover:bg-stone-100 rounded-full"
              >
                <X size={20} className="text-stone-400" />
              </button>

              <div className="flex flex-col items-center mb-8">
                <FlowerIcon type={selectedFlower.type} color={selectedFlower.color} className="w-20 h-20 mb-4" />
                <div className="h-px w-1/2 bg-stone-300" />
              </div>

              {selectedFlower.isLocked ? (
                <div className="py-12 text-center">
                  <Lock className="w-12 h-12 mx-auto text-stone-300 mb-4" />
                  <p className="font-hand text-2xl text-stone-500">
                    This letter is sealed for Fariha.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="font-hand text-2xl md:text-3xl leading-relaxed text-stone-800">
                    {selectedFlower.message}
                  </p>
                  
                  <div className="pt-8 flex flex-col items-center">
                    <span className="font-serif text-xs uppercase tracking-widest text-stone-400 mb-1">Sincerely</span>
                    <span className="font-serif text-xl italic text-stone-700 border-b border-stone-300 pb-1">
                      {selectedFlower.author}
                    </span>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/api/flowers/${selectedFlower.id}/like`, { method: 'POST' });
                      setFlowers(prev => prev.map(f => f.id === selectedFlower.id ? { ...f, likes: (f.likes || 0) + 1 } : f));
                      setSelectedFlower(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
                    }}
                    className="mt-6 flex items-center justify-center gap-2 text-rose-500 hover:text-rose-700 transition-colors group"
                  >
                    <Heart size={18} className={`transition-transform group-hover:scale-110 ${selectedFlower.likes > 0 ? "fill-rose-500" : ""}`} />
                    <span className="font-serif text-sm">{selectedFlower.likes || 0}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Login Modal */}
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4"
          >
            <motion.div 
              className="w-full max-w-sm bg-white p-8 shadow-xl border border-stone-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold text-stone-800">The Key</h3>
                <button onClick={() => setShowLogin(false)}><X size={20} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('password') as HTMLInputElement;
                handleLogin(input.value);
              }}>
                <input 
                  name="password"
                  type="password" 
                  placeholder="Enter the secret word..." 
                  className="w-full p-3 border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none bg-transparent font-serif text-lg mb-6"
                  autoFocus
                />
                <button type="submit" className="w-full py-3 bg-stone-800 text-white font-serif tracking-widest hover:bg-stone-700 transition-colors">
                  UNLOCK
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
