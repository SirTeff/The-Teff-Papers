import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export const categories = [
  "Sunday Reflections",
  "Inside AI",
  "Notes from Building Fred",
  "Systems Thinking",
  "The Future Is Personal",
] as const;

export const supportedTags = [
  "Artificial Intelligence",
  "Personal Digital Intelligence",
  "Fred+Teff",
  "Fred Studio",
  "Automation",
  "Systems Thinking",
  "Blockchain",
  "Leadership",
  "Faith",
  "Human Behaviour",
  "Product Thinking",
  "Future of Work",
  "Digital Infrastructure",
  "Documentation",
  "Decision-Making",
] as const;

export type Paper = {
  title: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime: string;
  status: string;
  relatedProject?: string;
  version?: string;
  author: string;
  featured?: boolean;
  content: string;
};

const papersDirectory = path.join(process.cwd(), "src/content/papers");

function parsePaperDate(date: string) {
  const timestamp = new Date(`${date}T00:00:00Z`).getTime();
  if (Number.isNaN(timestamp)) throw new Error(`Invalid paper publication date: ${date}`);
  return timestamp;
}

export function getAllPapers(): Paper[] {
  if (!fs.existsSync(papersDirectory)) return [];

  return fs
    .readdirSync(papersDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(papersDirectory, file), "utf8");
      const { data, content } = matter(raw);
      return { ...data, content } as Paper;
    })
    .filter((paper) => paper.status.toLowerCase() !== "hidden")
    .sort((a, b) => {
      const dateDifference = parsePaperDate(b.date) - parsePaperDate(a.date);
      return dateDifference || a.title.localeCompare(b.title);
    });
}

export function getPaperBySlug(slug: string) {
  return getAllPapers().find((paper) => paper.slug === slug);
}

export async function renderMarkdown(content: string) {
  const result = await remark().use(html).process(content);
  return result.toString();
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
