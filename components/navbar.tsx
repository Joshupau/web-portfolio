import React from 'react'

function Navbar() {
  return (
    <div className='px-[4rem] pt-4'>
        <nav className='grid grid-cols-2 justify-items-center'>
            <div>
                <p className='text-bold text-3xl text-white'>JDG.</p>
            </div>
            <div className='text-white'>
                ICONS
            </div>
        </nav>
    </div>
  )
}

export default Navbar