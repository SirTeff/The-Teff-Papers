import type { MetadataRoute } from "next";
import { getAllPaperCategories, getAllPapers, getCategorySlug } from "@/lib/papers";
import { siteConfig } from "@/lib/metadata";
export default function sitemap(): MetadataRoute.Sitemap { const pages = ["", "/papers", "/manifesto", "/about", "/projects", "/contact"]; return [...pages.map((route) => ({ url: `${siteConfig.url}${route}`, lastModified: new Date() })), ...getAllPaperCategories().map((category) => ({ url: `${siteConfig.url}/categories/${getCategorySlug(category)}`, lastModified: new Date() })), ...getAllPapers().map((paper) => ({ url: `${siteConfig.url}/papers/${paper.slug}`, lastModified: new Date(paper.date) }))]; }
