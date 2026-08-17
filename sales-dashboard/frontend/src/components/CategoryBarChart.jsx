import React, {useEffect, useState} from 'react'
import API from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CategoryBarChart({from, to, category}){
  const [data, setData] = useState([])
  useEffect(()=>{
    API.get('/sales/by-category', {params:{from, to, category}})
      .then(r=> setData(r.data))
      .catch(()=> setData([]))
  },[from,to,category])

  if(!data || data.length === 0) return <div className="card"><h4>Revenue by Category</h4><div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div></div>

  return (
    <div className="card">
      <h4>Revenue by Category</h4>
      <div style={{height:'var(--chart-height)'}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="category" stroke="var(--muted)" />
          <YAxis stroke="var(--muted)" />
          <Tooltip />
          <Bar dataKey="revenue" fill="var(--accent-3)" animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
