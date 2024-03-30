// GamesPage.jsx
import React, { useState } from 'react'
import TabList from './TabList'
import GameList from './GameList'

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const GamesPage = () => {
  const [activeDay, setActiveDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  )

  return (
    <div className='mx-auto p-4 mt-8 max-w-screen-xl mb-8'>
      <TabList
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        daysOfWeek={daysOfWeek}
      />
      <GameList activeDay={activeDay} />
    </div>
  )
}

export default GamesPage
