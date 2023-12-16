// App.js
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import GamesPage from './components/GamesPage'; 
import ContactPage from './components/ContactPage';

function App() {
  useEffect(() => {
    ReactGA.initialize('G-PXFQ31JSSG');
    ReactGA.send('pageview');
  }, []);

  return (
    <div className="App flex flex-col min-h-screen">
      <Router>
        <Header />
        <main className="flex-grow">
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



