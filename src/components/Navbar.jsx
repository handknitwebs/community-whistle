import { useState } from 'react'
import HotlineButton from './HotlineButton'
import LanguageSelect from './LanguageSelect'
import { IconMenu, IconClose, IconArrow } from './Icons'

const Navbar = ({
  navLinks,
  activeNav,
  logoImage,
  logoAlt = 'Community whistle logo',
  onNavClick = () => { },
  language = 'en',
  onLanguageChange = () => { },
  hotlineLabel = 'Find a hotline',
  primaryLabel = 'Primary navigation',
  mobileLabel = 'Mobile navigation',
  openMenuLabel = 'Open menu',
  closeMenuLabel = 'Close menu'
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navListId = 'primary-nav-links'
  const mobileNavListId = `${navListId}-mobile`
  const normalizedLogo = typeof logoImage === 'string' ? { src: logoImage } : logoImage || {}
  const {
    src: logoSrc,
    srcSet: logoSrcSet,
    webpSrcSet: logoWebpSrcSet,
    width: logoWidth,
    height: logoHeight,
    sizes: logoSizes
  } = normalizedLogo

  const handleLinkClick = (href) => {
    onNavClick(href)
    setMenuOpen(false)
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  return (
    <div className={`nav-wrapper ${menuOpen ? 'is-open' : ''}`}>
      <header className="nav-bar">
        <div className="nav-logo">
          <picture>
            {logoWebpSrcSet && (
              <source type="image/webp" srcSet={logoWebpSrcSet} sizes={logoSizes} />
            )}
            <img
              src={logoSrc}
              srcSet={logoSrcSet}
              sizes={logoSizes}
              width={logoWidth}
              height={logoHeight}
              alt={logoAlt}
              decoding="async"
            />
          </picture>
        </div>
        <nav aria-label={primaryLabel}>
          <ul className="nav-links" id={navListId}>
            {navLinks.map((link) => (
              <li key={link.href} className="nav-link">
                <a
                  className={`${activeNav === link.href ? 'is-active' : ''} roboto-400 text-box no-shift-bold`}
                  href={link.href}
                  data-text={link.label}
                  onClick={() => handleLinkClick(link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <LanguageSelect language={language} onChange={onLanguageChange} />
          <HotlineButton size="small">
            {hotlineLabel}
          </HotlineButton>
          <button
            type="button"
            className="nav-menu-button"
            aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
            aria-expanded={menuOpen}
            aria-controls={mobileNavListId}
            onClick={toggleMenu}
          >
            <IconMenu />
          </button>
        </div>
      </header >
      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label={mobileLabel}>
        <div className="mobile-menu__top">
          <div className="nav-logo">
            <picture>
              {logoWebpSrcSet && (
                <source type="image/webp" srcSet={logoWebpSrcSet} sizes={logoSizes} />
              )}
              <img
                src={logoSrc}
                srcSet={logoSrcSet}
                sizes={logoSizes}
                width={logoWidth}
                height={logoHeight}
                alt={logoAlt}
                decoding="async"
              />
            </picture>
          </div>
          <button
            type="button"
            className="nav-close-button"
            aria-label={closeMenuLabel}
            onClick={() => setMenuOpen(false)}
          >
            <IconClose />
          </button>
        </div>
        <nav aria-label={mobileLabel}>
          <ul className="mobile-nav-links" id={mobileNavListId}>
            {navLinks.map((link) => (
              <li key={link.href} className="mobile-nav-item">
                <a
                  className={`mobile-nav-link roboto-400 text-box ${activeNav === link.href ? 'is-active' : ''}`}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                >
                  <span className="mobile-nav-link__arrow" aria-hidden="true">
                    {activeNav === link.href ? <IconArrow /> : null}
                  </span>
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <HotlineButton className="mobile-hotline">
          {hotlineLabel}
        </HotlineButton>
        <div className="mobile-language">
          <LanguageSelect language={language} onChange={onLanguageChange} />
        </div>
      </div>
    </div >
  )
}

export default Navbar
