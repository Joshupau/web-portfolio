import { FaHome, FaUser, FaBriefcase, FaEnvelope, FaJs, FaReact, FaNode, FaPhp, FaLaravel, FaVuejs, FaGithub, FaGitAlt, FaHtml5, FaCss3Alt  } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs } from 'react-icons/si';

export const links = [
    {
      name: "Home",
      path: "/",
      icon: <FaHome size={22} />
    },
    {
      name: "About",
      path: "#about",
      icon: <FaUser size={20} />
    },
    {
      name: "Work",
      path: "#work",
      icon: <FaBriefcase size={20} />
    },
    {
      name: "Contact",
      path: "#contact",
      icon: <FaEnvelope size={20} />
    },
  ];

export const Stack = [
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

export const projects = [
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

  export const fadeInanimationVariant = {
    initial: {
        opacity: 0,
        y: 100,
    },
    animate: (index: number) => ({
        opacity: 1,
        y:0,
        transition: {
            delay: 0.10 * index,
        },
    })
};