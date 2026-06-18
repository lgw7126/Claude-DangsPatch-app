import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import LocationCard from './components/LocationCard.jsx'
import HotlineCard from './components/HotlineCard.jsx'
import ShelterList from './components/ShelterList.jsx'
import DaanggnPanel from './components/DaanggnPanel.jsx'
import { getCurrentPosition } from './services/geolocation.js'
import { reverseGeocode } from './services/kakaoApi.js'
import { fetchNearbyShelters } from './services/shelterApi.js'

export default function App() {
  const [locationStatus, setLocationStatus] = useState('idle')
  const [shelterStatus, setShelterStatus] = useState('idle')
  const [address, setAddress] = useState('')
  const [dong, setDong] = useState('')
  const [shelters, setShelters] = useState([])

  const loadLocation = useCallback(async () => {
    setLocationStatus('loading')
    setShelterStatus('loading')
    setAddress('')
    setDong('')
    setShelters([])

    let coords
    try {
      coords = await getCurrentPosition()
    } catch (err) {
      setLocationStatus('error')
      setShelterStatus('idle')
      return
    }

    // 주소 변환과 보호소 조회를 병렬로 실행
    const [addrResult, shelterResult] = await Promise.allSettled([
      reverseGeocode(coords),
      fetchNearbyShelters(coords),
    ])

    if (addrResult.status === 'fulfilled') {
      setAddress(addrResult.value.address)
      setDong(addrResult.value.dong)
      setLocationStatus('success')
    } else {
      setLocationStatus('error')
    }

    if (shelterResult.status === 'fulfilled') {
      setShelters(shelterResult.value)
      setShelterStatus('success')
    } else {
      setShelterStatus('error')
    }
  }, [])

  useEffect(() => {
    loadLocation()
  }, [loadLocation])

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col max-w-lg mx-auto">
      <Header />

      <main className="flex-1 pb-6">
        <LocationCard
          status={locationStatus}
          address={address}
          onRefresh={loadLocation}
        />

        <HotlineCard />

        <ShelterList status={shelterStatus} shelters={shelters} />

        <DaanggnPanel address={address} dong={dong} />
      </main>

      <footer className="text-center text-xs text-gray-400 pb-4 px-4">
        댕스패치 · 유기견 구조를 돕는 앱
      </footer>
    </div>
  )
}
