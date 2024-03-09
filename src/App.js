// App.js
import './App.css';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GamesPage from './components/GamesPage'; 
import ContactPage from './components/ContactPage';
import ReactGA from 'react-ga4';

function App() {
  useEffect(() => {
    ReactGA.initialize('G-PXFQ31JSSG');
    ReactGA.send('pageview');
  }, []);

  return (
    <div className="App flex flex-col min-h-screen">
      <Router>
        <Header />
        <main className="flex-grow bg-gray-900">
          <Routes>
            <Route path="/" element={<GamesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;



