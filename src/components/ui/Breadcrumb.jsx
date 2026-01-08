import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Define breadcrumb labels for different routes
  const routeLabels = {
    '': 'Games',
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'pokerdex': 'Pokerdex',
    'contact': 'Contact',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy',
    'admin': 'Admin',
    'suggestions': 'Suggestions',
    'operators': 'Operator Claims',
    'operator': 'Operator Dashboard',
    'submissions': 'Game Submissions'
  };

  // Define icons for different routes
  const routeIcons = {
    '': '🎰',
    'dashboard': '📊',
    'profile': '👤',
    'pokerdex': '⚡',
    'contact': '📧',
    'terms': '📋',
    'privacy': '🔒',
    'admin': '⚙️',
    'suggestions': '💡',
    'operators': '🏢',
    'operator': '🎮',
    'submissions': '📝'
  };

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null;
  }

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': window.location.origin
      },
      ...pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = routeLabels[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
        return {
          '@type': 'ListItem',
          'position': index + 2,
          'name': label,
          'item': `${window.location.origin}${routeTo}`
        };
      })
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <nav className="bg-gray-800 border-b border-gray-700" aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-sm flex-wrap">
            {/* Home link */}
            <li>
              <Link
                to="/"
                className="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Go to home page"
              >
                <FiHome className="mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </li>

            {pathnames.map((pathname, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const label = routeLabels[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
              const icon = routeIcons[pathname];

              return (
                <li key={routeTo} className="flex items-center">
                  <FiChevronRight className="text-gray-500 mx-1 sm:mx-2 flex-shrink-0" size={14} aria-hidden="true" />
                  {isLast ? (
                    <span className="flex items-center text-white font-medium" aria-current="page">
                      {icon && <span className="mr-1" aria-hidden="true">{icon}</span>}
                      <span className="truncate max-w-[150px] sm:max-w-none">{label}</span>
                    </span>
                  ) : (
                    <Link
                      to={routeTo}
                      className="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                      aria-label={`Go to ${label}`}
                    >
                      {icon && <span className="mr-1" aria-hidden="true">{icon}</span>}
                      <span className="truncate max-w-[100px] sm:max-w-none">{label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumb;