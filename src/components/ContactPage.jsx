import React from 'react'

const ContactPage = () => {
  return (
    <div className="container mx-auto p-4">
    <h1 className="text-3xl text-white font-bold text-center mb-6">Contact Us</h1>
        <form name="contact" method="POST" data-netlify="true" className="max-w-lg mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 text-white text-md font-medium text-gray-700">Your Name:</label>
            <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          <div className="mb-4">
            <label htmlFor="contactEmail" className="block mb-2 text-white text-md font-medium text-gray-700">Your Email (optional):</label>
            <input type="email" name="contactEmail" id="contactEmail" placeholder="you@example.com" className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          <div className="mb-4">
            <label htmlFor="game" className="block mb-2 text-white text-md font-medium text-gray-700">Game:</label>
            <textarea name="game" id="game" className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" rows="4"></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block mb-2 text-white text-md font-medium text-gray-700">Message:</label>
            <textarea name="message" id="message" className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"></textarea>
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-primary">Send</button>
          </div>
        </form>
      </div>
  )
}

export default ContactPage


