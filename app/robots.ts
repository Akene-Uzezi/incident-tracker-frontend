import type { MetadataRoute } from "next";

// This is an internal hospital tool, not a public marketing site — even the
// unauthenticated landing page collects incident data that shouldn't be
// indexed or surfaced by search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
