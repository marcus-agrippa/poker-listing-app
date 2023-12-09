import React from 'react'
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-center p-6 bottom-0 w-full">
      <Link to="/contact">Game information needs updating? <span className="text-white font-bold">Contact Us</span></Link>
      <p className='mt-4'>Disclaimer: The information provided herein is for general guidance only. We do not guarantee its completeness or accuracy. For the most current and precise information, please consult the official sources or the respective organizers.</p>
      <p className='mt-4'>Poker Central Coast © {new Date().getFullYear()}</p>
    </footer>
  )
}

export default Footer