
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaHome, FaUser, FaBriefcase, FaEnvelope, FaJs, FaReact, FaNode, FaPhp, FaLaravel, FaVuejs, FaGithub, FaGitAlt, FaHtml5, FaCss3Alt, FaDatabase  } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs, SiMongodb, SiSocketdotio } from 'react-icons/si';
import { motion } from 'framer-motion';

import { fadeInanimationVariant } from '@/lib/data';

function TabsAbout() {
  return (
    <div className='mt-4'>
        <Tabs defaultValue='techstack' className='w-full'>
          <TabsList>
          <TabsTrigger value='techstack'>Skills</TabsTrigger>
          <TabsTrigger value='experience'>Experience</TabsTrigger>
          <TabsTrigger value='education'>Education</TabsTrigger>
          </TabsList>
          <TabsContent value='experience'>
            <h3 className="text-xl font-semibold my-4 mt-4">Axcela PH | Junior Backend Developer</h3>
              <p className="text-sm text-white/70 mb-2">Nov 2024 - May 2026</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Built a double-entry accounting system with automated interest and loan-release flows.</li>
                <li>Developed scalable Node.js + TypeScript APIs/workers and real-time features with Socket.io.</li>
                <li>Integrated PayPal and Web3 modules, and maintained DB health with scripts and migrations.</li>
              </ul>

              <h3 className="text-xl font-semibold my-4 mt-4">DICT - RX 9 | Full Stack Developer Intern</h3>
              <p className="text-sm text-white/70 mb-2">Jun 2023 - Jul 2023</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Built an Attendance Management System using Laravel and Vue.js.</li>
              </ul>
          </TabsContent>
          <TabsContent value='education'>
              <h3 className="text-xl font-semibold my-4 mt-4">Ateneo de Zamboanga University</h3>
              <p className="text-sm text-white/70 mb-2">2020 - 2024</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li ><strong className="font-medium">Degree:</strong> Bachelor&apos;s of Science in Information Technology</li>
                <li ><strong className="font-medium">Honors:</strong> Cum Laude</li>
              </ul>
              <h3 className="text-xl font-semibold my-4 mt-4">Ateneo de Zamboanga University SHS</h3>
              <p className="text-sm text-white/70 mb-2">2018 - 2020</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
              <li ><strong className="font-medium">Strand:</strong> STEM Strand</li>
              </ul>
            </TabsContent>
          <TabsContent value='techstack'>
                    <div className=" mt-8 grid grid-cols-3 gap-4">
                        {Stack.map((item, index) => (
                        <motion.div 
                        key={item.id} 
                        className="flex flex-col items-center"
                         variants={fadeInanimationVariant}
                         initial="initial"
                         whileInView="animate"
                         viewport={{
                            once: true,
                         }}
                         custom={index}
                        >
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                        </motion.div>
                        ))}
                    </div>
          </TabsContent>
        </Tabs>
    </div>
  )
}

export default TabsAbout


export const Stack = [
  {
      id: 1,
      name: 'JavaScript',
      icon: <FaJs className="text-white w-7 h-7 animate-iconFloat"/>,
  },
  {
      id: 2,
      name: "TypeScript",
      icon: <SiTypescript className="text-white w-7 h-7 animate-iconFloat"/>,
  },
  {
      id: 3,
      name: "Node.js",
      icon: <FaNode className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 4,
      name: "React",
      icon: <FaReact className="text-white w-7 h-7 animate-iconFloat"/>,
  },
  {
      id: 5,
      name: "Next.js",
      icon: <SiNextdotjs className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 6,
      name: "MongoDB",
      icon: <SiMongodb className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 7,
      name: "Socket.io",
      icon: <SiSocketdotio className="text-white w-7 h-7 animate-iconFloat"/>,
  },
  {
      id: 8,
      name: "SQL",
      icon: <FaDatabase className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 9,
      name: "Laravel",
      icon: <FaLaravel className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 10,
      name: "Vue.js",
      icon: <FaVuejs className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 11,
      name: "PHP",
      icon: <FaPhp className="text-white w-7 h-7 animate-iconFloat"/>
  },
  {
      id: 12,
      name: "Git",
      icon: <FaGitAlt className="text-white w-7 h-7 animate-iconFloat" />
  },
];