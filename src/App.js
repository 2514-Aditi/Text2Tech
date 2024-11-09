import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CSnap from './components/ImageUpload';
import CodeEditor from './components/CodeEditor';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CSNAP" element={<CSnap />} />
          <Route path="/Editor" element={<CodeEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
