
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stack } from '@/lib/data';

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
              <h3 className="text-xl font-semibold my-4 mt-4">DICT Region-IX - Intern (300 hours)</h3>
              <ul className="list-disc list-inside space-y-1  pl-4">
                <li><strong className="font-medium ">Role:</strong> Full-Stack Web Developer</li>
                <li><strong className="font-medium ">Project:</strong> Developed a QR Event Attendance Management system</li>
                <li><strong className="font-medium ">Additional Duties:</strong> Tech Support</li>
              </ul>        
          </TabsContent>
          <TabsContent value='education'>
              <h3 className="text-xl font-semibold my-4 mt-4">Ateneo de Zamboanga University (2020-2024)</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li ><strong className="font-medium">Degree:</strong> Bachelor's of Science in Information Technology</li>
                <li ><strong className="font-medium">Honors:</strong> Cum Laude</li>
              </ul>
              <h3 className="text-xl font-semibold my-4 mt-4">Ateneo de Zamboanga University SHS (2018-2020)</h3>
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


