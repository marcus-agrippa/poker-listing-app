import React from 'react'

const LastUpdated = ({ lastUpdated }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green"></div>
      <span className="ml-2 text-neutral-400">Last Updated: {lastUpdated}</span>
    </div>
  )
}

export default LastUpdated