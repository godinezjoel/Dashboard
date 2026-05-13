import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, Lock, Palette } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import toast from 'react-hot-toast';

const THEMES = [
  {
    id: 'default',
    name: 'Void Dark',
    description: 'Deep violet on dark slate. The default.',
    emoji: '🌌',
    price: 0,
    preview: 'from-violet-900 to-slate-900',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon cyan & magenta on pure black.',
    emoji: '⚡',
    price: 200,
    preview: 'from-cyan-900 to-purple-900',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Bioluminescent green on deep forest night.',
    emoji: '🌿',
    price: 200,
    preview: 'from-emerald-900 to-green-950',
  },
];

export default function ShopPage() {
  const { profile, allPets, ownedPets, buyPet, activatePet, setTheme } = useGame();
  const [activeTab, setActiveTab] = useState('pets');
  const [loadingId, setLoadingId] = useState(null);

  const ownedPetIds = new Set(ownedPets.map((p) => p.pet_id));
  const activePetId = ownedPets.find((p) => p.is_active)?.pet_id;
  const activeUserPetId = ownedPets.find((p) => p.is_active)?.id;

  async function handleBuyPet(pet) {
    if (!profile || profile.coins < pet.price_coins) {
      toast.error('Not enough coins! 🪙');
      return;
    }
    setLoadingId(pet.id);
    try {
      await buyPet(pet);
      toast.success(`${pet.sprite_emoji} ${pet.name} added to your collection!`);
    } catch (err) {
      toast.error(err.message ?? 'Purchase failed');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleActivatePet(userPet) {
    setLoadingId(userPet.id);
    try {
      await activatePet(userPet.id);
      toast.success(`${userPet.pet?.sprite_emoji} ${userPet.pet?.name} is now active!`);
    } catch (err) {
      toast.error('Failed to activate pet');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSetTheme(themeId) {
    await setTheme(themeId);
    toast.success(`Theme changed!`);
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
          Shop
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Spend your hard-earned coins
          {profile && (
            <span className="ml-2 text-amber-400 font-semibold">🪙 {profile.coins} available</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-surface)' }}>
        {[
          { id: 'pets', label: 'Pets', icon: '🐾' },
          { id: 'themes', label: 'Themes', icon: '🎨' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5`}
            id={`shop-tab-${tab.id}`}
            style={
              activeTab === tab.id
                ? { background: 'var(--bg-card)', color: 'var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }
                : { color: 'var(--text-muted)' }
            }
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pets Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'pets' && (
          <motion.div
            key="pets"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {allPets.map((pet) => {
              const owned = ownedPetIds.has(pet.id);
              const isActive = activePetId === pet.id;
              const userPet = ownedPets.find((p) => p.pet_id === pet.id);
              const canAfford = (profile?.coins ?? 0) >= pet.price_coins;
              const isLoading = loadingId === pet.id || loadingId === userPet?.id;

              return (
                <motion.div
                  key={pet.id}
                  whileHover={{ y: -2 }}
                  className="card p-4 flex flex-col items-center text-center gap-2 relative overflow-hidden"
                  style={{
                    border: isActive ? '1px solid var(--accent)' : undefined,
                    boxShadow: isActive ? '0 0 16px var(--accent-glow)' : undefined,
                  }}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 badge text-[10px]">Active</span>
                  )}

                  <span className="text-4xl block mt-1">{pet.sprite_emoji}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {pet.name}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {pet.description}
                    </p>
                  </div>

                  {/* Price / Owned tag */}
                  {pet.price_coins > 0 && !owned && (
                    <p className={`text-xs font-semibold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                      🪙 {pet.price_coins}
                    </p>
                  )}

                  {/* Action button */}
                  <div className="w-full mt-auto">
                    {owned && !isActive ? (
                      <button
                        className="w-full btn-ghost text-xs py-1.5"
                        onClick={() => handleActivatePet(userPet)}
                        disabled={isLoading}
                        id={`activate-pet-${pet.id}`}
                      >
                        {isLoading ? '...' : 'Activate'}
                      </button>
                    ) : owned && isActive ? (
                      <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                        <Check size={12} />
                        Active
                      </div>
                    ) : (
                      <button
                        className={`w-full text-xs py-1.5 rounded-lg font-medium transition-all ${
                          canAfford ? 'btn-primary' : 'btn-danger cursor-not-allowed'
                        }`}
                        onClick={() => canAfford && handleBuyPet(pet)}
                        disabled={!canAfford || isLoading}
                        id={`buy-pet-${pet.id}`}
                      >
                        {isLoading ? '...' : canAfford ? 'Buy' : <><Lock size={10} className="inline mr-1" />Need {pet.price_coins}</>}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <motion.div
            key="themes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {THEMES.map((theme) => {
              const isActive = (profile?.active_theme ?? 'default') === theme.id;
              const canAfford = theme.price === 0 || (profile?.coins ?? 0) >= theme.price;

              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ x: 2 }}
                  className="card p-4 flex items-center gap-4 cursor-pointer"
                  style={{
                    border: isActive ? '1px solid var(--accent)' : undefined,
                    boxShadow: isActive ? '0 0 16px var(--accent-glow)' : undefined,
                  }}
                  onClick={() => isActive || handleSetTheme(theme.id)}
                >
                  {/* Preview gradient */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.preview} flex-shrink-0 flex items-center justify-center text-xl`}>
                    {theme.emoji}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {theme.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {theme.description}
                    </p>
                  </div>

                  {isActive ? (
                    <span className="badge text-[10px]">Active</span>
                  ) : theme.price > 0 ? (
                    <span className={`text-xs font-semibold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                      🪙 {theme.price}
                    </span>
                  ) : (
                    <button
                      className="btn-ghost text-xs py-1"
                      onClick={() => handleSetTheme(theme.id)}
                      id={`set-theme-${theme.id}`}
                    >
                      Apply
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
