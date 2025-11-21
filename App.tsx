import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import VisualizerPage from './pages/VisualizerPage';
import SciencePage from './pages/SciencePage';
import IndustryPage from './pages/IndustryPage';
import AskPage from './pages/AskPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<VisualizerPage />} />
          <Route path="/science" element={<SciencePage />} />
          <Route path="/industry" element={<IndustryPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;