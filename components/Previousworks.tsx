"use client"

import { PinContainer } from '@/components/ui/3d-pin';
import React from 'react'
import { fadeInanimationVariant, projects } from '@/lib/data';
import { motion } from 'framer-motion';
import Image from 'next/image';

  function Previousworks() {
    return (
      <div className="w-full"> 
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 place-items-center sm:place-items-stretch'>
          {projects.map(({ id, title, des, img, iconLists, link }, index) => (
            <motion.div 
            key={id} 
            className='text-white w-full flex justify-center sm:justify-start'
            variants={fadeInanimationVariant}
            initial="initial"
            whileInView="animate"
            viewport={{
               once: true,
            }}
            custom={index}
            >
              <PinContainer title={link} href={link} containerClassName='w-full flex justify-center sm:justify-start'>
                <div className='relative flex items-center justify-center w-[88vw] max-w-sm sm:w-60 sm:max-w-none lg:w-72 h-40 md:h-36 overflow-hidden'>
                  <Image
                    src={img}
                    alt={title}
                    className='z-10 absolute bottom-0 h-auto w-full object-contain'
                    width={288}
                    height={108}
                  />
                </div>
                <h1 className='font-bold lg:text-2xl md:text-xl text-base line-clamp-1'>
                  {title}
                </h1>
                <p className='lg:font-normal font-light text-sm line-clamp-2'>
                  {des}
                </p>
                <div className='flex items-center justify-between mt-7 mb-3'>
                  <div className='flex items-center'>
                    {iconLists.map((icon, index) => (
                      <div key={icon} className='border border-white/[0.2] rounded-full bg-black lg:w-10 lg:h-10 w-8 h-8 flex justify-center items-center'
                       style={{transform: `translateX(-${5 * index * 2}px)`}}
                      >
                        <Image src={icon} alt={icon} className='p-2' width={40} height={40} />
                      </div>
                    ))}
                  </div>
   
                </div>
              </PinContainer>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }
  

export default Previousworks