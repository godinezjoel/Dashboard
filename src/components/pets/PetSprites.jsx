import { motion } from 'framer-motion';

/**
 * Animated SVG Pets.
 * Each pet is a standalone animated SVG component.
 * health: 0-100 for visual state changes.
 */

function PetEggling({ health }) {
  const isDying = health < 30;
  return (
    <svg viewBox="0 0 200 220" width="180" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="egg-shell" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor={isDying ? '#6b7280' : '#f0f4ff'} />
          <stop offset="100%" stopColor={isDying ? '#374151' : '#c7d2fe'} />
        </radialGradient>
        <radialGradient id="egg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isDying ? '#ef4444' : '#818cf8'} stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="egg-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor={isDying ? '#ef4444' : '#818cf8'} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Glow */}
      <ellipse cx="100" cy="130" rx="70" ry="70" fill="url(#egg-glow)" />

      {/* Egg body */}
      <motion.ellipse
        cx="100" cy="108" rx="52" ry="65"
        fill="url(#egg-shell)"
        filter="url(#egg-shadow)"
        animate={{ scaleX: [1, 1.03, 1], scaleY: [1, 0.97, 1] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      />

      {/* Highlight */}
      <ellipse cx="80" cy="80" rx="18" ry="12" fill="white" fillOpacity="0.3" transform="rotate(-20, 80, 80)" />

      {/* Crack if health < 60 */}
      {health < 60 && (
        <motion.path
          d="M100 90 L105 100 L98 108 L106 120"
          stroke={isDying ? '#ef4444' : '#818cf8'}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2], repeatDelay: 3 }}
        transformOrigin="100px 108px"
      >
        <circle cx="88" cy="112" r="5" fill={isDying ? '#6b7280' : '#312e81'} />
        <circle cx="112" cy="112" r="5" fill={isDying ? '#6b7280' : '#312e81'} />
        {!isDying && <circle cx="90" cy="110" r="2" fill="white" />}
        {!isDying && <circle cx="114" cy="110" r="2" fill="white" />}
      </motion.g>

      {/* Mouth */}
      {isDying ? (
        <path d="M92 124 Q100 120 108 124" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M92 124 Q100 130 108 124" stroke="#312e81" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* Blush */}
      {!isDying && (
        <>
          <ellipse cx="80" cy="120" rx="8" ry="5" fill="#f9a8d4" fillOpacity="0.5" />
          <ellipse cx="120" cy="120" rx="8" ry="5" fill="#f9a8d4" fillOpacity="0.5" />
        </>
      )}

      {/* Ground shadow */}
      <ellipse cx="100" cy="178" rx="50" ry="8" fill="black" fillOpacity="0.15" />
    </svg>
  );
}

function PetDragon({ health }) {
  const isDying = health < 30;
  return (
    <svg viewBox="0 0 200 220" width="180" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dragon-body" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor={isDying ? '#6b7280' : '#86efac'} />
          <stop offset="100%" stopColor={isDying ? '#1f2937' : '#166534'} />
        </radialGradient>
        <radialGradient id="dragon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isDying ? '#ef4444' : '#4ade80'} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="dragon-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor={isDying ? '#ef4444' : '#4ade80'} floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Glow behind */}
      <ellipse cx="100" cy="130" rx="70" ry="60" fill="url(#dragon-glow)" />

      {/* Wings */}
      <motion.path
        d="M68 95 C40 70, 20 80, 30 110"
        stroke={isDying ? '#4b5563' : '#86efac'}
        strokeWidth="16" strokeLinecap="round" fill="none"
        animate={{ rotate: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        transformOrigin="68px 95px"
      />
      <motion.path
        d="M132 95 C160 70, 180 80, 170 110"
        stroke={isDying ? '#4b5563' : '#86efac'}
        strokeWidth="16" strokeLinecap="round" fill="none"
        animate={{ rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        transformOrigin="132px 95px"
      />

      {/* Body */}
      <motion.ellipse
        cx="100" cy="115" rx="45" ry="55"
        fill="url(#dragon-body)"
        filter="url(#dragon-shadow)"
        animate={{ scaleY: [1, 0.97, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      />

      {/* Belly */}
      <ellipse cx="100" cy="125" rx="28" ry="38" fill={isDying ? '#374151' : '#bbf7d0'} fillOpacity="0.7" />

      {/* Highlight */}
      <ellipse cx="83" cy="88" rx="14" ry="9" fill="white" fillOpacity="0.25" transform="rotate(-15, 83, 88)" />

      {/* Horns */}
      <path d="M85 63 L80 45 L88 60" fill={isDying ? '#4b5563' : '#4ade80'} />
      <path d="M115 63 L120 45 L112 60" fill={isDying ? '#4b5563' : '#4ade80'} />

      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 5, times: [0, 0.05, 0.15], repeatDelay: 2 }}
        transformOrigin="100px 100px"
      >
        <ellipse cx="87" cy="100" rx="7" ry="8" fill={isDying ? '#374151' : '#052e16'} />
        <ellipse cx="113" cy="100" rx="7" ry="8" fill={isDying ? '#374151' : '#052e16'} />
        {!isDying && <circle cx="90" cy="97" r="3" fill="white" />}
        {!isDying && <circle cx="116" cy="97" r="3" fill="white" />}
        {/* Slit pupils */}
        <rect x="85" y="96" width="4" height="8" rx="2" fill={isDying ? '#6b7280' : '#4ade80'} fillOpacity="0.7" />
        <rect x="111" y="96" width="4" height="8" rx="2" fill={isDying ? '#6b7280' : '#4ade80'} fillOpacity="0.7" />
      </motion.g>

      {/* Nostrils */}
      <circle cx="95" cy="112" r="2.5" fill={isDying ? '#4b5563' : '#052e16'} />
      <circle cx="105" cy="112" r="2.5" fill={isDying ? '#4b5563' : '#052e16'} />

      {/* Fire breath (only if health > 50) */}
      {health > 50 && (
        <motion.g
          animate={{ scaleX: [1, 1.3, 0.9, 1.1, 1], opacity: [0.8, 1, 0.6, 0.9, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          transformOrigin="100px 130px"
        >
          <ellipse cx="100" cy="148" rx="10" ry="6" fill="#f97316" fillOpacity="0.9" />
          <ellipse cx="100" cy="154" rx="6" ry="4" fill="#fbbf24" fillOpacity="0.7" />
        </motion.g>
      )}

      {/* Ground shadow */}
      <ellipse cx="100" cy="175" rx="55" ry="9" fill="black" fillOpacity="0.15" />
    </svg>
  );
}

function PetGhost({ health }) {
  const isDying = health < 30;
  return (
    <svg viewBox="0 0 200 220" width="180" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ghost-body" cx="40%" cy="25%" r="65%">
          <stop offset="0%" stopColor={isDying ? '#d1d5db' : '#e0e7ff'} />
          <stop offset="100%" stopColor={isDying ? '#6b7280' : '#a5b4fc'} stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="ghost-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={isDying ? '#ef4444' : '#818cf8'} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="ghost-blur">
          <feDropShadow dx="0" dy="4" stdDeviation="16" floodColor={isDying ? '#ef4444' : '#818cf8'} floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Glow */}
      <ellipse cx="100" cy="110" rx="75" ry="75" fill="url(#ghost-glow)" />

      {/* Ghost body */}
      <motion.path
        d="M55 120 C55 80, 75 55, 100 55 C125 55, 145 80, 145 120 L145 160 C138 152, 130 160, 122 152 C114 160, 107 152, 100 160 C93 152, 86 160, 78 152 C70 160, 62 152, 55 160 Z"
        fill="url(#ghost-body)"
        filter="url(#ghost-blur)"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />

      {/* Highlight */}
      <ellipse cx="80" cy="85" rx="18" ry="12" fill="white" fillOpacity="0.3" transform="rotate(-20, 80, 85)" />

      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.08, 0.2], repeatDelay: 2.5 }}
        transformOrigin="100px 105px"
      >
        <ellipse cx="86" cy="105" rx="9" ry="10" fill={isDying ? '#374151' : '#312e81'} />
        <ellipse cx="114" cy="105" rx="9" ry="10" fill={isDying ? '#374151' : '#312e81'} />
        {!isDying && <circle cx="90" cy="101" r="4" fill="white" fillOpacity="0.9" />}
        {!isDying && <circle cx="118" cy="101" r="4" fill="white" fillOpacity="0.9" />}
      </motion.g>

      {/* Cute mouth */}
      {isDying ? (
        <path d="M90 122 Q100 118 110 122" stroke="#4b5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M88 122 Q94 128 100 122 Q106 128 112 122" stroke="#312e81" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* Blush */}
      {!isDying && (
        <>
          <ellipse cx="74" cy="116" rx="10" ry="6" fill="#f9a8d4" fillOpacity="0.4" />
          <ellipse cx="126" cy="116" rx="10" ry="6" fill="#f9a8d4" fillOpacity="0.4" />
        </>
      )}

      {/* Floating sparkles */}
      {!isDying && (
        <>
          <motion.circle cx="45" cy="90" r="3" fill="#c7d2fe"
            animate={{ y: [-5, 5, -5], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0 }} />
          <motion.circle cx="158" cy="85" r="2.5" fill="#c7d2fe"
            animate={{ y: [5, -5, 5], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.7 }} />
          <motion.circle cx="50" cy="145" r="2" fill="#e0e7ff"
            animate={{ y: [-3, 3, -3], opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, delay: 1.2 }} />
        </>
      )}

      {/* Ground shadow */}
      <ellipse cx="100" cy="183" rx="60" ry="7" fill="black" fillOpacity="0.1" />
    </svg>
  );
}

function PetPup({ health }) {
  const isDying = health < 30;
  return (
    <svg viewBox="0 0 200 220" width="180" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pup-body" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor={isDying ? '#9ca3af' : '#fcd34d'} />
          <stop offset="100%" stopColor={isDying ? '#374151' : '#d97706'} />
        </radialGradient>
        <filter id="pup-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor={isDying ? '#ef4444' : '#f59e0b'} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Body */}
      <motion.ellipse cx="100" cy="130" rx="50" ry="45"
        fill="url(#pup-body)" filter="url(#pup-shadow)"
        animate={{ scaleY: [1, 0.97, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />

      {/* Head */}
      <motion.circle cx="100" cy="85" r="42"
        fill="url(#pup-body)"
        filter="url(#pup-shadow)"
      />

      {/* Ears */}
      <motion.ellipse cx="65" cy="62" rx="18" ry="26" fill={isDying ? '#6b7280' : '#b45309'}
        animate={{ rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        transformOrigin="65px 62px"
      />
      <motion.ellipse cx="135" cy="62" rx="18" ry="26" fill={isDying ? '#6b7280' : '#b45309'}
        animate={{ rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
        transformOrigin="135px 62px"
      />
      <ellipse cx="65" cy="65" rx="10" ry="18" fill={isDying ? '#4b5563' : '#fca5a5'} fillOpacity="0.6" />
      <ellipse cx="135" cy="65" rx="10" ry="18" fill={isDying ? '#4b5563' : '#fca5a5'} fillOpacity="0.6" />

      {/* Face highlight */}
      <ellipse cx="82" cy="70" rx="14" ry="10" fill="white" fillOpacity="0.2" transform="rotate(-15, 82, 70)" />

      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.08, 1] }}
        transition={{ repeat: Infinity, duration: 5, times: [0, 0.05, 0.15], repeatDelay: 2 }}
        transformOrigin="100px 85px"
      >
        <circle cx="86" cy="85" r="8" fill={isDying ? '#374151' : '#1c1917'} />
        <circle cx="114" cy="85" r="8" fill={isDying ? '#374151' : '#1c1917'} />
        {!isDying && <circle cx="89" cy="82" r="3.5" fill="white" />}
        {!isDying && <circle cx="117" cy="82" r="3.5" fill="white" />}
      </motion.g>

      {/* Nose */}
      <ellipse cx="100" cy="99" rx="9" ry="6" fill={isDying ? '#4b5563' : '#1c1917'} />
      <path d="M100 105 L100 110" stroke={isDying ? '#4b5563' : '#1c1917'} strokeWidth="2" />
      <path d="M88 110 Q100 118 112 110" stroke={isDying ? '#4b5563' : '#1c1917'} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Tail */}
      <motion.path d="M148 140 Q170 115 165 100" stroke={isDying ? '#6b7280' : '#d97706'} strokeWidth="14" strokeLinecap="round" fill="none"
        animate={{ rotate: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
        transformOrigin="148px 140px"
      />

      {/* Blush */}
      {!isDying && (
        <>
          <ellipse cx="74" cy="97" rx="10" ry="6" fill="#fca5a5" fillOpacity="0.5" />
          <ellipse cx="126" cy="97" rx="10" ry="6" fill="#fca5a5" fillOpacity="0.5" />
        </>
      )}

      <ellipse cx="100" cy="180" rx="55" ry="8" fill="black" fillOpacity="0.15" />
    </svg>
  );
}

function PetBunny({ health }) {
  const isDying = health < 30;
  return (
    <svg viewBox="0 0 200 220" width="180" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bunny-body" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor={isDying ? '#d1d5db' : '#f3f4f6'} />
          <stop offset="100%" stopColor={isDying ? '#6b7280' : '#d1d5db'} />
        </radialGradient>
        <filter id="bunny-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor={isDying ? '#ef4444' : '#a78bfa'} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Long ears */}
      <motion.ellipse cx="75" cy="45" rx="14" ry="40" fill="url(#bunny-body)" filter="url(#bunny-shadow)"
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        transformOrigin="75px 70px"
      />
      <motion.ellipse cx="125" cy="45" rx="14" ry="40" fill="url(#bunny-body)" filter="url(#bunny-shadow)"
        animate={{ rotate: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.3 }}
        transformOrigin="125px 70px"
      />
      <ellipse cx="75" cy="45" rx="6" ry="30" fill={isDying ? '#4b5563' : '#fca5a5'} fillOpacity="0.7" />
      <ellipse cx="125" cy="45" rx="6" ry="30" fill={isDying ? '#4b5563' : '#fca5a5'} fillOpacity="0.7" />

      {/* Body */}
      <ellipse cx="100" cy="145" rx="45" ry="45" fill="url(#bunny-body)" filter="url(#bunny-shadow)" />

      {/* Head */}
      <motion.circle cx="100" cy="95" r="40" fill="url(#bunny-body)" filter="url(#bunny-shadow)"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      />

      {/* Face highlight */}
      <ellipse cx="84" cy="82" rx="13" ry="9" fill="white" fillOpacity="0.3" transform="rotate(-15, 84, 82)" />

      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.15], repeatDelay: 3 }}
        transformOrigin="100px 92px"
      >
        <circle cx="87" cy="92" r="7" fill={isDying ? '#374151' : '#4c1d95'} />
        <circle cx="113" cy="92" r="7" fill={isDying ? '#374151' : '#4c1d95'} />
        {!isDying && <circle cx="90" cy="89" r="3" fill="white" />}
        {!isDying && <circle cx="116" cy="89" r="3" fill="white" />}
      </motion.g>

      {/* Bunny nose */}
      <ellipse cx="100" cy="106" rx="5" ry="4" fill={isDying ? '#6b7280' : '#fca5a5'} />
      <path d="M97 110 Q100 115 103 110" stroke={isDying ? '#6b7280' : '#ec4899'} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Blush */}
      {!isDying && (
        <>
          <ellipse cx="76" cy="103" rx="9" ry="5" fill="#fca5a5" fillOpacity="0.5" />
          <ellipse cx="124" cy="103" rx="9" ry="5" fill="#fca5a5" fillOpacity="0.5" />
        </>
      )}

      {/* Belly */}
      <ellipse cx="100" cy="148" rx="28" ry="32" fill="white" fillOpacity="0.3" />

      <ellipse cx="100" cy="192" rx="52" ry="8" fill="black" fillOpacity="0.12" />
    </svg>
  );
}

const PET_COMPONENTS = {
  'Eggling': PetEggling,
  'Dragon':  PetDragon,
  'Ghost':   PetGhost,
  'Pup':     PetPup,
  'Bunny':   PetBunny,
  'Fox':     PetGhost, // Fox uses ghost base as placeholder
};

export function getPetComponent(petName) {
  return PET_COMPONENTS[petName] || PetEggling;
}

export { PetEggling, PetDragon, PetGhost, PetPup, PetBunny };
