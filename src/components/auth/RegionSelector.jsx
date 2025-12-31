import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RegionSelector = ({ onRegionChange, currentRegion }) => {
  const [selectedRegion, setSelectedRegion] = useState(currentRegion || '');
  const [loading, setLoading] = useState(false);
  const { currentUser, updateUserProfile } = useAuth();

  const regions = [
    {
      value: 'central-coast',
      label: 'Central Coast',
      hostname: 'pokercentralcoast.com',
    },
    { value: 'newcastle', label: 'Newcastle', hostname: 'pokernewcastle.com' },
    { value: 'ballarat', label: 'Ballarat', hostname: 'pokerballarat.com' },
    {
      value: 'wollongong',
      label: 'Wollongong',
      hostname: 'pokerwollongong.com',
    },
    {
      value: 'townsville',
      label: 'Townsville',
      hostname: 'pokertownsville.com',
    },
    {
      value: 'sunshine-coast',
      label: 'Sunshine Coast',
      hostname: 'pokersunshinecoast.com',
    },
    { value: 'perth', label: 'Perth', hostname: 'pokerperth.com' },
    { value: 'geelong', label: 'Geelong', hostname: 'pokergeelong.com' },
    {
      value: 'gold-coast',
      label: 'Gold Coast',
      hostname: 'pokergoldcoast.com',
    },
    { value: 'brisbane', label: 'Brisbane', hostname: 'pokerbrisbane.com' },
    { value: 'sydney', label: 'Sydney', hostname: 'pokersydney.com' },
    { value: 'melbourne', label: 'Melbourne', hostname: 'pokermelbourne.com' },
  ];

  const handleRegionUpdate = async region => {
    if (!currentUser || loading) return;

    try {
      setLoading(true);
      await updateUserProfile({ region: region });

      setSelectedRegion(region);
      onRegionChange(region);
    } catch (error) {
      console.error('Error updating region:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card bg-slate-800 shadow-xl'>
      <div className='card-body'>
        <h3 className='card-title text-white mb-4'>Select Your Region</h3>
        <p className='text-gray-300 mb-4'>
          Choose your preferred region to see relevant poker games:
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          {regions.map(region => (
            <button
              key={region.value}
              onClick={() => handleRegionUpdate(region.label)}
              disabled={loading}
              className={`btn ${
                selectedRegion === region.label
                  ? 'btn-primary'
                  : 'btn-outline btn-ghost text-white hover:btn-primary'
              } ${loading ? 'loading' : ''}`}>
              {region.label}
            </button>
          ))}
        </div>

        {selectedRegion && (
          <div className='mt-4 p-3 bg-slate-700 rounded-lg'>
            <p className='text-white'>
              <strong>Current region:</strong> {selectedRegion}
            </p>
            <p className='text-gray-300 text-sm mt-1'>
              Games will be filtered to show {selectedRegion} area tournaments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionSelector;
