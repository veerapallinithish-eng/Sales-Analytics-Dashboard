import React, { useEffect, useState } from 'react'
import API from './api'
import KPICards from './components/KPICards'
import RevenueLineChart from './components/RevenueLineChart'
import CategoryBarChart from './components/CategoryBarChart'
import CategoryPieChart from './components/CategoryPieChart'
import RegionBarChart from './components/RegionBarChart'
import TopProductsTable from './components/TopProductsTable'
import FilterBar from './components/FilterBar'

function App(){
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [category, setCategory] = useState('')

  // apply button semantics: only update applied filters when user clicks Apply.
  const [applied, setApplied] = useState({ from: '', to: '', category: '' })
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [chartType, setChartType] = useState('line')

  function handleFilterChange(key, value){
    if(key === 'from') setFromDate(value)
    else if(key === 'to') setToDate(value)
    else if(key === 'category') setCategory(value)
    else if(key === 'apply') setApplied({ from: fromDate, to: toDate, category })
    else if(key === 'reset'){
      setFromDate(''); setToDate(''); setCategory(''); setApplied({ from: '', to: '', category: '' })
    }
  }

  useEffect(()=>{
    if(darkMode) document.documentElement.classList.add('dark-mode')
    else document.documentElement.classList.remove('dark-mode')
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false')
  },[darkMode])

  async function exportTopProducts(){
    try{
      const res = await API.get('/sales/top-products', { params: { from: applied.from, to: applied.to, category: applied.category } })
      const rows = res.data
      const headers = ['Rank','Product','Category','Units','Revenue']
      const csv = [headers.join(',')].concat(rows.map((r,i)=> [i+1,`"${r.name.replace(/"/g,'""')}"`,r.category,r.units_sold,r.revenue].join(','))).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `top-products-${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }catch(e){
      console.error(e)
      alert('Failed to export CSV')
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>Sales Analytics Dashboard</h1>
          <p className="subtitle">Visual overview of revenue, categories, regions and top products</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <label style={{color:'var(--muted)',fontSize:13}}>Chart</label>
          <select value={chartType} onChange={e=> setChartType(e.target.value)} style={{padding:8,borderRadius:8,background:'transparent',border:'1px solid var(--border)',color:'var(--muted)'}}>
            <option value="line">Line</option>
            <option value="area">Area</option>
          </select>
          <button className="secondary" onClick={()=> setDarkMode(d=>!d)}>{darkMode ? 'Light' : 'Dark'}</button>
          <button onClick={exportTopProducts}>Export CSV</button>
        </div>
      </header>

      <FilterBar from={fromDate} to={toDate} category={category} onChange={handleFilterChange} />

      <div style={{marginBottom:12}}>
        <KPICards from={applied.from} to={applied.to} category={applied.category} />
      </div>

      <div className="grid-root">
        <RevenueLineChart from={applied.from} to={applied.to} category={applied.category} chartType={chartType} />
        <div className="grid-2">
          <CategoryBarChart from={applied.from} to={applied.to} category={applied.category} />
          <CategoryPieChart from={applied.from} to={applied.to} category={applied.category} />
        </div>
        <RegionBarChart from={applied.from} to={applied.to} category={applied.category} />
        <TopProductsTable from={applied.from} to={applied.to} category={applied.category} />
      </div>
    </div>
  )
}

export default App
