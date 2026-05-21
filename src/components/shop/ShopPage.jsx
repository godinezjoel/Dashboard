import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Lock, Egg, Dog, Cat, Bird, Rabbit, Ghost, Coins, RefreshCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import toast from 'react-hot-toast';

const PET_ICONS = {
  'Eggling': Egg,
  'Pup':     Dog,
  'Fox':     Cat,
  'Dragon':  Bird,
  'Bunny':   Rabbit,
  'Ghost':   Ghost,
};

export default function ShopPage() {
  const { profile, allPets, ownedPets, activePet, buyPet, activatePet } = useGame();
  const [loadingId, setLoadingId] = useState(null);

  const activePetId = activePet?.pet?.id ?? null;

  async function handleSelectPet(pet) {
    const userPet = ownedPets.find((p) => p.pet_id === pet.id);

    if (userPet) {
      // Already owned — just switch to it
      if (userPet.pet_id === activePetId) return; // already active, do nothing
      setLoadingId(pet.id);
      try {
        await activatePet(userPet.id);
        toast.success(`Switched to ${pet.name}.`);
      } catch (err) {
        toast.error('Failed to switch pet');
      } finally {
        setLoadingId(null);
      }
    } else {
      // Not owned — buy it (and it auto-activates)
      if (!profile || profile.coins < pet.price_coins) {
        toast.error('Not enough coins.');
        return;
      }
      setLoadingId(pet.id);
      try {
        const newUserPet = await buyPet(pet);
        // Activate the newly bought pet immediately
        await activatePet(newUserPet.id);
        toast.success(`${pet.name} is now your active pet.`);
      } catch (err) {
        toast.error(err.message ?? 'Purchase failed');
      } finally {
        setLoadingId(null);
      }
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-primary-var">
          <ShoppingBag size={20} />
          Pet Shop
        </h2>
        <p className="text-sm flex items-center gap-2 text-muted-var">
          Choose your companion
          {profile && (
            <span className="flex items-center gap-1 font-semibold text-secondary-var">
              <Coins size={13} /> {profile.coins}
            </span>
          )}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="pets"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {allPets.map((pet) => {
            const PetIcon = PET_ICONS[pet.name] || Ghost;
            const isActive = activePetId === pet.id;
            const owned = ownedPets.some((p) => p.pet_id === pet.id);
            const canAfford = (profile?.coins ?? 0) >= pet.price_coins;
            const isLoading = loadingId === pet.id;

            // Skip the currently active pet — it lives on "My Pet" page
            if (isActive) return null;

            return (
              <motion.div
                key={pet.id}
                whileHover={{ y: -2 }}
                className="card p-4 flex flex-col items-center text-center gap-3 relative overflow-hidden"
              >
                {/* Pet icon */}
                <div className="mt-2 text-neutral-400">
                  <PetIcon size={40} strokeWidth={1} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-primary-var">
                    {pet.name}
                  </p>
                  <p className="text-[10px] mt-0.5 leading-relaxed text-muted-var">
                    {pet.description}
                  </p>
                </div>

                {/* Price tag for unowned pets */}
                {!owned && pet.price_coins > 0 && (
                  <p className={`text-xs font-semibold flex items-center gap-1 ${canAfford ? 'text-secondary-var' : 'text-red-400'}`}>
                    <Coins size={11} /> {pet.price_coins}
                  </p>
                )}

                {/* Action */}
                <div className="w-full mt-auto">
                  {owned ? (
                    <button
                      className="w-full btn-ghost text-xs py-1.5 flex items-center justify-center gap-1"
                      onClick={() => handleSelectPet(pet)}
                      disabled={isLoading}
                      id={`switch-pet-${pet.id}`}
                    >
                      <RefreshCw size={11} />
                      {isLoading ? '...' : 'Switch to'}
                    </button>
                  ) : canAfford ? (
                    <button
                      className="w-full btn-primary text-xs py-1.5"
                      onClick={() => handleSelectPet(pet)}
                      disabled={isLoading}
                      id={`buy-pet-${pet.id}`}
                    >
                      {isLoading ? '...' : 'Buy & Activate'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-var">
                      <Lock size={11} /> Need {pet.price_coins}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
