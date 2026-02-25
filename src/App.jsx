import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Timeline from './pages/Timeline';
import Letter from './pages/Letter';
import Proposal from './pages/Proposal';
import ValentineProposal from './pages/ValentineProposal';
import MemoryVault from './pages/MemoryVault';
import CreateStory from './pages/CreateStory';
import TrackStory from './pages/TrackStory';
import AdminDashboard from './pages/AdminDashboard';
import LoveLetter from './pages/LoveLetter';
import MusicPlayer from './components/MusicPlayer';
import VaultLock from './components/VaultLock';

// Route wrapper to decide whether to show Landing (View) or Create (Builder)
const RootRoute = () => {
  const [searchParams] = useSearchParams();
  const hasData = searchParams.get('data');
  const hasId = searchParams.get('id');
  return (hasData || hasId) ? <Landing /> : <CreateStory />;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/letter" element={<Letter />} />
        <Route path="/proposal" element={<Proposal />} />
        <Route path="/valentine" element={<ValentineProposal />} />
        <Route path="/vault" element={<MemoryVault />} />
        <Route path="/create" element={<CreateStory />} />
        <Route path="/track" element={<TrackStory />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/generate-letter" element={<LoveLetter />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-deep-purple min-h-screen text-white font-sans selection:bg-pink-500 selection:text-white overflow-hidden">
        <VaultLock />
        <MusicPlayer />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
