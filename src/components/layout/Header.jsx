import React from 'react';
import { Link } from 'react-router-dom';
import { GiPokerHand } from 'react-icons/gi';
import { hostname } from '../../hostname';

const Header = () => {
  const title =
    hostname === 'pokercentralcoast.com'
      ? 'POKER CENTRAL COAST'
      : hostname === 'pokernewcastle.com'
      ? 'POKER NEWCASTLE'
      : hostname === 'pokerballarat.com'
      ? 'POKER BALLARAT'
      : hostname === 'pokerwollongong.com'
      ? 'POKER WOLLONGONG'
      : hostname === 'pokertownsville.com'
      ? 'POKER TOWNSVILLE'
      : hostname === 'pokersunshinecoast.com'
      ? 'POKER SUNSHINE COAST'
      : hostname === 'pokerperth.com'
      ? 'POKER PERTH'
      : hostname === 'pokergeelong.com'
      ? 'POKER GEELONG'
      : hostname === 'pokergoldcoast.com'
      ? 'POKER GOLD COAST'
      : 'POKER';

  return (
    <div className='navbar bg-slate-800 text-center justify-center'>
      <Link to='/' className='text-xl text-white font-bold py-4'>
        <GiPokerHand className='text-5xl mr-3' /> {title}
      </Link>
    </div>
  );
};

export default Header;
