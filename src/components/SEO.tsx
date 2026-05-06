import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

const BASE_URL = 'https://cw-electronics.co.za'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`

export default function SEO({
  title = 'CW Electronics — Wholesale & Retail Electronics | Crown Mines JHB',
  description = 'Direct importer of chargers, CCTV, solar, routers, smartwatches & more. Best prices in Johannesburg. Trade pricing & bulk discounts available.',
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="CW Electronics" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="geo.region" content="ZA-GP" />
      <meta name="geo.placename" content="Crown Mines, Johannesburg" />
    </Helmet>
  )
}
