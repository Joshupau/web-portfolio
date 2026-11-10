// Data for the "session" transcript. Facts come from lib/content.ts wherever they exist there.
import { experience, projects, person } from "@/lib/content";

export type TaskStatus = "done" | "active" | "next";

export type Task = {
  id: string; // anchor id of the block this task links to
  label: string;
  meta: string;
  status: TaskStatus;
};

export const statusMark: Record<TaskStatus, { mark: string; word: string }> = {
  done: { mark: "[x]", word: "done" },
  active: { mark: "[~]", word: "in progress" },
  next: { mark: "[ ]", word: "next" },
};

const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!;
const fico = bySlug("fico");
const kofi = bySlug("kofi");
const kky = bySlug("kkyubbi");
const [dee, axcela, dict] = experience;

export const tasks: Task[] = [
  { id: "fico", label: fico.name, meta: `${fico.year}, shipped`, status: "done" },
  { id: "kkyubbi", label: kky.name, meta: `${kky.year}, in progress`, status: "active" },
  { id: "kofi", label: "Kofi marketplace", meta: `${kofi.year}, shipped`, status: "done" },
  { id: "job-dee", label: dee.org.replace(" Software Corporation", ""), meta: dee.period, status: "active" },
  { id: "job-axcela", label: axcela.org, meta: axcela.period, status: "done" },
  { id: "job-dict", label: dict.org, meta: dict.period, status: "done" },
  { id: "now-next", label: "Building with AI", meta: "now and next", status: "active" },
];

export const prompt = {
  user: "Show me what Joshua has built and where he has worked.",
  agent: `${person.name} is a full-stack and backend developer working in fintech, based in ${person.location}. Below are his three main projects, his jobs, and what he is doing next.`,
};

export const fico_ = {
  sentence: fico.lead,
  tests: {
    command: "npm run test:offline",
    sentence: "Fico ships with offline test scripts, so changes written with an AI assistant are checked by tests, not trusted.",
    areas: ["query engine", "sync logic", "CSV import", "safe-to-spend math", "notification parser"],
  },
  quickAdd: {
    sentence: "Quick-add turns a typed message, in English or Filipino, into a transaction on the phone, with no server call.",
    examples: [
      { input: "80 lunch cash", out: ["amount   80", "label    lunch", "wallet   cash"] },
      { input: "transfer 2k bdo to gotyme", out: ["type     transfer", "amount   2,000", "from     bdo", "to       gotyme"] },
    ],
  },
  sync: {
    sentence:
      "Every change is saved on the phone first, queued in an outbox, then replayed to the server. A change for a table the server does not have yet is held, not dropped.",
    path: "sync",
    note: "Simplified sketch of the rule, not the actual source.",
    diff: [
      { k: "ctx", t: "for (const change of outbox) {" },
      { k: "del", t: "  if (!serverHas(change.table)) discard(change)" },
      { k: "add", t: "  if (!serverHas(change.table)) { hold(change); continue }" },
      { k: "ctx", t: "  await replay(change)" },
      { k: "ctx", t: "}" },
    ] as { k: "ctx" | "add" | "del"; t: string }[],
  },
  stack: fico.stack,
  also: [
    "Receipt scanning with Tesseract.js, and Groq-powered insights.",
    "A separate read-only MCP server lets an AI assistant read his finances: spending by category, upcoming bills, goals, runway, safe-to-spend.",
  ],
  shots: [
    {
      src: "/img/fico-mobile-dashboard.webp",
      alt: "The Fico dashboard with total balance, safe-to-spend and bills due",
      cap: "Dashboard",
      notes: [
        { x: 36, y: 20, title: "A one-line insight", text: "Written by an AI model from the month's numbers, in plain words." },
        { x: 33, y: 36, title: "Balance across every wallet", text: "Read from the database on the phone, so it shows with no signal." },
        { x: 20, y: 73, title: "Safe to spend", text: "What is left for today after bills and the rest of the month are set aside." },
        { x: 30, y: 87, title: "Bills before month end", text: "Overdue ones are flagged, and they already count against safe to spend." },
      ],
    },
    {
      src: "/img/fico-mobile-activity.webp",
      alt: "The Fico activity list grouped by day with filters",
      cap: "Activity",
      notes: [
        { x: 50, y: 21, title: "Filters", text: "Narrow the list by wallet, category or date." },
        { x: 87, y: 28, title: "A total for each day", text: "Every day is grouped, with what went out that day." },
        { x: 84, y: 35, title: "Which wallet paid", text: "Each record shows the wallet it came from, like GCash or a bank." },
        { x: 50, y: 93, title: "Add from anywhere", text: "Opens quick-add, where “80 lunch cash” becomes a record." },
      ],
    },
    {
      src: "/img/fico-mobile-insights.webp",
      alt: "The Fico insights page with a category mix chart and period summary",
      cap: "Insights",
      notes: [
        { x: 38, y: 20, title: "One place for the numbers", text: "Spending, budgets, money, bills and goals as tabs." },
        { x: 50, y: 32, title: "Pick the period", text: "Today, week, month, year or all time." },
        { x: 50, y: 49, title: "The month in four figures", text: "Spent, came in, top category and number of transactions." },
        { x: 50, y: 83, title: "Category mix", text: "Where the money went. The AI assistant reads this same data." },
      ],
    },
  ],

  links: fico.links,
};

export const kkyubbi_ = {
  sentence: kky.lead,
  demo: "Same core, different modules. Pick a business type to see which modules switch on, or take the cube apart.",
  points: [
    "Each computer keeps its own SQLite database, so selling does not stop when the internet does.",
    "Branches sync to one central Postgres database on Supabase.",
    "Packaged as a Windows desktop app with Electron.",
  ],
  stack: kky.stack,
  status: "in development, first edition is for a medicine distributor",
};

export const kofi_ = {
  sentence: kofi.lead,
  stack: kofi.stack,
  host: "kofi-nft-market.vercel.app",
  img: { src: "/img/kofi.webp", alt: "The Kofi marketplace home page", width: 1600, height: 979 },
  links: kofi.links,
  how: kofi.sections[1].body[0],
};

export const jobs = [
  { id: "job-dee", status: "active" as TaskStatus, sentence: "Current job: keeps a live point-of-sale system working and growing.", job: dee },
  { id: "job-axcela", status: "done" as TaskStatus, sentence: "Backend work on loan and accounting software.", job: axcela },
  { id: "job-dict", status: "done" as TaskStatus, sentence: "First dev job: a small attendance system, as an intern.", job: dict },
];

export const nowNext = {
  sentence: "How he works today, and what he is learning next.",
  now: [
    "Plans and builds features with AI assistants, then checks the result with tests he writes and runs himself.",
    "Built a read-only MCP server so an AI assistant can answer questions from his real finance data.",
  ],
  next: [
    "Building LLM features properly: prompts, structured output, evaluation and cost control.",
    "Agents and tool use beyond what he has done with MCP so far.",
  ],
  open: "Open to fintech engineering roles where AI is part of how the team builds.",
};
