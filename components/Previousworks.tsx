"use client"

import { PinContainer } from '@/components/ui/3d-pin';
import React from 'react'
import { fadeInanimationVariant, projects } from '@/lib/data';
import { motion } from 'framer-motion';
  function Previousworks() {
    return (
      <div className=""> 
        <div className='grid auto-cols-[70%] align-center justify-center grid-flow-row sm:grid-cols-2 gap-16'>
          {projects.map(({ id, title, des, img, iconLists, link }, index) => (
            <motion.div 
            key={id} 
            className='text-white'
            variants={fadeInanimationVariant}
            initial="initial"
            whileInView="animate"
            viewport={{
               once: true,
            }}
            custom={index}
            >
              <PinContainer title={link} href={link}>
                <div className='relative flex items-center justify-center sm:w-60 w-[70vw] overflow-hidden h-[15vh] lg:w-72 md:h-[15vh]'>
                  <img
                    src={img}
                    alt={title}
                    className='z-10 absolute bottom-0'
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
                        <img src={icon} alt={icon} className='p-2' />
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