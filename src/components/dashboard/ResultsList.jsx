import React from 'react';
import { FiTrash2, FiEdit } from 'react-icons/fi';

const ResultsList = ({ results, onDelete, onEdit }) => {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No results recorded yet. Add your first game result!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div>
      {/* Desktop Table View - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="text-white">
              <th>Date</th>
              <th>Game</th>
              <th>Venue</th>
              <th>Position</th>
              <th>Players</th>
              <th>Buy-in</th>
              <th>Winnings</th>
              <th>Net</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const net = (result.winnings || 0) - (result.buyIn || 0);
              const netClass = net > 0 ? 'text-green-400' : net < 0 ? 'text-red-400' : 'text-gray-400';
              
              return (
                <tr key={result.id}>
                  <td className="text-white">{formatDate(result.date)}</td>
                  <td className="text-white font-medium">{result.gameName}</td>
                  <td className="text-gray-300">{result.venue}</td>
                  <td className="text-white">
                    {result.position && result.totalPlayers 
                      ? `${result.position}/${result.totalPlayers}` 
                      : result.position || 'Unknown'}
                  </td>
                  <td className="text-gray-300">{result.totalPlayers || 'Unknown'}</td>
                  <td className="text-gray-300">${result.buyIn || 0}</td>
                  <td className="text-gray-300">${result.winnings || 0}</td>
                  <td className={netClass}>
                    {net > 0 ? '+' : ''}${net.toFixed(2)}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(result)}
                        className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
                        title="Edit result"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => onDelete(result)}
                        className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                        title="Delete result"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - shown only on mobile */}
      <div className="md:hidden space-y-4">
        {results.map((result) => {
          const net = (result.winnings || 0) - (result.buyIn || 0);
          const netClass = net > 0 ? 'text-green-400' : net < 0 ? 'text-red-400' : 'text-gray-400';
          
          return (
            <div key={result.id} className="card bg-slate-700 shadow-lg">
              <div className="card-body p-4">
                <div className="mb-3">
                  <h3 className="text-white font-medium text-sm">{result.gameName}</h3>
                  <p className="text-gray-400 text-xs">{result.venue}</p>
                </div>
                
                <div className="text-xs text-gray-400 mb-3">{formatDate(result.date)}</div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-gray-400 text-xs">Position</div>
                    <div className="text-white font-medium">
                      {result.position && result.totalPlayers 
                        ? `${result.position}/${result.totalPlayers}` 
                        : result.position || 'Unknown'}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-gray-400 text-xs">Buy-in</div>
                    <div className="text-white">${result.buyIn || 0}</div>
                  </div>
                  
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-gray-400 text-xs">Winnings</div>
                    <div className="text-white">${result.winnings || 0}</div>
                  </div>
                  
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-gray-400 text-xs">Net</div>
                    <div className={`font-medium ${netClass}`}>
                      {net > 0 ? '+' : ''}${net.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {result.comments && (
                  <div className="mt-3 p-2 bg-slate-800 rounded">
                    <div className="text-gray-400 text-xs mb-1">Comments</div>
                    <div className="text-gray-300 text-xs">{result.comments}</div>
                  </div>
                )}
                
                {/* Action buttons - 50% width side by side at bottom */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => onEdit(result)}
                    className="btn btn-sm btn-outline text-gray-400 hover:text-white hover:border-white"
                    title="Edit result"
                  >
                    <FiEdit className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(result)}
                    className="btn btn-sm btn-outline btn-error text-red-400 hover:text-white"
                    title="Delete result"
                  >
                    <FiTrash2 className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {results.length > 0 && results[0].comments && (
        <div className="mt-4 hidden md:block">
          <div className="collapse collapse-arrow bg-slate-700">
            <input type="checkbox" />
            <div className="collapse-title text-white font-medium">
              View Comments for Latest Result
            </div>
            <div className="collapse-content">
              <p className="text-gray-300">{results[0].comments}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;