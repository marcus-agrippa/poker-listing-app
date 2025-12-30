import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  FiPlus,
  FiSearch,
  FiX,
  FiEdit3,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiEdit,
  FiEye,
  FiTarget,
  FiActivity,
  FiTrendingUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';

const MAX_FREE_NOTES = 5;

const Pokerdex = () => {
  const { currentUser, userProfile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [regionGames, setRegionGames] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    date: '',
    playerObservations: '',
    gameNotes: '',
    tags: '',
    category: 'player', // player, venue, strategy, general
  });

  const categories = [
    { value: 'player', label: '👤 Player Profiles', icon: FiUser },
    { value: 'tells', label: '👁️ Tells & Reads', icon: FiEye },
    { value: 'playing-style', label: '🎲 Playing Styles', icon: FiActivity },
    { value: 'tendencies', label: '📊 Player Tendencies', icon: FiTrendingUp },
    { value: 'strategy', label: '🎯 Strategy Notes', icon: FiTarget },
    { value: 'venue', label: '🏢 Venue Notes', icon: FiMapPin },
    { value: 'general', label: '📝 General Notes', icon: FiEdit3 },
  ];

  const fetchNotes = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'pokerdex'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userNotes = [];
      querySnapshot.forEach(doc => {
        userNotes.push({ id: doc.id, ...doc.data() });
      });

      setNotes(userNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchRegionGames();
  }, [currentUser]);

  const fetchRegionGames = async () => {
    if (!userProfile?.region) return;

    try {
      // Map region names to data URLs (same logic as in App.js)
      const regionDataMap = {
        'Central Coast': '/data.json',
        Newcastle: '/data-newcastle.json',
        Ballarat: '/data-ballarat.json',
        Wollongong: '/data-wollongong.json',
        Townsville: '/data-townsville.json',
        'Sunshine Coast': '/data-sunshine-coast.json',
        Perth: '/data-perth.json',
        Geelong: '/data-geelong.json',
        'Gold Coast': '/data-gold-coast.json',
        Brisbane: '/data-brisbane.json',
        Sydney: '/data-sydney.json',
      };

      const dataUrl = regionDataMap[userProfile.region] || '/data.json';
      const response = await fetch(dataUrl);
      const games = await response.json();
      setRegionGames(games);
    } catch (error) {
      console.error('Error fetching region games:', error);
    }
  };

  const isPremium = userProfile?.isPremium || false;
  const canAddNote = notes.length < MAX_FREE_NOTES || isPremium || editingNote;

  const handleSubmit = async e => {
    e.preventDefault();

    // Check limits for new notes
    if (!editingNote && !canAddNote) {
      toast.error(
        `Free users are limited to ${MAX_FREE_NOTES} notes. Please upgrade to High Roller!`
      );
      return;
    }

    const noteData = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingNote) {
        const noteRef = doc(db, 'pokerdex', editingNote.id);
        await updateDoc(noteRef, {
          ...noteData,
          createdAt: editingNote.createdAt, // Keep original created date
        });
        toast.success('Note updated successfully!');
      } else {
        await addDoc(collection(db, 'pokerdex'), noteData);
        toast.success('Note added successfully!');
      }

      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleEdit = note => {
    setFormData({
      title: note.title,
      venue: note.venue,
      date: note.date,
      playerObservations: note.playerObservations,
      gameNotes: note.gameNotes,
      tags: note.tags.join(', '),
      category: note.category,
    });
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = note => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'pokerdex', noteToDelete.id));
      toast.success('Note deleted successfully!');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      venue: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      playerObservations: '',
      gameNotes: '',
      tags: '',
      category: 'player',
    });
    setEditingNote(null);
    setIsFormOpen(false);
  };

  // Get unique venues from region games
  const uniqueVenues = [...new Set(regionGames.map(game => game.venue))].sort();

  // Get unique games from notes (using title as game name)
  const uniqueGames = [...new Set(notes.map(note => note.title))]
    .filter(title => title)
    .sort();

  // Get unique venues from notes
  const uniqueVenuesFromNotes = [...new Set(notes.map(note => note.venue))]
    .filter(venue => venue)
    .sort();

  const filteredNotes = notes.filter(note => {
    // Category filter
    if (selectedCategory && note.category !== selectedCategory) return false;

    // Venue filter
    if (selectedVenue && note.venue !== selectedVenue) return false;

    // Game filter
    if (selectedGame && note.title !== selectedGame) return false;

    // Search filter
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.venue.toLowerCase().includes(searchLower) ||
      note.playerObservations.toLowerCase().includes(searchLower) ||
      note.gameNotes.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const getCategoryIcon = category => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : FiEdit3;
  };

  const getCategoryLabel = category => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : 'General Notes';
  };

  const getPlayerObservationsPlaceholder = category => {
    const placeholders = {
      player:
        'e.g., John from seat 3 - plays tight but bluffs big on rivers. Loves to slowplay sets.',
      tells:
        'e.g., Touches nose when bluffing. Sits forward when holding strong hands. Talks more with weak holdings.',
      'playing-style':
        'e.g., Tight-aggressive player. Rarely calls, either folds or raises. Plays position well.',
      tendencies:
        'e.g., Always raises UTG with premium hands. 3-bets light from button. Folds to 4-bets without AA/KK.',
      strategy:
        'e.g., Focus on position against this player. Bluff sparingly. Value bet thinly.',
      venue:
        'e.g., Dealers are fast. Good lighting. Players tend to be recreational on weekends.',
      general:
        'e.g., Remember to track this for next session. Important observation about the game.',
    };
    return placeholders[category] || placeholders.general;
  };

  const getGameNotesPlaceholder = category => {
    const placeholders = {
      player:
        'e.g., This player responds well to pressure. Folds easily to 3-bets without strong hands.',
      tells:
        'e.g., Physical tells: hand shaking with strong hands, betting patterns change when bluffing.',
      'playing-style':
        'e.g., LAG style - lots of action, needs strong hands to call big bets.',
      tendencies:
        'e.g., Always continuation bets flop, rarely double barrels without equity.',
      strategy:
        'e.g., Table was very tight pre-flop. Good spots for stealing blinds. Avoid bluffing station in seat 3.',
      venue:
        'e.g., $1/$2 game plays bigger than other venues. Rake is 10% capped at $6.',
      general:
        'e.g., General observations about the session, table dynamics, or important moments.',
    };
    return placeholders[category] || placeholders.general;
  };

  if (!currentUser?.emailVerified) {
    return (
      <div className='text-center text-white p-8'>
        <p>Please verify your email to access your pokerdex.</p>
      </div>
    );
  }

  return (
    <div className='mx-auto p-4 mt-8 max-w-screen-xl mb-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>⚡ Pokerdex</h1>
        <p className='text-gray-300'>
          Track players, strategies, and insights from your poker sessions
        </p>
      </div>

      {/* Controls */}
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search notes...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'>
                <FiX />
              </button>
            )}
          </div>

          {/* Add Note Button */}
          <button
            onClick={() => (canAddNote ? setIsFormOpen(true) : null)}
            className={`btn flex items-center ${
              canAddNote
                ? 'btn-primary'
                : 'btn-disabled opacity-50 cursor-not-allowed'
            }`}
            disabled={!canAddNote}>
            <FiPlus className='mr-2' />
            Add Note
            {!isPremium && ` (${notes.length}/${MAX_FREE_NOTES})`}
          </button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Category Filter */}
          <div className='flex-1'>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className='w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'>
              <option value=''>All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Venue Filter */}
          {uniqueVenuesFromNotes.length > 0 && (
            <div className='flex-1'>
              <select
                value={selectedVenue}
                onChange={e => setSelectedVenue(e.target.value)}
                className='w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'>
                <option value=''>All Venues</option>
                {uniqueVenuesFromNotes.map(venue => (
                  <option key={venue} value={venue}>
                    📍 {venue}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Game Filter */}
          {uniqueGames.length > 0 && (
            <div className='flex-1'>
              <select
                value={selectedGame}
                onChange={e => setSelectedGame(e.target.value)}
                className='w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'>
                <option value=''>All Games</option>
                {uniqueGames.map(game => (
                  <option key={game} value={game}>
                    🎯 {game}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          {(selectedCategory || selectedVenue || selectedGame) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedVenue('');
                setSelectedGame('');
              }}
              className='px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center'>
              <FiX className='mr-1' />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* High Roller Upgrade Banner */}
      {!isPremium && notes.length >= MAX_FREE_NOTES && (
        <div className='container mx-auto px-4 mb-6'>
          <div className='bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-lg p-6'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
              <div className='text-center md:text-left mb-4 md:mb-0'>
                <h3 className='text-xl font-bold text-yellow-400 mb-2'>
                  🔒 Upgrade to High Roller pokerdex
                </h3>
                <p className='text-gray-300'>
                  You've reached your limit of {MAX_FREE_NOTES} free notes.
                  Upgrade to High Roller for unlimited notes, advanced search,
                  and more features!
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-3 flex-shrink-0'>
                <button
                  onClick={() => {
                    toast(
                      'Please use the same email and account name as your poker account when signing up!'
                    );
                    window.open('https://ko-fi.com/pokergamesaus', '_blank');
                  }}
                  className='btn btn-warning px-6'>
                  🎯 Upgrade to High Roller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High Roller Status Badge */}
      {isPremium && (
        <div className='container mx-auto px-4 mb-6'>
          <div className='bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/50 rounded-lg p-4'>
            <div className='text-center'>
              <span className='inline-flex items-center px-3 py-1 rounded-full bg-green-600 text-white font-semibold'>
                🎯 High Roller Member
              </span>
              <p className='text-gray-300 mt-2'>
                Unlimited notes • Advanced search • Priority support
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className='flex justify-center'>
          <div className='loading loading-spinner loading-lg text-white'></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>📚</div>
          <h3 className='text-xl font-semibold text-white mb-2'>
            {searchTerm ? 'No notes found' : 'Your pokerdex is empty'}
          </h3>
          <p className='text-gray-400 mb-6 max-w-md mx-auto'>
            {searchTerm
              ? `No notes match "${searchTerm}"`
              : 'Start tracking your poker observations and player insights!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsFormOpen(true)}
              className='btn btn-primary'>
              <FiPlus className='mr-2' />
              Add Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {filteredNotes.map(note => {
            const CategoryIcon = getCategoryIcon(note.category);
            return (
              <div
                key={note.id}
                className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex items-center'>
                    <CategoryIcon className='text-blue-400 mr-2' />
                    <span className='text-xs text-gray-400'>
                      {getCategoryLabel(note.category)}
                    </span>
                  </div>
                  {/* Desktop buttons - hidden on mobile */}
                  <div className='hidden md:flex space-x-2'>
                    <button
                      onClick={() => handleEdit(note)}
                      className='btn btn-ghost btn-sm text-gray-400 hover:text-white'
                      title='Edit note'>
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(note)}
                      className='btn btn-ghost btn-sm text-red-400 hover:text-red-300'
                      title='Delete note'>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <h3 className='text-lg font-semibold text-white mb-2'>
                  {note.title}
                </h3>

                {note.venue && (
                  <p className='text-sm text-gray-400 mb-2'>📍 {note.venue}</p>
                )}

                {note.date && (
                  <p className='text-sm text-gray-400 mb-3'>
                    📅 {new Date(note.date).toLocaleDateString()}
                  </p>
                )}

                {note.playerObservations && (
                  <div className='mb-3'>
                    <h4 className='text-sm font-medium text-gray-300 mb-1'>
                      Player Notes:
                    </h4>
                    <p className='text-sm text-gray-400'>
                      {note.playerObservations}
                    </p>
                  </div>
                )}

                {note.gameNotes && (
                  <div className='mb-3'>
                    <h4 className='text-sm font-medium text-gray-300 mb-1'>
                      Game Notes:
                    </h4>
                    <p className='text-sm text-gray-400'>{note.gameNotes}</p>
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mt-3 justify-center'>
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-blue-600 bg-opacity-20 text-blue-400 text-xs rounded-full'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mobile buttons - shown only on mobile */}
                <div className='grid grid-cols-2 gap-2 mt-4 md:hidden'>
                  <button
                    onClick={() => handleEdit(note)}
                    className='btn btn-sm btn-outline text-gray-400 hover:text-white hover:border-white'
                    title='Edit note'>
                    <FiEdit className='mr-1' />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(note)}
                    className='btn btn-sm btn-outline btn-error text-red-400 hover:text-white'
                    title='Delete note'>
                    <FiTrash2 className='mr-1' />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Note Modal */}
      {isFormOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-white'>
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>
              <button
                onClick={resetForm}
                className='text-gray-400 hover:text-white text-2xl'>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Title *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'
                    placeholder='e.g., Friday night observations'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Venue
                  </label>
                  {uniqueVenues.length > 0 ? (
                    <select
                      value={formData.venue}
                      onChange={e =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'>
                      <option value=''>
                        Select a venue from {userProfile?.region}...
                      </option>
                      {uniqueVenues.map(venue => (
                        <option key={venue} value={venue}>
                          {venue}
                        </option>
                      ))}
                      <option value='__custom__'>
                        🏢 Other venue (type custom name)
                      </option>
                    </select>
                  ) : (
                    <input
                      type='text'
                      value={formData.venue}
                      onChange={e =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'
                      placeholder='e.g., Crown Casino'
                    />
                  )}

                  {formData.venue === '__custom__' && (
                    <input
                      type='text'
                      placeholder='Enter custom venue name...'
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 mt-2'
                      onChange={e =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Date
                  </label>
                  <input
                    type='date'
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Player Observations
                </label>
                <textarea
                  rows='4'
                  value={formData.playerObservations}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      playerObservations: e.target.value,
                    })
                  }
                  className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'
                  placeholder={getPlayerObservationsPlaceholder(
                    formData.category
                  )}></textarea>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Game Notes
                </label>
                <textarea
                  rows='4'
                  value={formData.gameNotes}
                  onChange={e =>
                    setFormData({ ...formData, gameNotes: e.target.value })
                  }
                  className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'
                  placeholder={getGameNotesPlaceholder(
                    formData.category
                  )}></textarea>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Tags (comma-separated)
                </label>
                <input
                  type='text'
                  value={formData.tags}
                  onChange={e =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500'
                  placeholder='e.g., tight-aggressive, bluff-catcher, fish'
                />
              </div>

              <div className='flex justify-end space-x-4 pt-4'>
                <button
                  type='button'
                  onClick={resetForm}
                  className='px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
                  {editingNote ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setNoteToDelete(null);
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title='Delete Note'
        message={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Pokerdex;
