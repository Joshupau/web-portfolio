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
            className='hidden lg:flex self-start'
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
                height={675}
                className='rounded-lg aspect-[2/3] object-cover'
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
                Backend & Fintech Software Developer with proven expertise in building scalable Node.js applications, double-entry accounting systems, and Web3 integrations. Specialized in RESTful APIs, real-time communication, and payment processing with a strong focus on clean architecture and high-concurrency systems.
                </p>
                <p className='mt-4'>
                I'm passionate about solving complex financial and technical challenges while mentoring others in full-stack development. Outside of work, I enjoy online gaming, anime, and spending time with family and friends.
                </p>
                
                <div className='mt-6 grid grid-cols-2 gap-6 text-sm'>
                  <div className='flex flex-col space-y-2'>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>RESIDENCE</span>
                      <span>Zamboanga City, Philippines</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>EMAIL</span>
                      <span className='break-all'>JoshuaDG511@gmail.com</span>
                    </div>
                  </div>
                  <div className='flex flex-col space-y-2'>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>PHONE</span>
                      <span>+63 928 471 2602</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>WORK</span>
                      <span>Available</span>
                    </div>
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