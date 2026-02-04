import { useEffect, useState } from 'react'
import { IconChevronSmall } from './Icons'
import { LANGUAGE_OPTIONS } from '../data/languages'

const LanguageSelect = ({ language = 'en', onChange = () => { }, inverse = false }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoverEnabled, setHoverEnabled] = useState(false)
  const currentOption = LANGUAGE_OPTIONS.find((option) => option.code === language)
  const currentLabel = currentOption ? currentOption.code.toUpperCase() : 'EN'

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const widthQuery = window.matchMedia('(min-width: 1201px)')

    const updateHoverEnabled = () => setHoverEnabled(hoverQuery.matches && widthQuery.matches)

    const canListenToHover = typeof hoverQuery.addEventListener === 'function'
    const canListenToWidth = typeof widthQuery.addEventListener === 'function'

    updateHoverEnabled()

    if (canListenToHover) {
      hoverQuery.addEventListener('change', updateHoverEnabled)
    } else {
      hoverQuery.onchange = updateHoverEnabled
    }

    if (canListenToWidth) {
      widthQuery.addEventListener('change', updateHoverEnabled)
    } else {
      widthQuery.onchange = updateHoverEnabled
    }

    return () => {
      if (canListenToHover) {
        hoverQuery.removeEventListener('change', updateHoverEnabled)
      } else if (hoverQuery.onchange === updateHoverEnabled) {
        hoverQuery.onchange = null
      }

      if (canListenToWidth) {
        widthQuery.removeEventListener('change', updateHoverEnabled)
      } else if (widthQuery.onchange === updateHoverEnabled) {
        widthQuery.onchange = null
      }
    }
  }, [])

  const handleSelect = (code) => {
    if (code !== language) {
      onChange(code)
    }
    setMenuOpen(false)
  }

  const handlePointerEnter = () => {
    if (hoverEnabled) {
      setMenuOpen(true)
    }
  }

  const handlePointerLeave = () => {
    if (hoverEnabled) {
      setMenuOpen(false)
    }
  }

  const handleToggleClick = () => {
    setMenuOpen((prev) => !prev)
  }

  return (
    <div
      className={`language-select ${inverse ? 'inverse' : ''}`}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onFocus={() => setMenuOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setMenuOpen(false)
        }
      }}
    >
      <button
        className="language-select__trigger roboto-400 text-box"
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={handleToggleClick}
      >
        <span className="language-select__label roboto-400 text-box">{currentLabel}</span>
        <IconChevronSmall />
      </button>
      <ul className="language-select__menu" role="menu" hidden={!menuOpen}>
        {LANGUAGE_OPTIONS.map((option) => (
          <li key={option.code} role="none">
            <button
              type="button"
              className={`language-select__option ${language === option.code ? 'is-active' : ''} roboto-400`}
              role="menuitemradio"
              aria-checked={language === option.code}
              onClick={() => handleSelect(option.code)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LanguageSelect
