'use client'

import { useState, useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';

import { FaArrowRight, FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSectionInView } from '@/lib/hooks';


function Contact() {
  const [state, handleSubmit] = useForm("xjkbzdye");
  const [submitted, setSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { ref } = useSectionInView("Contact");


  const [contact, setContact] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };


  const resetForm = () => {
    setContact({
      email: '',
      subject: '',
      message: '',
    });
  }

  useEffect(() => {
    if (state.succeeded) {
      setSubmitted(true);
      resetForm();
      window.location.reload();
    }
  }, [state.succeeded]);

  return (
  <footer
  ref={ref} 
  id='contact'
  >
    <div className='my-20 pb-20 flex items-center justify-center'>
      <div className='flex flex-col w-full max-w-[700px]'>
        <motion.h2 
        className='text-5xl font-bold text-center my-8'
        initial={{ x: 300, opacity: 0}}
        whileInView={{ x: 0, opacity: 1}}
        transition={{ ease: "easeInOut", duration: 2}}
        viewport={{
          once: true,
        }}
        >
          Don&apos;t Hesitate to <span className="bg-clip-text text-transparent bg-yellow-200">
            Reach Out
          </span>
        </motion.h2>

        <form onSubmit={handleSubmit}>
             <motion.div 
             className='grid grid-cols-2 gap-4'
             initial={{ y: 100, opacity: 0}}
             whileInView={{ y: 0, opacity: 1}}
             transition={{ ease: "easeInOut", duration: 2}}
             viewport={{
              once: true,
             }}
             >
                 <div>
            <input
             id="email"
             type="email" 
             name="email"
             placeholder='Email'
             onChange={(e)=> setContact((prevMessage) => ({ ...prevMessage, email: e.target.value}))}
             className='border-2 w-full bg-transparent rounded-lg p-2 focus:outline-none 
             focus:border-white-200'
             />
            <ValidationError 
             prefix="Email" 
             field="email"
             errors={state.errors}
             />
           </div>
           <div>
            <input
             id="subject"
             type="subject" 
             name="subject"
             onChange={(e)=> setContact((prevMessage) => ({ ...prevMessage, subject: e.target.value}))}
             placeholder='Subject'
             className='border-2 w-full bg-transparent rounded-lg p-2 focus:outline-none 
             focus:border-white-200'
             />
            <ValidationError 
             prefix="subject" 
             field="subject"
             errors={state.errors}
             />
           </div>
      </motion.div>
      <motion.div 
      className='mt-4'
      initial={{ y: 100, opacity: 0}}
      whileInView={{ y: 0, opacity: 1}}
      transition={{ ease: "easeInOut", duration: 2}}
      viewport={{
      once: true,
      }}
      >         
       <textarea
           id="message"
           name="message"
           onChange={(e)=> setContact((prevMessage) => ({ ...prevMessage, message: e.target.value}))}
           placeholder='Message'
           className='bg-transparent border-2 rounded-lg w-full my-2 min-h-[100px] p-2 focus:outline-none 
           focus:border-white-200'
           />
       <ValidationError 
           prefix="Message" 
           field="message"
           errors={state.errors}
           />
  </motion.div>

          <motion.div 
          className="mt-5 relative"
          initial={{ x: -300, opacity: 0}}
          whileInView={{ x: 0, opacity: 1}}
          transition={{ ease: "easeInOut", duration: 2}}
          viewport={{
            once: true,
          }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }} // Scale animation on hover
              className={`p-2 rounded-full border border-white/50 max-w-[170px] px-12 transition-all duration-300 flex items-center justify-center overflow-hidden hover:border-accent group ${isHovered ? 'icon-only' : ''}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              type="submit"
              disabled={submitted}
              >
              {isHovered ? (
                <FaArrowRight className='h-6 w-8 ' color='yellow'/>
              ) : (
                "Submit"
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
    <div className='flex mt-16 md:flex-row flex-col justify-between items-center'>
        <p className='md:text-base mb-1 md:mb-0 text-sm md:font-normal font-light'>
          Copyright © 2024 Joshua
        </p>
        <div className='mb-2 flex items-center md:gap-3 gap-6'>
        <Link className='w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300' href='https://www.linkedin.com/in/joshua-paul-de-guzman/' passHref>
            <FaLinkedin className='text-2xl hover:color-blue-700 transition-colors duration-300' />
        </Link>
        <Link className='w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300' href='https://github.com/Joshupau' passHref>
            <FaGithub className='text-2xl hover:text-lightyellow transition-colors duration-300' />
        </Link>
        <Link className='w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300' href='https://www.facebook.com/WangWangJoshu/' passHref>
            <FaFacebook className='text-2xl hover:text-lightyellow transition-colors duration-300' />
        </Link>
        </div>
    </div>
  </footer>
  );
}

export default Contact;