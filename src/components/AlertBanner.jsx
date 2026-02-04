import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getHotlineForLocation, getStateNameFromCode } from '../data/hotlines'
import { geolocationSupported, resolveUserState } from '../utils/resolveRegion'

const LOCATION_CACHE_KEY = 'cw-hotline-location'
const DISMISS_CACHE_KEY = 'cw-alert-banner-dismissed'
const LOCATION_CACHE_TTL = 1000 * 60 * 60 * 24 * 7

const readCachedLocation = () => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.code || !parsed.expiresAt) return null

    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(LOCATION_CACHE_KEY)
      return null
    }

    return parsed
  } catch (error) {
    return null
  }
}

const writeCachedLocation = (payload) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({
        ...payload,
        expiresAt: Date.now() + LOCATION_CACHE_TTL
      })
    )
  } catch (error) {
    // Ignore storage failures.
  }
}

const AlertBanner = () => {
  const { t } = useTranslation()
  const [status, setStatus] = useState('idle')
  const [stateCode, setStateCode] = useState(null)
  const [stateName, setStateName] = useState(null)
  const [locality, setLocality] = useState(null)
  const [county, setCounty] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const bannerRef = useRef(null)
  const abortRef = useRef(null)

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return

    if (dismissed) {
      document.documentElement.style.setProperty('--alert-banner-offset', '0px')
      return
    }

    const element = bannerRef.current
    if (!element) return

    const updateOffset = () => {
      const height = element.getBoundingClientRect().height
      document.documentElement.style.setProperty('--alert-banner-offset', `${height}px`)
    }

    updateOffset()

    const observer = new ResizeObserver(updateOffset)
    observer.observe(element)

    return () => observer.disconnect()
  }, [dismissed])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = window.sessionStorage.getItem(DISMISS_CACHE_KEY) === '1'
      if (isDismissed) {
        setDismissed(true)
        return
      }
    }

    const cached = readCachedLocation()
    if (cached) {
      setStateCode(cached.code)
      setStateName(cached.name || getStateNameFromCode(cached.code))
      setLocality(cached.locality || null)
      setCounty(cached.county || null)
      setStatus('resolved')
    }
  }, [])

  const hotline = useMemo(
    () => getHotlineForLocation({ stateCode, locality, county }),
    [stateCode, locality, county]
  )
  const resolvedStateName = stateName || getStateNameFromCode(stateCode)
  const locationAvailable = geolocationSupported()
  const resolvedArea = hotline.areaLabel || resolvedStateName

  const formatTelLink = (phone) => {
    if (!phone) return '#'
    const cleaned = phone.replace(/[^+\d]/g, '')
    return cleaned ? `tel:${cleaned}` : '#'
  }

  const statusText = useMemo(() => {
    if (status === 'loading') return t('alertBanner.loading')
    if (status === 'denied') return t('alertBanner.denied')
    if (status === 'unsupported') return t('alertBanner.unsupported')
    if (status === 'outside') return t('alertBanner.outside')
    if (status === 'unavailable') return t('alertBanner.unavailable')

    if (stateCode && !hotline.isFallback) {
      return t('alertBanner.resolved', { area: resolvedArea })
    }

    if (stateCode && hotline.isFallback) {
      return t('alertBanner.stateUnavailable', { area: resolvedStateName })
    }

    return t('alertBanner.fallback')
  }, [hotline.isFallback, resolvedArea, resolvedStateName, stateCode, status, t])

  const handleUseLocation = async () => {
    if (!locationAvailable || status === 'loading') return

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    const result = await resolveUserState({ signal: controller.signal })

    if (result.status === 'resolved') {
      setStateCode(result.code)
      setStateName(result.name)
      setLocality(result.locality || null)
      setCounty(result.county || null)
      setStatus('resolved')
      writeCachedLocation({
        code: result.code,
        name: result.name,
        locality: result.locality || null,
        county: result.county || null
      })
      return
    }

    setStatus(result.status)
  }

  const showLocationButton = locationAvailable && !stateCode

  const handleDismiss = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    setDismissed(true)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DISMISS_CACHE_KEY, '1')
    }
  }

  if (dismissed) {
    return null
  }

  return (
    <section className="alert-banner" aria-live="polite" ref={bannerRef}>
      <div className="alert-banner__inner">
        <div className="alert-banner__content">
          {/* <p className="alert-banner__title archivo-800">{t('alertBanner.title')}</p> */}
          {/* <p className="alert-banner__status roboto-400 body-small">{statusText}</p> */}
        <div className="alert-banner__actions">
          {showLocationButton && (
            <button
              type="button"
              className="alert-banner__location-button roboto-700"
              onClick={handleUseLocation}
              disabled={status === 'loading'}
            >
              {t('alertBanner.useLocation')}
            </button>
          )}
          {Array.isArray(hotline.entries) && hotline.entries.length > 0 ? (
            <div className="alert-banner__hotlines">
              {hotline.entries.map((entry) => (
                <div className="alert-banner__hotline" key={`${entry.label}-${entry.phone}`}>
                  <span className="alert-banner__title archivo-800">{entry.label}</span>
                  <a className="alert-banner__hotline-phone roboto-700" href={formatTelLink(entry.phone)}>
                    {entry.phone}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <a className="alert-banner__hotline-link roboto-700" href={hotline.url} target="_blank" rel="noreferrer">
              {t('alertBanner.hotlineCtaDefault')}
            </a>
          )}
        </div>
      </div>
    <button
          type="button"
          className="alert-banner__dismiss roboto-400"
          onClick={handleDismiss}
          aria-label={t('alertBanner.dismiss')}
        >
          ×
        </button>
      </div>
    </section>
  )
}

export default AlertBanner
