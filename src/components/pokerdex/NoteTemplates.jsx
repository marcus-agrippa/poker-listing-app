import React from 'react';
import { FiUser, FiEye, FiActivity, FiTrendingUp, FiTarget, FiMapPin, FiEdit3 } from 'react-icons/fi';

// Pre-built note templates for quick note creation
export const noteTemplates = {
  player: [
    {
      name: 'Tight-Aggressive Player',
      icon: FiUser,
      category: 'player',
      title: 'TAG Player Profile',
      playerObservations: 'Plays tight pre-flop, only enters pots with premium hands. Aggressive post-flop with strong holdings. Rarely bluffs without equity.',
      gameNotes: 'Respect their bets and raises. Don\'t try to bluff them often. Value bet thinly when you have it.',
      tags: ['tight-aggressive', 'TAG', 'solid-player']
    },
    {
      name: 'Loose-Aggressive Player',
      icon: FiUser,
      category: 'player',
      title: 'LAG Player Profile',
      playerObservations: 'Plays many hands, raises frequently. Aggressive on all streets. Uses position well. Can be difficult to read.',
      gameNotes: 'Tighten up against their aggression. Let them bluff off chips. Call down lighter with medium-strength hands.',
      tags: ['loose-aggressive', 'LAG', 'aggressive']
    },
    {
      name: 'Recreational/Fish',
      icon: FiUser,
      category: 'player',
      title: 'Recreational Player',
      playerObservations: 'Plays too many hands, calls too often. Makes basic strategic mistakes. Chases draws with poor odds.',
      gameNotes: 'Value bet wider range. Avoid fancy bluffs. Play straightforward poker. Isolate them when possible.',
      tags: ['fish', 'recreational', 'calling-station']
    }
  ],
  tells: [
    {
      name: 'Physical Tells Template',
      icon: FiEye,
      category: 'tells',
      title: 'Physical Tells Observed',
      playerObservations: 'When bluffing: [describe behavior - e.g., touches nose, looks away, talks more]\nWhen strong: [describe behavior - e.g., sits forward, quiet, steady hands]',
      gameNotes: 'Betting pattern tells: [e.g., quick bet = bluff, long tank then bet = value]\nOther observations: [timing tells, chip handling, etc.]',
      tags: ['physical-tells', 'betting-patterns']
    }
  ],
  'playing-style': [
    {
      name: 'Position-Aware Player',
      icon: FiActivity,
      category: 'playing-style',
      title: 'Position-Based Play Style',
      playerObservations: 'Plays tighter from early position, wider from late position. Steals blinds frequently from button/cutoff. Respects UTG raises.',
      gameNotes: 'Defend blinds selectively against their steals. Be careful when they raise from early position.',
      tags: ['positional-play', 'steals-blinds', 'aware']
    },
    {
      name: 'ABC Poker Player',
      icon: FiActivity,
      category: 'playing-style',
      title: 'ABC/Straightforward Style',
      playerObservations: 'Plays textbook poker. Predictable but solid. Bets for value, checks when weak. Easy to put on a range.',
      gameNotes: 'Exploit their predictability. Bluff when they show weakness. Fold when they show strength.',
      tags: ['ABC-poker', 'predictable', 'straightforward']
    }
  ],
  tendencies: [
    {
      name: 'Pre-flop Tendencies',
      icon: FiTrendingUp,
      category: 'tendencies',
      title: 'Pre-flop Behavior Pattern',
      playerObservations: 'Opening range: [tight/wide]\n3-bet frequency: [rarely/sometimes/often]\nFold to 3-bet: [high/medium/low]\nCalls vs raises: [prefers calling/prefers raising]',
      gameNotes: 'Adjust strategy: [how to exploit their tendencies]',
      tags: ['pre-flop', 'tendencies']
    },
    {
      name: 'Post-flop Tendencies',
      icon: FiTrendingUp,
      category: 'tendencies',
      title: 'Post-flop Behavior Pattern',
      playerObservations: 'C-bet frequency: [always/selective/rarely]\nBarrel frequency: [multi-barrels/single barrel/gives up]\nCheck-raise frequency: [often/sometimes/never]\nCall vs fold: [sticky/fit-or-fold]',
      gameNotes: 'Exploit opportunities: [specific plays to make against them]',
      tags: ['post-flop', 'tendencies']
    }
  ],
  strategy: [
    {
      name: 'Counter-Strategy Notes',
      icon: FiTarget,
      category: 'strategy',
      title: 'Strategy to Beat This Player',
      playerObservations: 'Their weaknesses: [list exploitable tendencies]\nTheir strengths: [what to avoid]\nTable dynamics: [how they interact with other players]',
      gameNotes: 'Optimal strategy:\n- Pre-flop: [adjustments]\n- Post-flop: [adjustments]\n- In position: [specific plays]\n- Out of position: [specific plays]',
      tags: ['strategy', 'counter-strategy']
    }
  ],
  venue: [
    {
      name: 'Venue Profile',
      icon: FiMapPin,
      category: 'venue',
      title: 'Venue Information',
      playerObservations: 'Game type: [cash/tournament/both]\nTypical stakes: [ranges]\nPlayer pool: [recreational/mixed/tough]\nBest times to play: [days/times when games are softest]',
      gameNotes: 'Venue details:\n- Rake structure: [amount and cap]\n- Dealers: [quality/speed]\n- Atmosphere: [comfort, noise level]\n- Notes: [parking, food, etc.]',
      tags: ['venue-info']
    }
  ],
  general: [
    {
      name: 'Session Notes',
      icon: FiEdit3,
      category: 'general',
      title: 'General Session Notes',
      playerObservations: 'Key hands played:\n- Hand 1: [description]\n- Hand 2: [description]\n\nMistakes made:\n- [what went wrong and why]',
      gameNotes: 'Lessons learned:\n- [takeaways from this session]\n\nAreas to study:\n- [topics to review]',
      tags: ['session-notes', 'review']
    }
  ]
};

const NoteTemplates = ({ onSelectTemplate, onClose }) => {
  const categories = [
    { value: 'player', label: '👤 Player Profiles', icon: FiUser },
    { value: 'tells', label: '👁️ Tells & Reads', icon: FiEye },
    { value: 'playing-style', label: '🎲 Playing Styles', icon: FiActivity },
    { value: 'tendencies', label: '📊 Player Tendencies', icon: FiTrendingUp },
    { value: 'strategy', label: '🎯 Strategy Notes', icon: FiTarget },
    { value: 'venue', label: '🏢 Venue Notes', icon: FiMapPin },
    { value: 'general', label: '📝 General Notes', icon: FiEdit3 },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Choose a Template</h3>
        <p className="text-gray-400 text-sm">Start with a pre-built template or create from scratch</p>
      </div>

      {categories.map(category => {
        const templates = noteTemplates[category.value];
        if (!templates || templates.length === 0) return null;

        const CategoryIcon = category.icon;

        return (
          <div key={category.value} className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <CategoryIcon className="mr-2 text-blue-400" />
              {category.label}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {templates.map((template, index) => {
                const TemplateIcon = template.icon;
                return (
                  <button
                    key={index}
                    onClick={() => onSelectTemplate(template)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-600 hover:border-blue-500"
                  >
                    <div className="flex items-center">
                      <TemplateIcon className="mr-2 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-white">{template.name}</div>
                        <div className="text-xs text-gray-400">Click to use this template</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex justify-center gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSelectTemplate(null)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create Blank Note
        </button>
      </div>
    </div>
  );
};

export default NoteTemplates;
