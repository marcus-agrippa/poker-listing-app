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
