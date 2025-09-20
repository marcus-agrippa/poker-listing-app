import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

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
    'operators': 'Operator Claims'
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
    'operators': '🏢'
  };

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li>
            <Link
              to="/"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <FiHome className="mr-1" />
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
                <FiChevronRight className="text-gray-500 mx-2" size={14} />
                {isLast ? (
                  <span className="flex items-center text-white font-medium">
                    {icon && <span className="mr-1">{icon}</span>}
                    {label}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {icon && <span className="mr-1">{icon}</span>}
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;