import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { KilnPage } from './pages/KilnPage';
import { LevelsPage } from './pages/LevelsPage';
import { EndlessPage } from './pages/EndlessPage';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kiln" element={<KilnPage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/endless" element={<EndlessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
