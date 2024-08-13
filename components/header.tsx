'use client'

import React from 'react'
import Link from 'next/link'
import { FaLinkedin, FaGithub, FaFacebook } from 'react-icons/fa'
import TopToBottom from './animated/top-to-bottom'

function Header() {
  return (
   <TopToBottom>

   <div className='absolute top-0 left-0 w-full z-50 px-[4rem] pt-4 grid grid-cols-2 justify-items-center bg-transparent'>
      <div>
        <Link href='/'>
          <h1 className='text-4xl font-semibold text-white'>JDG<span className='text-lightyellow'>.</span></h1>
        </Link>
      </div>
      <div className='flex space-x-4 pt-2 text-white mx-auto'>
        <Link href='https://www.linkedin.com/in/joshua-paul-de-guzman/' passHref>
            <FaLinkedin className='text-2xl hover:color-blue-700 transition-colors duration-300' />
        </Link>
        <Link href='https://github.com/Joshupau' passHref>
            <FaGithub className='text-2xl hover:text-lightyellow transition-colors duration-300' />
        </Link>
        <Link href='https://www.facebook.com/WangWangJoshu/' passHref>
            <FaFacebook className='text-2xl hover:text-lightyellow transition-colors duration-300' />
        </Link>
      </div>
    </div>
   </TopToBottom>
  )
}

export default Header
