"use client"

import { PinContainer } from '@/components/ui/3d-pin';
import React from 'react'
import { FaLocationArrow } from 'react-icons/fa';

const projects = [
    {
      id: 1,
      title: "Nursesync - Related Learning Experience - LMS",
      des: "Enhance nursing education in the Philippines with our cutting-edge Related Learning Experience LMS. Designed specifically for nursing students, this platform streamlines the learning process, offering interactive modules, real-time assessments, and comprehensive resources tailored to the Philippine healthcare system. Empower the next generation of nurses with a tool that bridges theory and practice seamlessly.",
      img: "/work11.png",
      iconLists: ["/next.svg", "/tail.svg", "/ts.svg","shadcn.jfif", "/fm.svg"],
      link: "https://rle-lms.vercel.app",
    },  
    {
      id: 2,
      title: "Project Title",
      des: "Simplify your video conferencing experience with Yoom. Seamlessly connect with colleagues and friends.",
      img: "/p2.svg",
      iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/stream.svg", "/c.svg"],
      link: "/ui.yoom.com",
    },
    {
      id: 3,
      title: "Project Title",
      des: "A REAL Software-as-a-Service app with AI features and a payments and credits system using the latest tech stack.",
      img: "/p3.svg",
      iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/three.svg", "/c.svg"],
      link: "/ui.aiimg.com",
    },
    {
      id: 4,
      title: "Project Title",
      des: "Recreated the Apple iPhone 15 Pro website, combining GSAP animations and Three.js 3D effects..",
      img: "/p4.svg",
      iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/three.svg", "/gsap.svg"],
      link: "/ui.apple.com",
    },
  ];

  function Previousworks() {
    return (
      <div className="overflow-x-auto sm:overflow-visible"> 
        <div className='grid auto-cols-[70%] grid-flow-col  sm:grid-flow-row sm:grid-cols-2 gap-8'>
          {projects.map(({ id, title, des, img, iconLists, link }) => (
            <div key={id} className='text-white'>
              <PinContainer title={link} href={link}>
                <div className='relative flex items-center justify-center sm:w-60 w-[45vw] overflow-hidden h-[12vh] lg:w-72 md:h-[15vh]'>
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
            </div>
          ))}
        </div>
      </div>
    )
  }
  

export default Previousworks