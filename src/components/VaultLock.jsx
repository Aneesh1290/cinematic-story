import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';

const VaultLock = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchParams] = useSearchParams();

    // Determine if we are in "Create Mode" (root without data, or /create)
    const isCreateMode = (location.pathname === '/' && !searchParams.get('data')) || location.pathname === '/create';

    // Don't show the lock if we are in the vault or creating a story
    if (location.pathname === '/vault' || isCreateMode) return null;

    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/vault')}
            className="fixed top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-pink-400 hover:text-white hover:bg-pink-500/50 transition-all z-50 shadow-lg border border-white/10"
            title="Secret Vault"
        >
            <Lock className="w-6 h-6" />
        </motion.button>
    );
};

export default VaultLock;
