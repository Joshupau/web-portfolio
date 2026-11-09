// Everything the site says lives here. Edit this file, not the components.

export const person = {
  name: "Joshua Paul De Guzman",
  location: "Zamboanga City, Philippines",
  github: "https://github.com/Joshupau",
  linkedin: "https://www.linkedin.com/in/joshua-paul-de-guzman/",
  resume: "/Resume.pdf",
};

export const intro = {
  headline: "I build fintech software with AI in the loop.",
  body: "Full-stack developer in Zamboanga City. I use AI tools every day to design, write and test software, and I check what they produce with tests. I’ve shipped finance systems this way: a double-entry accounting backend with loan schedules, and an offline-first finance app with its own AI features.",
};

export const focus = [
  {
    label: "Now",
    title: "Software development, with AI as a working tool",
    points: [
      "Plan and build features with AI assistants, then check the result with tests I write and run myself.",
      "Fico has offline test scripts for its query engine, sync logic and parsers, so AI-written changes get verified, not trusted.",
      "Built a read-only MCP server so an AI assistant can answer questions from my real finance data.",
    ],
  },
  {
    label: "Next",
    title: "Upskilling in AI",
    points: [
      "Building LLM features properly: prompts, structured output, evaluation and cost control.",
      "Agents and tool use beyond what I have done with MCP so far.",
      "Open to roles where AI is part of how the team builds, and where I can keep learning it.",
    ],
  },
];

export type Section = {
  heading: string;
  body: string[];
  figure?: "architecture" | { src: string; alt: string; width: number; height: number; caption: string };
};

export type Project = {
  slug: string;
  name: string;
  year: string;
  summary: string;
  lead: string;
  role: string;
  stack: string[];
  links: { label: string; href: string }[];
  sections: Section[];
};

export const projects: Project[] = [
  {
    slug: "fico",
    name: "Fico",
    year: "2026",
    summary: "Finance app that works offline and syncs when it can",
    lead: "A personal finance app that opens instantly, takes “lunch 80 cash” as input, and keeps working without a connection.",
    role: "Design and development, solo",
    stack: ["Next.js", "Ionic", "Capacitor", "PGlite", "Supabase", "TanStack Query", "Tesseract.js", "Groq"],
    links: [
      { label: "Source (app)", href: "https://github.com/Joshupau/fico" },
      { label: "Source (API)", href: "https://github.com/Joshupau/fico-api" },
      { label: "Live app", href: "https://fico-pearl.vercel.app" },
    ],
    sections: [
      {
        heading: "Why I built it",
        body: [
          "Budgeting apps lose me in the first week. Logging an expense feels like filling in a form, and anything that waits on a server is slow on a bus with one bar of signal.",
          "I wanted one that opens instantly, accepts an expense the way I’d text it, and answers “how much can I spend today?” from data already on the phone.",
        ],
        figure: {
          src: "/img/fico-mobile-dashboard.webp",
          alt: "The Fico dashboard with total balance, safe-to-spend and weekly spending",
          width: 376,
          height: 831,
          caption: "The home screen: balance, what’s safe to spend today, and bills due before month end.",
        },
      },
      {
        heading: "A Postgres database on the device",
        body: [
          "The app embeds Postgres on the device with PGlite. A small query engine answers supabase-js style calls (from, select, eq, rpc) against it, so the same query code runs online and offline, and reads never wait on the network.",
          "Writes land in the local database first. Every write that actually changed a row is also recorded in an outbox.",
        ],
        figure: "architecture",
      },
      {
        heading: "Syncing without losing writes",
        body: [
          "A sync loop replays the outbox to Supabase through a server function, then pulls remote changes. A change aimed at a table the server doesn’t have yet is held, not dropped, so an out-of-date server can’t quietly eat data.",
          "The query engine, sync logic, CSV import and parsers each have offline test scripts, so I can change them without testing by hand.",
        ],
      },
      {
        heading: "Typing instead of forms",
        body: [
          "Quick-add takes messages like “80 lunch cash” or “transfer 2k bdo to gotyme”, in English or Filipino, and turns them into transactions with the right amount, wallet and category. It runs entirely on the device.",
          "Receipts can be scanned in the app with Tesseract.js, and a chat-style agent answers questions about the same local data.",
        ],
        figure: {
          src: "/img/fico-mobile-activity.webp",
          alt: "The Fico activity list grouped by day with filters",
          width: 376,
          height: 831,
          caption: "Every transaction, grouped by day, with filters by wallet and category.",
        },
      },
      {
        heading: "Letting an AI read the numbers",
        body: [
          "A separate read-only MCP server exposes my finances to an AI assistant behind a token: spending by category, upcoming bills, goals, runway and a safe-to-spend figure. I use it to plan real purchases and a move to Manila.",
        ],
        figure: {
          src: "/img/fico-mobile-insights.webp",
          alt: "The Fico insights page with a category mix chart and period summary",
          width: 376,
          height: 831,
          caption: "Insights: where the month’s money went, from the same data the AI reads.",
        },
      },
      {
        heading: "What’s next",
        body: [
          "Milestones for goals and debt payoff, a what-if forecast with sliders, and capturing transactions from wallet notifications on Android.",
        ],
      },
    ],
  },
  {
    slug: "kofi",
    name: "Kofi NFT Marketplace",
    year: "2025",
    summary: "Web3 marketplace for game and inventory assets",
    lead: "A marketplace where players connect a wallet, mint NFTs from game assets, and list, buy and sell them on-chain.",
    role: "Full-stack and smart contracts",
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Solidity", "Hardhat", "Ethers.js v6", "Wagmi", "IPFS"],
    links: [{ label: "Live app", href: "https://kofi-nft-market.vercel.app/" }],
    sections: [
      {
        heading: "What it does",
        body: [
          "Players connect a wallet, turn game or inventory assets into NFTs, and put them up for sale. Buying and selling settles on-chain, and each item’s metadata is stored on IPFS.",
        ],
        figure: {
          src: "/img/kofi.webp",
          alt: "The Kofi marketplace home page",
          width: 1600,
          height: 979,
          caption: "The marketplace front page.",
        },
      },
      {
        heading: "How it’s built",
        body: [
          "Solidity contracts developed and tested with Hardhat handle minting and trading. The Next.js front end talks to them through Wagmi and Ethers.js v6.",
        ],
      },
    ],
  },
];

export const experience = [
  {
    org: "Dee Global Software Corporation",
    role: "Software Developer",
    period: "Jun 2026 to present",
    points: [
      "Maintain and extend the company’s production point-of-sale system: bug fixes, feature updates and ongoing improvements.",
      "Primary on-site developer, taking tasks from requirements through to delivery.",
    ],
  },
  {
    org: "Axcela PH",
    role: "Junior Backend Developer",
    period: "Nov 2024 to May 2026",
    points: [
      "Built a double-entry accounting system with automated interest calculations and loan release schemas.",
      "Wrote REST APIs and background workers in Node.js and TypeScript for high-concurrency work.",
      "Added real-time features with Socket.io for gaming backends and live updates.",
      "Shipped cross-platform builds (Electron for desktop, Android APKs) and integrated PayPal and Web3 modules.",
    ],
  },
  {
    org: "DICT Region IX",
    role: "Full Stack Developer Intern",
    period: "Jun to Jul 2023",
    points: ["Built an attendance management system with Laravel and Vue.js."],
  },
];

export const education = {
  school: "Ateneo de Zamboanga University",
  degree: "BS Information Technology, cum laude",
  period: "2020 to 2024",
  note: "Core team member, Google Developer Student Clubs",
};
