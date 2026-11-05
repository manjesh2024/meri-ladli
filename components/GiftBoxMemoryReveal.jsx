import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

/**
 * ============================================================================
 * GIFT BOX OPENING & MEMORY REVEAL COMPONENT (React + Framer Motion)
 * ============================================================================
 * 
 * Flow & States:
 *   - 'idle'      : 3D styled closed gift box floating with ambient glow.
 *   - 'opening'   : Ribbon flies away, lid tilts back 65deg.
 *   - 'bursting'  : Images explosion outward along radial physics trajectories.
 *   - 'gathering': Images converge inwards to assemble a 3D depth-stacked deck.
 *   - 'deck'     : Swipeable interactive Tinder/Polaroid stack with pointer physics.
 *   - 'lightbox' : Full-screen detail view with blur backdrop, badges & stories.
 */

export const DEFAULT_MEMORIES = [
  {
    id: 'm1',
    src: 'assets/products/gift-box-hamper.jpg',
    category: 'Grand Hamper',
    title: 'Hand-Wrapped Diwali Hamper',
    date: 'Wrapped with Devotion',
    story: 'Golden paisley wrapping, royal maroon velvet trims, and a satin rosette carrying all my blessings for my dearest Ladli.'
  },
  {
    id: 'm2',
    src: 'assets/products/jewelry-wish-pearl-box.jpg',
    category: 'Fine Keepsake',
    title: 'Royal Wish Pearl Keepsake Set',
    date: 'Diwali Special',
    story: 'An authentic oyster with a genuine cultured pearl inside, waiting to be revealed and worn inside a delicate flower cage pendant.'
  },
  {
    id: 'm3',
    src: 'assets/products/jewelry-wish-pearl-diy.jpg',
    category: 'DIY Experience',
    title: 'Wish Pearl DIY Keepsake',
    date: 'A Heartfelt Ritual',
    story: 'From oyster to elegant necklace in three simple steps. An intimate keepsake to celebrate every wish made from the heart.'
  },
  {
    id: 'm4',
    src: 'assets/products/jewelry-gemstone-bracelet.jpg',
    category: 'Royal Jewelry',
    title: 'Royal Gemstone Vine Bracelet',
    date: 'Pure Sparkle',
    story: 'Vibrant gemstone cabochons set on an 18K gold branch vine. Designed to sparkle beside your glowing smile.'
  },
  {
    id: 'm5',
    src: 'assets/products/chocolate-crispello.jpg',
    category: 'Crunchy Treat',
    title: 'Cadbury Dairy Milk Crispello',
    date: 'Little Surprises',
    story: 'Crispy wheat balls bathed in melt-in-mouth Dairy Milk chocolate, crafted for shared laughter.'
  },
  {
    id: 'm6',
    src: 'assets/products/chocolate-galaxy.jpg',
    category: 'Silky Sweet',
    title: 'Galaxy Smooth Milk Chocolate',
    date: 'Sweet Moments',
    story: 'Velvety smooth milk chocolate that melts gently on your tongue, bringing instant warmth and comfort.'
  },
  {
    id: 'm7',
    src: 'assets/products/chocolate-kitkat.jpg',
    category: 'Crisp Joy',
    title: 'Nestle KitKat Diwali Edition',
    date: 'Shared Breaks',
    story: 'Crispy wafer fingers layered with creamy chocolate for all the joyful, unscripted breaks we share together.'
  },
  {
    id: 'm8',
    src: 'assets/products/chocolate-bournville.jpg',
    category: 'Gourmet Dark',
    title: 'Cadbury Bournville 50% Dark',
    date: 'Deep & Rich',
    story: 'Rich Ghana cocoa offering a luxurious, intense flavor as deep and unforgettable as our fondest memories.'
  }
];

