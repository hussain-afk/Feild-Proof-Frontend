import { useEffect } from "react";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "../config/site";

const setMeta = (selector, attribute, value) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    const [attributeName, attributeValue] = selector
      .slice(1, -1)
      .split("=");

    element.setAttribute(attributeName, attributeValue.replace(/["']/g, ""));
    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value);
};

export default function usePageMeta({
  title,
  description,
  canonical,
  noIndex = false,
  jsonLd,
}) {
  useEffect(() => {
    const canonicalUrl = canonical
      ? `${SITE_URL}${canonical}`
      : SITE_URL;

    document.title = title;

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", noIndex ? "noindex, nofollow" : "index, follow");
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", DEFAULT_SHARE_IMAGE);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", DEFAULT_SHARE_IMAGE);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    const oldJsonLd = document.head.querySelector('script[data-fieldproof-jsonld="true"]');
    if (oldJsonLd) oldJsonLd.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-fieldproof-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.head.querySelector('script[data-fieldproof-jsonld="true"]');
      if (script) script.remove();
    };
  }, [title, description, canonical, noIndex, jsonLd]);
}
