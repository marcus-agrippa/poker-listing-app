import React from 'react'
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-center p-6 bottom-0 w-full">
      <p className='text-white'>Game information needs updating?</p>
      <Link to="/contact"><p className='text-white font-bold'>Contact Us</p></Link>
      <p className='mt-4 text-neutral-400'>Disclaimer: The information provided herein is for general guidance only. We do not guarantee its completeness or accuracy. For the most current and precise information, please consult the official sources or the respective organizers.</p>
      <p className='mt-4 text-neutral-400'>Poker Central Coast © {new Date().getFullYear()}</p>
    </footer>
  )
}

export default Footer