export default function GiftBoxMemoryReveal({ memories = DEFAULT_MEMORIES, onComplete }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'opening' | 'bursting' | 'gathering' | 'deck'
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMemory, setSelectedMemory] = useState(null);

  // Trigger Box Opening Flow
  const handleOpenBox = () => {
    if (phase !== 'idle') return;
    setPhase('opening');

    // Phase 1: Burst outward after lid lifts (450ms)
    setTimeout(() => {
      setPhase('bursting');
    }, 450);

    // Phase 2: Converge inward into stacked deck (1800ms)
    setTimeout(() => {
      setPhase('gathering');
    }, 1800);

    // Phase 3: Interactive Deck ready (2600ms)
    setTimeout(() => {
      setPhase('deck');
    }, 2600);
  };

  // Swipe dismiss handler
  const handleSwipeDismiss = (direction) => {
    if (activeIndex >= memories.length - 1) {
      setActiveIndex(memories.length); // Deck completed
      if (onComplete) onComplete();
    } else {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handleRewind = () => {
    if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
  };

  const handleReset = () => {
    setPhase('idle');
    setActiveIndex(0);
    setSelectedMemory(null);
  };

  return (
    <div style={styles.container}>
      {/* Ambient background particles */}
      <div style={styles.ambientGlow} />

      {/* Header Info */}
      <header style={styles.header}>
        <h2 style={styles.title}>
          {phase === 'idle' && 'A Special Gift for You'}
          {phase === 'opening' && 'Unwrapping Treasures…'}
          {phase === 'bursting' && 'Spreading Joy & Magic ✨'}
          {(phase === 'gathering' || phase === 'deck') &&
            (activeIndex < memories.length
              ? `Memory ${activeIndex + 1} of ${memories.length}`
              : 'All Memories Unwrapped ✨')}
        </h2>
        <p style={styles.subtitle}>
          {phase === 'idle' && 'Tap the gift box to unwrap your memories'}
          {phase === 'opening' && 'Hold on, love is bursting out!'}
          {phase === 'bursting' && 'Look at the sparkles!'}
          {(phase === 'gathering' || phase === 'deck') &&
            (activeIndex < memories.length
              ? memories[activeIndex]?.title
              : 'Tap rewind ↺ to browse again')}
        </p>
      </header>

      {/* Stage: Box & Cards Layer */}
      <div style={styles.stage}>
        {/* Phase 0 & 1: 3D Gift Box */}
        <AnimatePresence>
          {phase !== 'deck' && phase !== 'gathering' && (
            <motion.div
              style={styles.giftBoxWrapper}
              onClick={handleOpenBox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: phase === 'idle' ? [0, -10, 0] : 0,
                rotate: phase === 'idle' ? [-0.5, 0.5, -0.5] : 0
              }}
              exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.6 } }}
              transition={{
                y: { repeat: Infinity, duration: 3.8, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 3.8, ease: 'easeInOut' }
              }}
            >
              {/* Pedestal Glow */}
              <div style={styles.pedestalGlow} />

              {/* Real Gift Hamper Image Card */}
              <motion.div
                style={styles.realHamperCard}
                animate={
                  phase === 'opening' || phase === 'bursting'
                    ? { scale: 1.15, y: -25, opacity: 0, filter: 'brightness(1.5) blur(4px)' }
                    : { scale: 1, y: 0, opacity: 1, filter: 'brightness(1) blur(0px)' }
                }
                transition={{ duration: 1.8, ease: [0.16, 0.9, 0.28, 1] }}
              >
                <img
                  src="assets/products/gift-box-hamper.jpg"
                  alt="Diwali Gift Hamper"
                  style={styles.realHamperImg}
                />
                <div style={styles.realHamperShimmer} />
              </motion.div>

              {/* Tap prompt */}
              {phase === 'idle' && (
                <motion.button
                  style={styles.tapPrompt}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Tap Box to Open ✨
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1, 2, 3: Memory Cards */}
        <div style={styles.cardsContainer}>
          {memories.map((item, index) => {
            const isVisibleInBurst = phase === 'bursting';
            const isVisibleInStack = phase === 'gathering' || phase === 'deck';
            if (!isVisibleInBurst && !isVisibleInStack) return null;

            return (
              <MemoryCardItem
                key={item.id || index}
                item={item}
                index={index}
                activeIndex={activeIndex}
                phase={phase}
                total={memories.length}
                onSwipe={handleSwipeDismiss}
                onInspect={() => setSelectedMemory(item)}
              />
            );
          })}
        </div>
      </div>

      {/* Phase 3: Bottom Navigation Controls */}
      {phase === 'deck' && (
        <motion.nav
          style={styles.deckControls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button style={styles.controlBtn} onClick={handleRewind} title="Previous Memory">
            ↺
          </button>
          <button
            style={{ ...styles.controlBtn, ...styles.primaryBtn }}
            onClick={() => handleSwipeDismiss('left')}
          >
            {activeIndex >= memories.length ? 'Replay All ↺' : 'Next Memory →'}
          </button>
          <button style={styles.controlBtn} onClick={handleReset} title="Repack Gift Box">
            🎁
          </button>
        </motion.nav>
      )}

      {/* Phase 4: Full-Screen Modal Lightbox */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            style={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              style={styles.lightboxDialog}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={styles.lightboxClose}
                onClick={() => setSelectedMemory(null)}
              >
                ×
              </button>
              <div style={styles.lightboxImgContainer}>
                <img
                  src={selectedMemory.src}
                  alt={selectedMemory.title}
                  style={styles.lightboxImg}
                />
              </div>
              <div style={styles.lightboxMeta}>
                <span style={styles.pill}>{selectedMemory.category}</span>
                <h3 style={styles.lightboxTitle}>{selectedMemory.title}</h3>
                <p style={styles.lightboxDate}>{selectedMemory.date}</p>
                <p style={styles.lightboxStory}>"{selectedMemory.story}"</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Memory Card with Pointer & Drag Physics
 */
function MemoryCardItem({
  item,
  index,
  activeIndex,
  phase,
  total,
  onSwipe,
  onInspect
}) {
  const relativeIndex = index - activeIndex;
  const isTopCard = relativeIndex === 0;

  // Motion values for smooth drag physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-22, 0, 22]);
  const opacityDrag = useTransform(x, [-250, -100, 0, 100, 250], [0, 0.8, 1, 0.8, 0]);

  // Burst coordinates calculation
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const distance = 160 + (index % 3) * 55;
  const burstX = Math.cos(angle) * distance;
  const burstY = Math.sin(angle) * (distance * 0.75) - 30;
  const burstRot = ((index % 2 === 0 ? 1 : -1) * (15 + (index % 4) * 8));

  // Stack calculation
  const stackScale = 1 - Math.max(0, relativeIndex) * 0.05;
  const stackTranslateY = Math.max(0, relativeIndex) * 13;
  const stackTranslateZ = -Math.max(0, relativeIndex) * 35;
  const stackRotate = (relativeIndex % 2 === 0 ? 1 : -1) * relativeIndex * 1.8;
  const stackZIndex = 50 - relativeIndex;

  if (relativeIndex < 0 && phase === 'deck') {
    return null; // Already dismissed
  }

  // Handle Drag End with Threshold and Velocity
  const handleDragEnd = (_, info) => {
    const swipeThreshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{
        ...styles.card,
        zIndex: stackZIndex,
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : stackRotate,
        opacity: isTopCard ? opacityDrag : relativeIndex > 3 ? 0 : 1 - relativeIndex * 0.15
      }}
      initial={{
        scale: 0.2,
        opacity: 0,
        x: 0,
        y: 0
      }}
      animate={
        phase === 'bursting'
          ? {
              x: burstX,
              y: burstY,
              scale: 0.85,
              rotate: burstRot,
              opacity: 1,
              transition: { duration: 0.95, ease: [0.18, 0.89, 0.32, 1.28] }
            }
          : {
              x: 0,
              y: stackTranslateY,
              scale: stackScale,
              rotate: stackRotate,
              transition: {
                delay: phase === 'gathering' ? index * 0.06 : 0,
                duration: 0.65,
                ease: [0.2, 0.8, 0.25, 1]
              }
            }
      }
      drag={isTopCard && phase === 'deck' ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (isTopCard && Math.abs(x.get()) < 6) onInspect();
      }}
      whileTap={isTopCard ? { scale: 1.02 } : {}}
    >
      <div style={styles.cardMedia}>
        <span style={styles.pill}>{item.category}</span>
        <img src={item.src} alt={item.title} style={styles.cardImg} draggable="false" />
      </div>
      <div style={styles.cardMeta}>
        <h3 style={styles.cardTitle}>{item.title}</h3>
        <p style={styles.cardDate}>{item.date}</p>
        <span style={styles.hint}>Tap to view story 🔍</span>
      </div>
    </motion.div>
  );
}

// Inline Styles for modular standalone embedding
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 20%, #3e121e 0%, #200810 50%, #120308 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    color: '#fff4e6',
    userSelect: 'none'
  },
  ambientGlow: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 50%, rgba(240, 201, 120, 0.08) 0%, transparent 60%)',
    pointerEvents: 'none'
  },
  header: {
    position: 'absolute',
    top: 36,
    textAlign: 'center',
    zIndex: 20
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 'clamp(22px, 4vw, 32px)',
    fontWeight: 700,
    color: '#fff2db',
    marginBottom: 6,
    textShadow: '0 2px 10px rgba(0,0,0,0.6)'
  },
  subtitle: {
    fontSize: 13,
    color: '#e2ba7c',
    letterSpacing: '0.05em'
  },
  stage: {
    position: 'relative',
    width: '100%',
    maxWidth: 580,
    height: 520,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: 1200
  },
  giftBoxWrapper: {
    position: 'relative',
    width: 220,
    height: 200,
    cursor: 'pointer',
    transformStyle: 'preserve-3d',
    zIndex: 20
  },
  pedestalGlow: {
    position: 'absolute',
    bottom: -25,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 280,
    height: 65,
    background: 'radial-gradient(ellipse at center, rgba(240, 201, 120, 0.45) 0%, rgba(217, 4, 41, 0.15) 45%, transparent 70%)',
    filter: 'blur(12px)',
    pointerEvents: 'none'
  },
  realHamperCard: {
    position: 'relative',
    width: 280,
    height: 210,
    borderRadius: 20,
    overflow: 'hidden',
    border: '2px solid rgba(240, 201, 120, 0.85)',
    boxShadow: '0 24px 55px rgba(0, 0, 0, 0.7), 0 0 35px rgba(240, 201, 120, 0.45), inset 0 1px 3px rgba(255, 240, 200, 0.6)',
    background: '#2b050f'
  },
  realHamperImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none'
  },
  realHamperShimmer: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(105deg, transparent 20%, rgba(255, 235, 180, 0.3) 45%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 235, 180, 0.3) 55%, transparent 75%)',
    pointerEvents: 'none',
    mixBlendMode: 'overlay'
  },
  tapPrompt: {
    position: 'absolute',
    bottom: -48,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #f7dfb0, #c99336)',
    color: '#2e050f',
    padding: '8px 20px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
    boxShadow: '0 4px 20px rgba(240, 201, 120, 0.45)',
    whiteSpace: 'nowrap',
    border: 'none',
    cursor: 'pointer'
  },
  cardsContainer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  card: {
    position: 'absolute',
    width: 270,
    height: 380,
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1.5px solid rgba(240, 201, 120, 0.35)',
    borderRadius: 18,
    padding: '14px 14px 18px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'grab',
    touchAction: 'none',
    pointerEvents: 'auto'
  },
  cardMedia: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    background: '#140308'
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  pill: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '4px 10px',
    background: 'rgba(20, 4, 10, 0.75)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #f0c978',
    borderRadius: 999,
    fontSize: 9.5,
    fontWeight: 700,
    color: '#f0c978',
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  },
  cardMeta: {
    paddingTop: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1
  },
  cardTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 18,
    fontWeight: 700,
    color: '#fff4e6',
    marginBottom: 4
  },
  cardDate: {
    fontSize: 11,
    color: '#e5ba7d',
    fontStyle: 'italic'
  },
  hint: {
    fontSize: 9.5,
    color: 'rgba(255, 230, 200, 0.65)',
    marginTop: 4
  },
  deckControls: {
    position: 'absolute',
    bottom: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    zIndex: 40
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '1.5px solid #f0c978',
    background: 'rgba(46, 12, 22, 0.75)',
    backdropFilter: 'blur(10px)',
    color: '#f0c978',
    fontSize: 18,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer'
  },
  primaryBtn: {
    width: 'auto',
    borderRadius: 999,
    padding: '0 22px',
    fontSize: 13,
    fontWeight: 700
  },
  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(14, 3, 7, 0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    zIndex: 100,
    display: 'grid',
    placeItems: 'center',
    padding: 20
  },
  lightboxDialog: {
    position: 'relative',
    maxWidth: 520,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(145deg, #3d0d1b 0%, #1e050d 100%)',
    border: '2px solid #f0c978',
    borderRadius: 24,
    boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(240, 201, 120, 0.45)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column'
  },
  lightboxClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid rgba(240, 201, 120, 0.4)',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#f0c978',
    fontSize: 22,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer'
  },
  lightboxImgContainer: {
    width: '100%',
    maxHeight: 380,
    borderRadius: 16,
    overflow: 'hidden',
    background: '#140308',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 16
  },
  lightboxImg: {
    width: '100%',
    maxHeight: 380,
    objectFit: 'contain'
  },
  lightboxMeta: {
    textAlign: 'center'
  },
  lightboxTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 24,
    color: '#fff5e6',
    marginBottom: 4
  },
  lightboxDate: {
    fontSize: 12,
    color: '#dfba7c',
    fontStyle: 'italic',
    marginBottom: 12
  },
  lightboxStory: {
    fontSize: 13.5,
    lineHeight: 1.6,
    color: '#f7ded3',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderLeft: '3px solid #f0c978',
    textAlign: 'left'
  }
};
