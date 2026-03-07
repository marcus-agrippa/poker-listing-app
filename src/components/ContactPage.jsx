import React, { useState, useEffect } from 'react';
import {
  isCentralCoast,
  isNewcastle,
  isBallarat,
  isWollongong,
  isTownsville,
  isSunshineCoast,
  isPerth,
  isGeelong,
  isGoldCoast,
  isBrisbane,
  isSydney,
  isMelbourne,
  isAdelaide,
  isCanberra,
} from '../hostname';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [region, setRegion] = useState('');

  // Auto-detect region based on hostname
  useEffect(() => {
    if (isCentralCoast) setRegion('Central Coast');
    else if (isNewcastle) setRegion('Newcastle');
    else if (isBallarat) setRegion('Ballarat');
    else if (isWollongong) setRegion('Wollongong');
    else if (isTownsville) setRegion('Townsville');
    else if (isSunshineCoast) setRegion('Sunshine Coast');
    else if (isPerth) setRegion('Perth');
    else if (isGeelong) setRegion('Geelong');
    else if (isGoldCoast) setRegion('Gold Coast');
    else if (isBrisbane) setRegion('Brisbane');
    else if (isSydney) setRegion('Sydney');
    else if (isMelbourne) setRegion('Melbourne');
    else if (isAdelaide) setRegion('Adelaide');
    else if (isCanberra) setRegion('Canberra');
    else setRegion('Unknown');
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    const myForm = event.target;
    const formData = new FormData(myForm);

    try {
      await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      setSubmitted(true);
      myForm.reset();
    } catch (error) {
      alert(error);
      setSubmitted(false);
    }
  };

  return (
    <div className='container mx-auto p-4 mt-6 mb-6'>
      <h1 className='text-3xl text-white font-bold text-center mb-6'>
        Contact Us
      </h1>
      {!submitted ? (
        <form
          name='contact'
          onSubmit={handleSubmit}
          className='max-w-lg mx-auto'>
          <input type='hidden' name='form-name' value='contact' />
          <input type='hidden' name='region' value={region} />

          <div className='mb-4'>
            <label
              htmlFor='name'
              className='block mb-2 text-md text-white font-medium text-gray-700'>
              Name:
            </label>
            <input
              type='text'
              name='name'
              id='name'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='contactEmail'
              className='block mb-2 text-md text-white font-medium text-gray-700'>
              Email (optional):
            </label>
            <input
              type='email'
              name='contactEmail'
              id='contactEmail'
              placeholder='you@example.com'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='game'
              className='block mb-2 text-md text-white font-medium text-gray-700'>
              Game:
            </label>
            <textarea
              name='game'
              id='game'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'></textarea>
          </div>

          <div className='mb-4'>
            <label
              htmlFor='message'
              className='block mb-2 text-md text-white font-medium text-gray-700'>
              Message:
            </label>
            <textarea
              name='message'
              id='message'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              rows='3'></textarea>
          </div>

          <div className='text-center'>
            <button
              type='submit'
              className='btn bg-blue-500 border-blue-500 hover:bg-blue-400 hover:border-blue-400 btn-primary w-full text-white'>
              Send
            </button>
          </div>
        </form>
      ) : (
        <div className='text-center text-green-300'>
          <p>Thank you for contacting us. We will get back to you soon!</p>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
