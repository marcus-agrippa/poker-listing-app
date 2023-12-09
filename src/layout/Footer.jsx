import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-center p-6 bottom-0 w-full">
      <p>Poker Central Coast © {new Date().getFullYear()}</p><br></br>
      <p>
        Disclaimer: The information provided herein is for general guidance only. We do not guarantee its completeness or accuracy. For the most current and precise information, please consult the official sources or the respective organizers.
      </p>
    </footer>
  )
}

export default Footer