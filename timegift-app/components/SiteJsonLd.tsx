/** Site-wide structured data (WebSite, Organization, SoftwareApplication) for search engines. */
const SITE_URL = "https://timegift.6x7.gr";
/** The one description used by meta, Open Graph, Twitter and JSON-LD. */
export const SITE_DESCRIPTION =
  "Not a thing you bought. A morning. A long walk. The whole of next Sunday. Write it down, send it across, and mean it.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "TimeGift",
      description: SITE_DESCRIPTION,
      publisher: { "@id": "https://6x7.gr/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": "https://6x7.gr/#organization",
      name: "6x7",
      url: "https://6x7.gr",
    },
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": `${SITE_URL}/#app`,
      name: "TimeGift",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      image: `${SITE_URL}/opengraph-image`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      featureList: [
        "Write a time gift: who, how much time, what for",
        "Send it by email or text; the recipient needs no account",
        "Recipient accepts and picks a date; both get it",
        "Private shelf of memories after the gift happens",
      ],
      publisher: { "@id": "https://6x7.gr/#organization" },
    },
  ],
};

export function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
