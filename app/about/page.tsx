'use client'

import LeftToRight from "@/components/animated/left-to-right";
import RightToLeft from "@/components/animated/right-to-left";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Spotlight } from "@/components/ui/Spotlight";
import { FaJs, FaReact, FaNode, FaPhp, FaLaravel, FaVuejs, FaGithub, FaGitAlt, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs } from 'react-icons/si';

export default function About() {
    return (
        <div className="h-screen relative flex justify-center items-center overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-auto md:grid-rows-7 gap-4 w-full max-w-4xl text-white">
                <div className="bg-black-200 rounded-md row-span-3 md:row-span-3 h-full flex flex-col justify-start items-start p-4">
                    <h2 className="font-semibold text-2xl mb-4">Experience</h2>
                    <ul>
                        <li>DICT Region-IX - Intern (300 hours)</li>
                        <li>- Full-Stack Web Developer</li>
                        <li>- Developed a QR Event Attendance Management</li>
                        <li>- Tech Support</li>
                    </ul>
                </div>
                <div className="h-40 row-span-2 col-start-1 md:col-start-2 row-start-2 md:row-start-3 hidden md:flex justify-center items-center">
                    <BackgroundGradient className="rounded-[22px] p-[60px] bg-black-200">
                    <span className="font-semibold text-3xl">About Me</span>
                    </BackgroundGradient>
                </div>
                <RightToLeft>
                    <div className="hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 h-full rounded-md col-start-1 row-start-4 md:col-start-1 md:row-start-4 md:flex justify-center items-center">
                        <h2 className="font-semibold text-2xl">Please Hire me 😭</h2>
                    </div>
                </RightToLeft>
                <div className="bg-black-200 rounded-md col-span-1 md:col-span-2 row-span-3 col-start-1 row-start-5 md:row-start-5 flex flex-col justify-start items-start p-4">
                    <h2 className="font-semibold text-2xl mb-4">Education</h2>
                    <ul>
                        <li className="text-lg md:text-xl">Ateneo de Zamboanga University (2020-2024)</li>
                        <li className="text-sm md:text-lg">Bachelor's of Science in Information Technology</li>
                        <li className="text-sm md:text-lg">- Cum Laude</li>
                        <li className="text-lg md:text-xl">Ateneo de Zamboanga University SHS (2018-2020)</li>
                        <li className="text-sm md:text-lg">STEM Strand</li>
                    </ul>
                </div>
                <div className="bg-black-200 rounded-md row-span-3 md:row-span-4 col-start-2 md:col-start-3 row-start-5 md:row-start-4 flex flex-col justify-start items-start p-4">
                    <h2 className="font-semibold text-2xl mb-4">Tech Stack</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {Stack.map((item) => (
                        <div key={item.id} className="flex flex-col items-center">
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                        </div>
                        ))}
                    </div>
                </div>
                <LeftToRight>
                    <div className="hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 h-full rounded-md col-start-1 row-start-7 md:col-start-3 md:row-start-3 md:flex justify-center items-center">
                        <h2 className="font-semibold text-2xl">Please Hire me 😭</h2>
                    </div>
                </LeftToRight>
                <div className="bg-black-200 rounded-md col-span-1 md:col-span-2 row-span-3 md:row-span-2 col-start-1 row-start-1 md:row-start-1 md:col-start-2 p-4 flex flex-col justify-start items-start">
                    <h2 className="font-semibold text-2xl mb-4">Why hire me?</h2>
                    <div>
                        <p className="text-sm">
                            I am a fresh graduate actively seeking web developer positions. I primarily work with Next.js, but I am also proficient in the range of my Tech Stack. I am passionate about creating efficient, scalable, and user-friendly web applications.
                        </p>
                    </div>
                </div>
            </div>
        
        </div>
    );
}


const Stack = [
    {
        id: 1,
        name: 'HTML5',
        icon: <FaHtml5 className="text-white w-7 h-7 animate-iconFloat"/>,
    },
    {
        id: 2,
        name: "CSS3",
        icon: <FaCss3Alt className="text-white w-7 h-7 animate-iconFloat"/>
    },
    {
        id: 3,
        name: "JavaScript",
        icon: <FaJs className="text-white w-7 h-7 animate-iconFloat"/>
    },
    {
        id: 4,
        name: "TypeScript",
        icon: <SiTypescript className="text-white w-7 h-7 animate-iconFloat"/>,
    },
    {
        id: 5,
        name: "React",
        icon: <FaReact className="text-white w-7 h-7 animate-iconFloat"/>
    },
    {
        id: 6,
        name: "Node.js",
        icon: <FaNode className="text-white w-7 h-7 animate-iconFloat"/>
    },
    {
        id: 7,
        name: "Next.js",
        icon: <SiNextdotjs className="text-white w-7 h-7 animate-iconFloat"/>
    },
    {
        id: 8,
        name: "PHP",
        icon: <FaPhp className="text-white w-7 h-7 animate-iconFloat"/>
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
        name: "GitHub",
        icon: <FaGithub className="text-white w-7 h-7 animate-iconFloat"/>
    },
    {
        id: 12,
        name: "Git",
        icon: <FaGitAlt className="text-white w-7 h-7 animate-iconFloat" />

    },

];