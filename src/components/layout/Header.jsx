import React from 'react'
import { Link } from 'react-router-dom'
import { GiPokerHand } from 'react-icons/gi'

const Header = () => {
  return (
    <div className='navbar bg-slate-800 text-center justify-center'>
      <Link to='/' className='text-xl text-white font-bold py-4'>
        <GiPokerHand className='text-5xl mr-3' /> POKER CENTRAL COAST
      </Link>
    </div>
  )
}

export default Header
