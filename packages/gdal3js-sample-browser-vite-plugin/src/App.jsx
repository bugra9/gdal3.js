import { useState, useEffect } from 'react'
import { initCppJs, Gdal, AllSymbols } from 'gdal3.js/Gdal.h';
import 'gdal3.js/Driver.h';
import 'gdal3.js/Dataset.h';

function App() {
  const [driverCount, setDriverCount] = useState('compiling ...')

  useEffect(() => {
    initCppJs().then(() => {
      Gdal.allRegister();
      const drivers = AllSymbols.toArray(Gdal.getDrivers());
      setDriverCount(drivers.length)
    })
  }, [])

  return (
    <p>Number of drivers: {driverCount}</p>
  )
}

export default App
