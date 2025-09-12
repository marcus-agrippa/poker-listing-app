import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiCheck, FiX, FiClock, FiUser, FiPlus, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SuggestionsView = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all, game_edit, new_operator

  const fetchSuggestions = async () => {
    try {
      const q = query(
        collection(db, 'gameSuggestions'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const suggestionsList = [];
      querySnapshot.forEach((doc) => {
        suggestionsList.push({ id: doc.id, ...doc.data() });
      });
      setSuggestions(suggestionsList);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const updateSuggestionStatus = async (suggestionId, status) => {
    try {
      await updateDoc(doc(db, 'gameSuggestions', suggestionId), {
        status: status,
        updatedAt: new Date().toISOString()
      });
      
      fetchSuggestions();
      toast.success(`Suggestion ${status === 'approved' ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error('Failed to update suggestion');
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    // Filter by status
    if (filter !== 'all' && suggestion.status !== filter) return false;
    
    // Filter by type
    if (typeFilter !== 'all') {
      const suggestionType = suggestion.type || 'game_edit'; // Default to game_edit for backward compatibility
      if (typeFilter !== suggestionType) return false;
    }
    
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheck className="text-green-400" />;
      case 'rejected': return <FiX className="text-red-400" />;
      default: return <FiClock className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg text-white"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 mt-8 max-w-screen-xl mb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Suggestions</h1>
        <p className="text-gray-300">Review user suggestions for game updates and new operators</p>
      </div>

      {/* Type Filter */}
      <div className="flex justify-center mb-4">
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${typeFilter === 'all' ? 'btn-active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            <FiEdit className="mr-1" />
            All Types ({suggestions.length})
          </button>
          <button 
            className={`btn btn-sm ${typeFilter === 'game_edit' ? 'btn-active' : ''}`}
            onClick={() => setTypeFilter('game_edit')}
          >
            <FiEdit className="mr-1" />
            Game Edits ({suggestions.filter(s => !s.type || s.type === 'game_edit').length})
          </button>
          <button 
            className={`btn btn-sm ${typeFilter === 'new_operator' ? 'btn-active' : ''}`}
            onClick={() => setTypeFilter('new_operator')}
          >
            <FiPlus className="mr-1" />
            New Operators ({suggestions.filter(s => s.type === 'new_operator').length})
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex justify-center mb-6">
        <div className="btn-group">
          <button 
            className={`btn ${filter === 'all' ? 'btn-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({filteredSuggestions.length})
          </button>
          <button 
            className={`btn ${filter === 'pending' ? 'btn-active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({suggestions.filter(s => s.status === 'pending').length})
          </button>
          <button 
            className={`btn ${filter === 'approved' ? 'btn-active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({suggestions.filter(s => s.status === 'approved').length})
          </button>
          <button 
            className={`btn ${filter === 'rejected' ? 'btn-active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({suggestions.filter(s => s.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No suggestions found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="card bg-slate-800 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(suggestion.status)}
                    <span className={`font-medium ${getStatusColor(suggestion.status)}`}>
                      {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(suggestion.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Show different content based on suggestion type */}
                {suggestion.type === 'new_operator' ? (
                  // New Operator Suggestion Layout
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <FiPlus className="mr-2 text-green-400" />
                        New Operator Request
                      </h3>
                      <div className="bg-slate-700 p-3 rounded-lg space-y-2 text-sm">
                        <p className="text-gray-300"><strong>Operator Name:</strong> {suggestion.operatorName}</p>
                        <p className="text-gray-300"><strong>Contact Info:</strong> {suggestion.contactInfo}</p>
                        {suggestion.website && (
                          <p className="text-gray-300"><strong>Website:</strong> <a href={suggestion.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{suggestion.website}</a></p>
                        )}
                        <p className="text-gray-300"><strong>Operating Regions:</strong> {suggestion.operatingRegions}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Additional Details</h3>
                      <div className="bg-slate-700 p-3 rounded-lg space-y-2 text-sm">
                        {suggestion.gameTypes && (
                          <p className="text-gray-300"><strong>Game Types:</strong> {suggestion.gameTypes}</p>
                        )}
                        {suggestion.venueInfo && (
                          <p className="text-gray-300"><strong>Venues:</strong> {suggestion.venueInfo}</p>
                        )}
                        {suggestion.additionalInfo && (
                          <p className="text-gray-300"><strong>Additional Info:</strong> {suggestion.additionalInfo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Game Edit Suggestion Layout (existing)
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <FiEdit className="mr-2 text-blue-400" />
                        Game Information
                      </h3>
                      <div className="bg-slate-700 p-3 rounded-lg space-y-2 text-sm">
                        <p className="text-gray-300"><strong>Venue:</strong> {suggestion.gameInfo?.venue}</p>
                        <p className="text-gray-300"><strong>Competition:</strong> {suggestion.gameInfo?.competition}</p>
                        <p className="text-gray-300"><strong>Day:</strong> {suggestion.gameInfo?.day}</p>
                        <p className="text-gray-300"><strong>Time:</strong> {suggestion.gameInfo?.game_time}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Suggested Change</h3>
                      <div className="bg-slate-700 p-3 rounded-lg space-y-2 text-sm">
                        <p className="text-gray-300"><strong>Field:</strong> {suggestion.suggestion?.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        
                        {suggestion.suggestion?.currentValue && (
                          <p className="text-gray-300">
                            <strong>Current:</strong> 
                            <span className="text-red-300 ml-2">{suggestion.suggestion.currentValue}</span>
                          </p>
                        )}
                        
                        {suggestion.suggestion?.suggestedValue && (
                          <p className="text-gray-300">
                            <strong>Suggested:</strong> 
                            <span className="text-green-300 ml-2">{suggestion.suggestion.suggestedValue}</span>
                          </p>
                        )}
                        
                        {suggestion.suggestion?.additionalNotes && (
                          <p className="text-gray-300">
                            <strong>Notes:</strong> {suggestion.suggestion.additionalNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <FiUser />
                    <span>Submitted by: {suggestion.userName || suggestion.submittedBy?.displayName} ({suggestion.userEmail || suggestion.submittedBy?.email})</span>
                    {suggestion.userRegion && (
                      <span className="text-gray-400">• {suggestion.userRegion}</span>
                    )}
                  </div>
                </div>

                {suggestion.status === 'pending' && (
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                      className="btn btn-success flex-1"
                    >
                      <FiCheck className="mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                      className="btn btn-error flex-1"
                    >
                      <FiX className="mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsView;