export const siteConfig = {
  name: "The Teff Papers",
  description:
    "A long-term public journal where ideas are captured, refined, and preserved before they become products.",
  url: "https://teffpapers.com",
};

export function pageTitle(title?: string) {
  return title ? `${title} | ${siteConfig.name}` : siteConfig.name;
}
