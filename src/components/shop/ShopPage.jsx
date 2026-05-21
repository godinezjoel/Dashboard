import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Lock, Egg, Dog, Cat, Bird, Rabbit, Ghost, Coins, RefreshCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import toast from 'react-hot-toast';
import './ShopPage.css';

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
    <div className="shop-container">
      {/* Header */}
      <div className="shop-header">
        <h2 className="shop-title">
          <ShoppingBag size={20} />
          Pet Shop
        </h2>
        <p className="shop-subtitle">
          Choose your companion
          {profile && (
            <span className="shop-coins-counter">
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
          className="shop-grid"
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
                className="card shop-card"
              >
                {/* Pet icon */}
                <div className="shop-card-icon-wrapper">
                  <PetIcon size={40} strokeWidth={1} />
                </div>

                <div>
                  <p className="shop-card-title">
                    {pet.name}
                  </p>
                  <p className="shop-card-desc">
                    {pet.description}
                  </p>
                </div>

                {/* Price tag for unowned pets */}
                {!owned && pet.price_coins > 0 && (
                  <p className={`shop-card-price ${canAfford ? '' : 'price-locked'}`}>
                    <Coins size={11} /> {pet.price_coins}
                  </p>
                )}

                {/* Action */}
                <div className="shop-card-action">
                  {owned ? (
                    <button
                      className="btn-ghost shop-btn-switch"
                      onClick={() => handleSelectPet(pet)}
                      disabled={isLoading}
                      id={`switch-pet-${pet.id}`}
                    >
                      <RefreshCw size={11} />
                      {isLoading ? '...' : 'Switch to'}
                    </button>
                  ) : canAfford ? (
                    <button
                      className="btn-primary shop-btn-buy"
                      onClick={() => handleSelectPet(pet)}
                      disabled={isLoading}
                      id={`buy-pet-${pet.id}`}
                    >
                      {isLoading ? '...' : 'Buy & Activate'}
                    </button>
                  ) : (
                    <div className="shop-btn-locked">
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
