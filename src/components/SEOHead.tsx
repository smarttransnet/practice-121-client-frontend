import React, { useEffect } from 'react'
import type { DoctorSeoMetadata } from '../utils/seoUtils'

interface SEOHeadProps {
  seoData: DoctorSeoMetadata
  jsonLd?: Record<string, unknown> | null
}

export const SEOHead: React.FC<SEOHeadProps> = ({ seoData, jsonLd }) => {
  useEffect(() => {
    // 1. Update Title
    const originalTitle = document.title
    document.title = seoData.title

    // Helper to upsert meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attrName, attrValue)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Helper to upsert link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }
      element.setAttribute('href', href)
    }

    // 2. Robots Directive
    setMetaTag('name', 'robots', seoData.robots)

    // 3. Meta Description
    setMetaTag('name', 'description', seoData.description)

    // 4. Canonical URL
    setLinkTag('canonical', seoData.canonicalUrl)

    // 5. OpenGraph Tags
    setMetaTag('property', 'og:title', seoData.ogTitle)
    setMetaTag('property', 'og:description', seoData.ogDescription)
    setMetaTag('property', 'og:image', seoData.ogImage)
    setMetaTag('property', 'og:type', seoData.ogType)
    setMetaTag('property', 'og:url', seoData.ogUrl)

    // 6. Twitter Card Tags
    setMetaTag('name', 'twitter:card', seoData.twitterCard)
    setMetaTag('name', 'twitter:title', seoData.ogTitle)
    setMetaTag('name', 'twitter:description', seoData.ogDescription)
    setMetaTag('name', 'twitter:image', seoData.ogImage)

    // 7. Inject JSON-LD Structured Data
    const scriptId = 'doctor-physician-jsonld'
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script')
        scriptElement.id = scriptId
        scriptElement.type = 'application/ld+json'
        document.head.appendChild(scriptElement)
      }
      scriptElement.textContent = JSON.stringify(jsonLd, null, 2)
    } else if (scriptElement) {
      scriptElement.remove()
    }

    // Cleanup on unmount
    return () => {
      document.title = originalTitle
      const currentScript = document.getElementById(scriptId)
      if (currentScript) {
        currentScript.remove()
      }
    }
  }, [seoData, jsonLd])

  return null
}
