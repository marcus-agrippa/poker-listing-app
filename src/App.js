// App.js
import './App.css';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GamesPage from './components/GamesPage';
import ContactPage from './components/ContactPage';
import ReactGA from 'react-ga4';

function App() {
  const hostname = window.location.hostname;
  const isCentralCoast = hostname === 'pokercentralcoast.com';
  const isNewcastle = hostname === 'pokernewcastle.com';
  const isBallarat = hostname === 'pokerballarat.com';
  const isWollongong = hostname === 'pokerwollongong.com';
  const isTownsville = hostname === 'pokertownsville.com';
  const dataUrl =
    hostname === 'pokercentralcoast.com'
      ? '/data.json'
      : hostname === 'pokernewcastle.com'
      ? '/data-newcastle.json'
      : hostname === 'pokerballarat.com'
      ? '/data-ballarat.json'
      : hostname === 'pokerwollongong.com'
      ? '/data-wollongong.json'
      : hostname === 'pokertownsville.com'
      ? '/data-townsville.json'
      : '/data.json';
  const trackingId = isCentralCoast
    ? 'G-PXFQ31JSSG'
    : isNewcastle
    ? 'G-9N4FLFNY2X'
    : isBallarat
    ? 'G-5HY5J8HSYL'
    : isWollongong
    ? 'G-F9TJTVNPYW'
    : isTownsville
    ? 'G-BXXGBVYVLY'
    : 'G-PXFQ31JSSG';

  useEffect(() => {
    ReactGA.initialize(trackingId);
    ReactGA.send('pageview');
  }, [trackingId]);

  return (
    <div className='App flex flex-col min-h-screen'>
      <Helmet>
        <title>
          {isCentralCoast
            ? 'Poker Central Coast'
            : isNewcastle
            ? 'Poker Newcastle'
            : isBallarat
            ? 'Poker Ballarat'
            : isWollongong
            ? 'Poker Wollongong'
            : isTownsville
            ? 'Poker Townsville'
            : 'Poker Game Information'}
        </title>
        <meta
          name='description'
          content={
            isCentralCoast
              ? 'Discover and join poker games on the Central Coast. A central hub for all poker enthusiasts.'
              : isNewcastle
              ? 'Discover and join poker games in Newcastle. A central hub for all poker enthusiasts.'
              : isBallarat
              ? 'Discover and join poker games in Ballarat. A central hub for all poker enthusiasts.'
              : isWollongong
              ? 'Discover and join poker games in Wollongong. A central hub for all poker enthusiasts.'
              : isTownsville
              ? 'Discover and join poker games in Townsville. A central hub for all poker enthusiasts.'
              : 'Poker game information'
          }
        />
      </Helmet>
      <Router>
        <Header />
        <main className='flex-grow bg-gray-900'>
          <Routes>
            <Route path='/' element={<GamesPage dataUrl={dataUrl} />} />
            <Route path='/contact' element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
