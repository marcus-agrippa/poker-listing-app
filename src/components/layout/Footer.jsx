import React from 'react';
import { Link } from 'react-router-dom';
import { hostname } from '../../hostname';

const Footer = () => {
  const copyright =
    hostname === 'pokercentralcoast.com'
      ? 'PokerCentralCoast'
      : hostname === 'pokernewcastle.com'
      ? 'PokerNewcastle'
      : hostname === 'pokerballarat.com'
      ? 'PokerBallarat'
      : hostname === 'pokerwollongong.com'
      ? 'PokerWollongong'
      : hostname === 'pokertownsville.com'
      ? 'PokerTownsville'
      : hostname === 'pokersunshinecoast.com'
      ? 'PokerSunshineCoast'
      : hostname === 'pokerperth.com'
      ? 'PokerPerth'
      : hostname === 'pokergeelong.com'
      ? 'PokerGeelong'
      : hostname === 'pokergoldcoast.com'
      ? 'PokerGoldCoast'
      : 'Poker';

  return (
    <footer className='bg-slate-800 text-center p-6 bottom-0 w-full'>
      <div className='mb-4'>
        <p className='text-white text-sm mb-5'>
          Like the app? Help me keep games up-to-date and add more cool
          features!
        </p>
        <a
          href='https://buymeacoffee.com/billypilgrim'
          target='_blank'
          rel='noopener noreferrer'>
          <button className='bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded'>
            Buy me a coffee ☕
          </button>
        </a>
      </div>
      <p className='text-white text-sm'>
        Game information needs updating? Register a game? Something else?
      </p>
      <Link to='/contact'>
        <p className='font-bold text-blue-500 hover:text-blue-400 mt-4'>
          Contact Us
        </p>
      </Link>
      <p className='text-xs mt-4 text-neutral-400'>
        Disclaimer: The information provided herein is for general guidance
        only. We do not guarantee its completeness or accuracy.<br></br> For the
        most current and precise information, please consult the official
        sources or the respective organizers.<br></br> Each game is linked to
        relevant social media pages or websites for further information.
      </p>
      <p className='text-xs mt-4 text-neutral-400'>
        {copyright} © {new Date().getFullYear()}
      </p>
    </footer>
  );
};

export default Footer;
