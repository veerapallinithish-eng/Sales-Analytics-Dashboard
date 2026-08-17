import React, {useEffect, useState} from 'react'
import API from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function RevenueLineChart({from, to, category, chartType='line'}){
  const [data, setData] = useState([])
  useEffect(()=>{
    API.get('/sales/monthly', {params:{from, to, category}})
      .then(r=> setData(r.data))
      .catch(err=> setData([]))
  },[from,to,category])

  if(!data || data.length === 0) return <div className="card"> <h4>Revenue Over Time</h4> <div style={{height:260,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div></div>

  return (
    <div className="card">
      <h4>Revenue Over Time</h4>
      <div style={{height:'var(--chart-height)'}}>
        <ResponsiveContainer width="100%" height="100%">
        {chartType === 'area' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#8be6c8" fillOpacity={1} fill="url(#colorRev)" animationDuration={1200} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} dot={{r:4}} animationDuration={1200} />
          </LineChart>
        )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
