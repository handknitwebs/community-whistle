import { getStateCodeFromName, getStateNameFromCode } from '../data/hotlines'

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 1000 * 60 * 10
}

export const geolocationSupported = () => typeof navigator !== 'undefined' && 'geolocation' in navigator

const getCurrentPosition = () => new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS)
})

const reverseGeocodeToState = async (coords, { signal } = {}) => {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', coords.latitude)
  url.searchParams.set('lon', coords.longitude)
  url.searchParams.set('zoom', '5')
  url.searchParams.set('addressdetails', '1')

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'en'
    },
    signal
  })

  if (!response.ok) {
    throw new Error('Reverse geocoding failed')
  }

  return response.json()
}

const mapGeolocationError = (error) => {
  if (!error || typeof error.code !== 'number') return 'unavailable'

  switch (error.code) {
    case 1:
      return 'denied'
    case 2:
    case 3:
      return 'unavailable'
    default:
      return 'unavailable'
  }
}

export const resolveUserState = async ({ signal } = {}) => {
  if (!geolocationSupported()) {
    return { status: 'unsupported' }
  }

  let position
  try {
    position = await getCurrentPosition()
  } catch (error) {
    return { status: mapGeolocationError(error) }
  }

  let data
  try {
    data = await reverseGeocodeToState(position.coords, { signal })
  } catch (error) {
    return { status: 'unavailable' }
  }

  const address = data?.address
  if (!address) {
    return { status: 'unavailable' }
  }

  if (address.country_code && address.country_code.toLowerCase() !== 'us') {
    return { status: 'outside' }
  }

  const locality = address.city
    || address.town
    || address.village
    || address.hamlet
    || address.municipality
    || null

  const county = address.county || null

  const stateCode = address.state_code
    ? address.state_code.toUpperCase()
    : getStateCodeFromName(address.state)

  if (!stateCode) {
    return { status: 'unavailable' }
  }

  const stateName = getStateNameFromCode(stateCode) || address.state || stateCode

  return {
    status: 'resolved',
    code: stateCode,
    name: stateName,
    locality,
    county
  }
}
