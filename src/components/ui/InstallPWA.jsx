import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('[PWA] InstallPWA component mounted');

    // Check if already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    console.log('[PWA] Standalone mode:', standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
    console.log('[PWA] iOS detected:', iOS);

    // Don't show banner if already installed
    if (standalone) {
      console.log('[PWA] App already installed, not showing banner');
      return;
    }

    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      console.log('[PWA] Banner dismissed', daysSinceDismissed, 'days ago');

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        console.log('[PWA] Not showing banner (dismissed less than 7 days ago)');
        return;
      }
    }

    // For Chrome/Edge - listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS - show instructions after a delay
    if (iOS && !standalone) {
      console.log('[PWA] Setting timeout to show iOS banner');
      setTimeout(() => {
        console.log('[PWA] Showing iOS banner');
        setShowInstallBanner(true);
      }, 3000); // Show after 3 seconds
    }

    // For Android/mobile devices - show banner even without beforeinstallprompt
    // This helps with testing and ensures mobile users see the option
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[PWA] Mobile detected:', isMobile);

    if (isMobile && !iOS && !standalone) {
      console.log('[PWA] Setting timeout to show Android banner');
      setTimeout(() => {
        console.log('[PWA] Showing Android banner');
        setShowInstallBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA] Install button clicked');
    console.log('[PWA] isIOS:', isIOS);
    console.log('[PWA] deferredPrompt:', deferredPrompt);

    if (isIOS) {
      // Show iOS instructions modal
      console.log('[PWA] Showing iOS instructions modal');
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available - showing instructions');
      // No native prompt available, show manual instructions for Android
      setShowIOSInstructions(true);
      return;
    }

    // Show the native install prompt
    console.log('[PWA] Showing native install prompt');
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Remember dismissal
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleCloseInstructions = () => {
    setShowIOSInstructions(false);
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Don't render if already installed or banner is hidden
  if (isStandalone || !showInstallBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-t border-blue-500 animate-slideUp'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <FiSmartphone className='w-6 h-6 flex-shrink-0' />
              <div>
                <p className='font-semibold text-sm'>Install Poker App</p>
                <p className='text-xs text-blue-100'>
                  Add to home screen for quick access and offline support
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 flex-shrink-0'>
              <button
                onClick={handleInstallClick}
                className='btn btn-sm bg-white text-blue-600 hover:bg-blue-50 border-none'>
                <FiDownload className='w-4 h-4' />
                <span className='hidden sm:inline'>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className='btn btn-sm btn-ghost text-white hover:bg-blue-600'>
                <FiX className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Install Instructions Modal */}
      {showIOSInstructions && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='card w-full max-w-md bg-slate-800 shadow-xl'>
            <div className='card-body'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='card-title text-white'>
                  {isIOS ? 'Install App on iOS' : 'Install App'}
                </h3>
                <button
                  onClick={handleCloseInstructions}
                  className='btn btn-circle btn-sm bg-gray-700 text-white border-none hover:bg-gray-600'>
                  <FiX />
                </button>
              </div>

              <div className='space-y-4 text-gray-300'>
                {isIOS ? (
                  <>
                    <p className='text-sm'>
                      To install this app on your iPhone or iPad:
                    </p>

                    <ol className='list-decimal list-inside space-y-3 text-sm'>
                      <li>
                        Tap the <strong>Share</strong> button{' '}
                        <span className='inline-block bg-gray-700 px-2 py-1 rounded text-xs'>
                          □↑
                        </span>{' '}
                        at the bottom of Safari
                      </li>
                      <li>
                        Scroll down and tap{' '}
                        <strong>"Add to Home Screen"</strong>
                      </li>
                      <li>
                        Tap <strong>"Add"</strong> in the top right corner
                      </li>
                      <li>
                        The app icon will appear on your home screen!
                      </li>
                    </ol>
                  </>
                ) : (
                  <>
                    <p className='text-sm'>
                      To install this app on your Android device:
                    </p>

                    <ol className='list-decimal list-inside space-y-3 text-sm'>
                      <li>
                        Tap the <strong>menu</strong> button{' '}
                        <span className='inline-block bg-gray-700 px-2 py-1 rounded text-xs'>
                          ⋮
                        </span>{' '}
                        in your browser
                      </li>
                      <li>
                        Look for <strong>"Add to Home screen"</strong> or{' '}
                        <strong>"Install app"</strong>
                      </li>
                      <li>
                        Tap it and confirm when prompted
                      </li>
                      <li>
                        The app icon will appear on your home screen!
                      </li>
                    </ol>
                  </>
                )}

                <div className='bg-blue-900/30 border border-blue-600/50 rounded-lg p-3 mt-4'>
                  <p className='text-xs text-blue-300'>
                    💡 <strong>Tip:</strong> Once installed, you can open the app
                    directly from your home screen just like a native app!
                  </p>
                </div>
              </div>

              <div className='form-control mt-6'>
                <button
                  onClick={handleCloseInstructions}
                  className='btn btn-primary w-full'>
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
