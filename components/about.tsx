import React from 'react'
import Image from 'next/image'
import TabsAbout from './TabsAbout'
import { useSectionInView } from '@/lib/hooks';
import { motion } from 'framer-motion';

function About() {

  const { ref } = useSectionInView("About");

  return (
    <div 
    ref={ref} 
    id='about' 
    className='py-20 w-full flex items-center justify-center'
    >
        <div className='grid lg:grid-cols-2 gap-2'>
            <motion.div 
            className='hidden lg:flex'
            initial={{ y: 80, opacity: 0}}
            whileInView={{ y: 0, opacity: 1}}
            transition={{ ease: "easeInOut", duration: 1}}
            viewport={{
              once: true,
            }}
            >
            <Image
                src="/portfolio2.jpg"
                alt="Graduation Picture"
                width={450}
                height={400}
                className='rounded-lg'
                />
            </motion.div>
            <div>
              <motion.div
              initial={{ x: 100, opacity: 0}}
              whileInView={{ x: 0, opacity: 1}}
              transition={{ ease: "easeInOut", duration: 1}}
              viewport={{
                once: true,
              }}             
              >
                <h1 className='font-bold text-4xl'>About me</h1>
                <p className='mt-8'>
                I am a fresh graduate actively seeking web developer positions. I primarily work with Next.js, but I am also proficient in the range of my Tech Stack. I am passionate about creating efficient, scalable, and user-friendly web applications.
                </p>
                <p>
                <br/>     
                On my free time, I play online games, watch anime and spending quality time with my family, girlfriend and friends. 
                </p>
                
                <div className='mt-8 mb-2 grid grid-cols-1 lg:grid-cols-2'>
                  <div className='flex flex-row'>
                <div className='flex flex-col mr-2'>
                     <span className='font-semibold'>
                       RESIDENCE: 
                     </span>
                     <span className='font-semibold'>
                        EMAIL:{" "}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                    <span className='break-keep'>Zamboanga City, Philippines</span>
                    <span>
                      JoshuaDG511@gmail.com
                    </span>
                    </div>
                  </div>
                    <div className='flex flex-row-reverse place-content-start md:place-content-end'>
                    <span>
                      Available
                    </span>
                    <span className='font-semibold mr-12 md:mr-2'>
                     WORK:{" "}
                      </span>
                    </div>
                </div>
              </motion.div>
                <TabsAbout/>
            </div>
        </div>
    </div>
  )
}

export default About