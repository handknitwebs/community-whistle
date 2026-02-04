import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import AlertBanner from './components/AlertBanner'
import { heroImage, localResources, logoImage } from './data/siteContent'
import { LANGUAGE_CODES } from './data/languages'
import CodesSection from './sections/CodesSection'
import ContactSection from './sections/ContactSection'
import CreditSection from './sections/CreditSection'
import GuidanceSections from './sections/GuidanceSections'
import HeroSection from './sections/HeroSection'
import ResourcesSection from './sections/ResourcesSection'
import StatementSection from './sections/StatementSection'
import ListSection from './components/ListSection'
import { manageMultipleOverflows, resetFontSizes } from './utils/layoutManager'

function App() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage || i18n.language || 'en'
  const languageCode = language.split('-')[0]
  const activeLanguage = LANGUAGE_CODES.includes(languageCode) ? languageCode : 'en'

  const navLinks = useMemo(() => {
    const value = t('navLinks', { returnObjects: true })
    return Array.isArray(value) ? value : []
  }, [t, language])

  const heroCopy = useMemo(() => {
    const value = t('hero', { returnObjects: true })
    return value && typeof value === 'object' ? value : {}
  }, [t, language])

  const guidanceSections = useMemo(() => {
    const value = t('guidanceSections', { returnObjects: true })
    return Array.isArray(value) ? value : []
  }, [t, language])

  const whistleCodes = useMemo(() => {
    const value = t('whistleCodes', { returnObjects: true })
    return Array.isArray(value) ? value : []
  }, [t, language])

  const resourcesCopy = useMemo(() => {
    const value = t('resources', { returnObjects: true })
    return value && typeof value === 'object' ? value : {}
  }, [t, language])

  const contactCopy = useMemo(() => {
    const value = t('contact', { returnObjects: true })
    return value && typeof value === 'object' ? value : {}
  }, [t, language])

  const creditCopy = useMemo(() => {
    const value = t('credit', { returnObjects: true })
    return value && typeof value === 'object' ? value : {}
  }, [t, language])

  const footerCopy = useMemo(() => {
    const value = t('footer', { returnObjects: true })
    return value && typeof value === 'object' ? value : {}
  }, [t, language])

  const navCopy = useMemo(() => {
    const value = t('nav', { returnObjects: true })
    return value && typeof value === 'object' ? value : {}
  }, [t, language])

  const statementLines = useMemo(() => {
    const value = t('statement.lines', { returnObjects: true })
    return Array.isArray(value) ? value : []
  }, [t, language])

  const heroTitleLines = Array.isArray(heroCopy.titleLines) ? heroCopy.titleLines : []
  const heroImageAlt = heroCopy.imageAlt || 'Illustration of a whistle rallying a crowd'
  const [primaryGuidance, ...additionalGuidance] = guidanceSections
  const [activeNav, setActiveNav] = useState(navLinks[0]?.href)

  const applyOverflowManagement = () => {
    const usesOverflowAdjustments = activeLanguage === 'es' || activeLanguage === 'so' || activeLanguage === 'vi'

    // Only shrink typography for languages that need it.
    if (!usesOverflowAdjustments) {
      resetFontSizes('.nav-link a')
      resetFontSizes('.nav-links')
      resetFontSizes('.hotline-button.small')
      resetFontSizes('.section-title')
      resetFontSizes('.display-title')
      resetFontSizes('.code-title')
      resetFontSizes('.mobile-nav-links')
      resetFontSizes('.mobile-nav-link')
      return
    }

    resetFontSizes('.nav-link a')
    resetFontSizes('.mobile-nav-link')
    resetFontSizes('.section-title')
    resetFontSizes('.display-title')
    resetFontSizes('.code-title')
    resetFontSizes('.nav-links')
    resetFontSizes('.mobile-nav-links')
    resetFontSizes('.hotline-button.small')

    manageMultipleOverflows([
      { selector: '.nav-links', containerSelector: '.nav-bar', minFontSize: 12, maxFontSize: 16, step: 0.5 },
      { selector: '.mobile-nav-links', containerSelector: '.mobile-menu', minFontSize: 16, maxFontSize: 22, step: 0.5 },
      { selector: '.hotline-button.small', containerSelector: '.nav-bar', minFontSize: 12, maxFontSize: 16, step: 0.5 },
      { selector: '.section-title', containerSelector: '.panel', minFontSize: 40, maxFontSize: 96, step: 1 },
      { selector: '.display-title', containerSelector: '.hero-panel', minFontSize: 32, maxFontSize: 72, step: 1 },
      { selector: '.code-title', containerSelector: '.code-card', minFontSize: 32, maxFontSize: 64, step: 1 }
    ])
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleEntries.length > 0) {
          const nextActive = `#${visibleEntries[0].target.id}`
          setActiveNav((prev) => (prev !== nextActive ? nextActive : prev))
        }
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    )

    const targets = navLinks
      .map((link) => document.querySelector(link.href))
      .filter(Boolean)

    targets.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [navLinks])

  useEffect(() => {
    // Apply layout management after DOM has updated with new language content
    requestAnimationFrame(applyOverflowManagement)

    const handleResize = () => requestAnimationFrame(applyOverflowManagement)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [activeLanguage])

  const handleNavClick = (href) => setActiveNav(href)
  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage)
  }

  return (
    <div className={`page lang-${activeLanguage}`}>
      <AlertBanner />
      <Navbar
        activeNav={activeNav}
        navLinks={navLinks}
        logoImage={logoImage}
        logoAlt={navCopy.logoAlt}
        onNavClick={handleNavClick}
        language={activeLanguage}
        onLanguageChange={handleLanguageChange}
        hotlineLabel={t('navHotlineLabel')}
        primaryLabel={navCopy.primaryLabel}
        mobileLabel={navCopy.mobileLabel}
        openMenuLabel={navCopy.openMenu}
        closeMenuLabel={navCopy.closeMenu}
      />
      <main className="content">
        <HeroSection
          image={heroImage}
          imageAlt={heroImageAlt}
          titleLines={heroTitleLines}
          note={heroCopy.note}
        />
        {primaryGuidance && <ListSection section={primaryGuidance} />}
        <CodesSection
          codes={whistleCodes}
          title={t('codesSectionTitle')}
          note={t('codesSectionNote')}
        />
        <StatementSection lines={statementLines} />
        <GuidanceSections sections={additionalGuidance} />
        <ResourcesSection
          localResources={localResources}
          title={resourcesCopy.title}
          intro={resourcesCopy.intro}
          toggleLabel={resourcesCopy.toggleLabel}
          hotlineLabel={t('hotlineLabel')}
          cardsLabel={resourcesCopy.cardsLabel}
          closeMenuLabel={resourcesCopy.closeMenuLabel}
        />
        <ContactSection copy={contactCopy} />
        <CreditSection caption={creditCopy.caption} imageAlt={creditCopy.imageAlt} />
      </main>
      <SiteFooter
        prompt={footerCopy.prompt}
        hotlineLabel={footerCopy.hotlineLabel}
        language={activeLanguage}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  )
}

export default App
