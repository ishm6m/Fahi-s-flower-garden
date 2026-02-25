import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Sun, Moon, X, Feather, Sprout } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from './supabaseClient';

// --- Types aligned with Supabase schema ---
type PetalStyle = 'rose' | 'tulip' | 'daisy' | 'sunflower' | 'lily';
type FlowerColor = 'pink' | 'red' | 'purple' | 'yellow' | 'white' | 'blue';
type ThemeMode = 'day' | 'night';

interface Flower {
  id: string;
  x: number;
  y: number;
  color: FlowerColor;
  petal_style: PetalStyle;
  message: string;
  created_at: string;
}

// Floating petals & fireflies used for dreamy ambience
const FloatingAtmosphere = () => {
  // Slightly reduced counts to keep mobile performance smooth
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 10 + Math.random() * 12,
    delay: Math.random() * 6
  }));

  const fireflies = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 80,
    delay: Math.random() * 8
  }));

  return (
    <>
      {petals.map(p => (
        <span
          key={`petal-${p.id}`}
          className="pointer-events-none fixed inset-0 block text-2xl opacity-70"
          style={{
            left: `${p.left}%`,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`
          }}
        >
          ❀
        </span>
      ))}

      {fireflies.map(f => (
        <span
          key={`firefly-${f.id}`}
          className="pointer-events-none fixed w-2 h-2 rounded-full bg-rose-300 mix-blend-screen shadow-[0_0_12px_6px_rgba(255,182,193,0.6)]"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            animation: `firefly 6s ease-in-out ${f.delay}s infinite`
          }}
        />
      ))}
    </>
  );
};

// Botanical Flower Icons
const FlowerIcon = ({ type, color, className }: { type: PetalStyle, color: string, className?: string }) => {
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
  const stroke = "#292524";

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
        </g>
      </svg>
    );
  }
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

export default function App() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('day');
  const [newPetalStyle, setNewPetalStyle] = useState<PetalStyle>('rose');
  const [newFlowerColor, setNewFlowerColor] = useState<FlowerColor>('pink');
  const [newMessage, setNewMessage] = useState('');
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gardenRef = useRef<HTMLDivElement>(null);

  const fetchFlowers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch flowers', error.message);
    }
    if (data) {
      setFlowers(data as Flower[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlowers();

    const channel = supabase
      .channel('public:flowers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flowers' }, (payload) => {
        const fresh = payload.new as Flower;
        setFlowers(prev => prev.some(f => f.id === fresh.id) ? prev : [...prev, fresh]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const computeRelativePosition = (clientX: number, clientY: number) => {
    if (!gardenRef.current) return null;
    const rect = gardenRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    if (y > 90 || x < 0 || x > 100 || y < 0) return null;
    return { x, y };
  };

  const handleGardenMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (selectedFlower) {
      setSelectedFlower(null);
    }
    const pos = computeRelativePosition(e.clientX, e.clientY);
    if (!pos) return;
    setClickPosition(pos);
    setIsDraggingNew(true);
  };

  const handleGardenMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingNew) return;
    const pos = computeRelativePosition(e.clientX, e.clientY);
    if (!pos) return;
    setClickPosition(pos);
  };

  const handleGardenMouseUp = () => {
    if (isDraggingNew && clickPosition) {
      setShowCreator(true);
    }
    setIsDraggingNew(false);
  };

  const handleGardenTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (selectedFlower) {
      setSelectedFlower(null);
    }
    const touch = e.touches[0];
    const pos = computeRelativePosition(touch.clientX, touch.clientY);
    if (!pos) return;
    setClickPosition(pos);
    setIsDraggingNew(true);
  };

  const handleGardenTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingNew) return;
    const touch = e.touches[0];
    const pos = computeRelativePosition(touch.clientX, touch.clientY);
    if (!pos) return;
    setClickPosition(pos);
  };

  const handleGardenTouchEnd = () => {
    if (isDraggingNew && clickPosition) {
      setShowCreator(true);
    }
    setIsDraggingNew(false);
  };

  const plantFlower = async () => {
    if (!clickPosition) return;

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return;

    const payload = {
      petal_style: newPetalStyle,
      color: newFlowerColor,
      x: clickPosition.x,
      y: clickPosition.y,
      message: trimmedMessage
    };

    const { data, error } = await supabase.from('flowers').insert(payload).select().single();

    if (error) {
      console.error('Failed to plant flower', error.message);
      return;
    }

    if (data) {
      setFlowers(prev => prev.some(f => f.id === data.id) ? prev : [...prev, data as Flower]);
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f9a8d4', '#bf9fe0', '#fde68a']
    });

    setShowCreator(false);
    setNewMessage('');
    setClickPosition(null);
  };

  const startDate = new Date('2023-01-01');
  const daysSince = formatDistanceToNow(startDate);

  return (
    <div className={`min-h-screen overflow-hidden relative font-serif selection:bg-rose-200 ${theme === 'night'
      ? 'bg-gradient-to-b from-[#1b1028] via-[#251736] to-[#361a4f] text-rose-50'
      : 'bg-gradient-to-b from-[#fde5f2] via-[#fff7fb] to-[#ffe4e6] text-rose-900'
    }`}>

      <FloatingAtmosphere />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=relaxing-light-background-116701.mp3" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="border-b-2 border-stone-800 pb-2 inline-block">
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-rose-700">
              Eternal Love Garden
            </h1>
          </div>
          <p className="text-lg mt-2 font-hand text-rose-500 -rotate-2 ml-4">
            Every flower is a secret love note.
          </p>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <button
            onClick={() => setTheme(prev => prev === 'day' ? 'night' : 'day')}
            className={`w-12 h-12 rounded-full border-2 border-stone-800 flex items-center justify-center hover:bg-rose-100/70 transition-colors ${theme === 'night' ? 'bg-amber-100/60' : 'bg-white/70'}`}
            title="Day / Night"
          >
            {theme === 'night' ? <Moon size={20} className="text-amber-700" /> : <Sun size={20} className="text-amber-500" />}
          </button>

          <button 
            onClick={() => {
              if (audioRef.current) {
                if (audioPlaying) audioRef.current.pause();
                else audioRef.current.play();
                setAudioPlaying(!audioPlaying);
              }
            }}
            className="w-12 h-12 rounded-full border-2 border-stone-800 flex items-center justify-center hover:bg-rose-100/70 transition-colors bg-white/70"
          >
            <Music size={20} className={audioPlaying ? 'animate-pulse text-rose-500' : 'text-stone-600'} />
          </button>
        </div>
      </header>

      {/* Main Garden */}
      <div 
        ref={gardenRef}
        className="absolute inset-0 z-0 cursor-crosshair"
        onMouseDown={handleGardenMouseDown}
        onMouseMove={handleGardenMouseMove}
        onMouseUp={handleGardenMouseUp}
        onTouchStart={handleGardenTouchStart}
        onTouchMove={handleGardenTouchMove}
        onTouchEnd={handleGardenTouchEnd}
      >
        <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${theme === 'night' ? 'from-indigo-900/80 via-transparent to-transparent' : 'from-stone-200 to-transparent'} opacity-60 pointer-events-none`} />
        {theme === 'night' && (
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,247,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(186,134,252,0.18),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(255,255,224,0.15),transparent_30%)]" />
        )}
        <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
           <Sprout size={120} strokeWidth={0.5} />
        </div>

        {/* Existing planted flowers */}
        <AnimatePresence>
          {flowers.map((flower) => (
            <motion.div
              key={flower.id}
              className="absolute cursor-pointer group origin-bottom"
              style={{ left: `${flower.x}%`, top: `${flower.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFlower(flower);
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <FlowerIcon 
                  type={flower.petal_style} 
                  color={flower.color} 
                  className={`w-16 h-16 md:w-24 md:h-24 drop-shadow-sm filter hover:brightness-110 transition-all swaying-flower ${theme === 'night' ? 'drop-shadow-[0_0_14px_rgba(250,200,255,0.45)]' : ''}`} 
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Preview of the flower being planted while dragging */}
        {clickPosition && isDraggingNew && (
          <div
            className="absolute pointer-events-none origin-bottom"
            style={{ left: `${clickPosition.x}%`, top: `${clickPosition.y}%` }}
          >
            <div className="relative -translate-x-1/2 -translate-y-full opacity-80">
              <FlowerIcon
                type={newPetalStyle}
                color={newFlowerColor}
                className={`w-14 h-14 md:w-20 md:h-20 drop-shadow-sm swaying-flower ${theme === 'night' ? 'drop-shadow-[0_0_16px_rgba(250,200,255,0.5)]' : ''}`}
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-serif text-rose-500 bg-white/70 px-2 py-0.5 rounded-full border border-rose-200 shadow-xs">
                Drag to choose a spot
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="font-hand text-xl text-rose-500 bg-white/60 px-4 py-2 rounded-lg border border-rose-200 backdrop-blur-sm">
          Our shared love story, blooming for {daysSince}.
        </div>
      </div>

      {flowers.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center opacity-40">
            <p className="font-hand text-3xl text-rose-400 rotate-2">Touch and drag across the garden to plant your first love note...</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {/* Creator Modal */}
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
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/80 rotate-1 shadow-sm border-l border-r border-white/50" />

              <button onClick={() => setShowCreator(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800">
                <X size={24} />
              </button>

              <h2 className="font-serif text-3xl font-bold text-stone-800 mb-6 border-b border-stone-300 pb-2">
                Plant a Love Flower
              </h2>

              <div className="space-y-6">
                <div className="flex gap-6 overflow-x-auto pb-2">
                  <div className="flex-1">
                    <label className="font-serif text-sm text-stone-500 mb-2 block">Petal style</label>
                    <div className="flex gap-2">
                      {(['rose', 'tulip', 'daisy', 'sunflower', 'lily'] as PetalStyle[]).map(t => (
                        <button 
                          key={t}
                          onClick={() => setNewPetalStyle(t)}
                          className={`p-2 rounded-lg border transition-all ${newPetalStyle === t ? 'border-stone-800 bg-rose-50' : 'border-transparent hover:bg-stone-50'}`}
                        >
                          <FlowerIcon type={t} color={newFlowerColor} className="w-8 h-8" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-serif text-sm text-stone-500 mb-2 block">Color</label>
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

                <div className="relative">
                  <label className="font-serif text-sm text-stone-500 mb-2 block">Your anonymous love note</label>
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Dearest love, I want you to know..."
                    className="w-full p-4 bg-white border border-stone-200 shadow-inner min-h-[120px] font-hand text-xl leading-relaxed focus:outline-none focus:border-stone-400 resize-none"
                  />
                  <Feather className="absolute bottom-4 right-4 text-stone-300" size={20} />
                </div>

                <button 
                  onClick={plantFlower}
                  disabled={!newMessage}
                  className="w-full py-3 bg-rose-500 text-rose-50 font-serif text-lg tracking-wide hover:bg-rose-400 transition-colors shadow-lg mt-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Plant in the garden forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* View Message Modal */}
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
                <FlowerIcon type={selectedFlower.petal_style} color={selectedFlower.color} className="w-20 h-20 mb-4 swaying-flower" />
                <div className="h-px w-1/2 bg-stone-300" />
              </div>

              <div className="space-y-6 text-center">
                <p className="font-hand text-2xl md:text-3xl leading-relaxed text-stone-800">
                  {selectedFlower.message}
                </p>
                <div className="pt-4 flex flex-col items-center">
                  <span className="font-serif text-xs uppercase tracking-widest text-stone-400 mb-1">A secret admirer</span>
                  <span className="text-[11px] text-stone-400 mt-2">
                    Planted {format(new Date(selectedFlower.created_at), 'PPP p')}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
