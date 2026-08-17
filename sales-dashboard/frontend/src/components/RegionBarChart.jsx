import React, {useEffect, useState} from 'react'
import API from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RegionBarChart({from, to, category}){
  const [data, setData] = useState([])
  useEffect(()=>{
    API.get('/sales/by-region', {params:{from, to, category}})
      .then(r=> setData(r.data))
      .catch(()=> setData([]))
  },[from,to,category])

  if(!data || data.length === 0) return <div className="card"><h4>Revenue by Region</h4><div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div></div>

  return (
    <div className="card">
      <h4>Revenue by Region</h4>
      <div style={{height:'var(--chart-height)'}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis type="number" stroke="var(--muted)" />
          <YAxis dataKey="region" type="category" stroke="var(--muted)" />
          <Tooltip />
          <Bar dataKey="revenue" fill="var(--accent-2)" animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
