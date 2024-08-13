import LeftToRight from "@/components/animated/left-to-right";
import RightToLeft from "@/components/animated/right-to-left";
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
                <div className="bg-black-200 rounded-md h-40 row-span-2 col-start-1 md:col-start-2 row-start-2 md:row-start-3 hidden md:flex justify-center items-center">
                    <span className="font-semibold text-2xl">About Me</span>
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
                        <div className="flex flex-col items-center">
                            <FaHtml5 className="text-white w-7 h-7" />
                            <span className="text-sm">HTML5</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaCss3Alt className="text-white w-7 h-7" />
                            <span className="text-sm">CSS3</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaJs className="text-white w-7 h-7" />
                            <span className="text-sm">JavaScript</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <SiTypescript className="text-white w-7 h-7" />
                            <span className="text-sm">TypeScript</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaReact className="text-white w-7 h-7" />
                            <span className="text-sm">React</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaNode className="text-white w-7 h-7" />
                            <span className="text-sm">Node.js</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <SiNextdotjs className="text-white w-7 h-7" />
                            <span className="text-sm">Next.js</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaPhp className="text-white w-7 h-7" />
                            <span className="text-sm">PHP</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaLaravel className="text-white w-7 h-7" />
                            <span className="text-sm">Laravel</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaVuejs className="text-white w-7 h-7" />
                            <span className="text-sm">Vue.js</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaGithub className="text-white w-7 h-7" />
                            <span className="text-sm">GitHub</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaGitAlt className="text-white w-7 h-7" />
                            <span className="text-sm">Git</span>
                        </div>
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
