// App.js
import './App.css';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GamesPage from './components/GamesPage';
import RegionFilteredGamesPage from './components/RegionFilteredGamesPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import Dashboard from './components/dashboard/Dashboard';
import SuggestionsView from './components/admin/SuggestionsView';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ReactGA from 'react-ga4';

const AppContent = () => {
  const hostname = window.location.hostname;
  const isCentralCoast = hostname === 'pokercentralcoast.com';
  const isNewcastle = hostname === 'pokernewcastle.com';
  const isBallarat = hostname === 'pokerballarat.com';
  const isWollongong = hostname === 'pokerwollongong.com';
  const isTownsville = hostname === 'pokertownsville.com';
  const isSunshineCoast = hostname === 'pokersunshinecoast.com';
  const isPerth = hostname === 'pokerperth.com';
  const isGeelong = hostname === 'pokergeelong.com';
  const isGoldCoast = hostname === 'pokergoldcoast.com';
  
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
      : hostname === 'pokersunshinecoast.com'
      ? '/data-sunshine-coast.json'
      : hostname === 'pokerperth.com'
      ? '/data-perth.json'
      : hostname === 'pokergeelong.com'
      ? '/data-geelong.json'
      : hostname === 'pokergoldcoast.com'
      ? '/data-gold-coast.json'
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
    : isSunshineCoast
    ? 'G-YVEMHWM9RS'
    : isPerth
    ? 'G-8SH60W18PM'
    : isGeelong
    ? 'G-E7FSLHCS2M'
    : isGoldCoast
    ? 'G-G23T3GJ7HV'
    : 'G-PXFQ31JSSG';

  useEffect(() => {
    ReactGA.initialize(trackingId);
    ReactGA.send('pageview');
  }, [trackingId]);

  return (
    <HelmetProvider>
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
            : isSunshineCoast
            ? 'Poker Sunshine Coast'
            : isPerth
            ? 'Poker Perth'
            : isGeelong
            ? 'Poker Geelong'
            : isGoldCoast
            ? 'Poker Gold Coast'
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
              : isSunshineCoast
              ? 'Discover and join poker games in Sunshine Coast. A central hub for all poker enthusiasts.'
              : isPerth
              ? 'Discover and join poker games in Perth. A central hub for all poker enthusiasts.'
              : isGeelong
              ? 'Discover and join poker games in Geelong. A central hub for all poker enthusiasts.'
              : isGoldCoast
              ? 'Discover and join poker games in Gold Coast. A central hub for all poker enthusiasts.'
              : 'Poker game information'
          }
        />
      </Helmet>
      <Router>
        <Header />
        <main className='flex-grow bg-gray-900'>
          <Routes>
            <Route path='/' element={<RegionFilteredGamesPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/terms' element={<TermsPage />} />
            <Route path='/privacy' element={<PrivacyPage />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/suggestions'
              element={
                <AdminRoute>
                  <SuggestionsView />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#374151',
            color: '#ffffff',
            border: '1px solid #4B5563',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
    </HelmetProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
