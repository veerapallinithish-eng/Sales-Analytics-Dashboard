import React, {useEffect, useState} from 'react'
import API from '../api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6a46ff', '#4f76ff', '#19c37c', '#f59e0b', '#ff5ca1']

function formatCurrency(v){
  return '₹' + Number(v).toLocaleString()
}

function CustomLegend({ payload, data }){
  if(!data || data.length === 0) return null
  const total = data.reduce((s,x)=> s + (x.revenue||0), 0)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
      {data.map((d,i)=> (
        <div key={d.category} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:12,height:12,background:COLORS[i%COLORS.length],borderRadius:3}} />
            <div style={{color:'var(--muted)'}}>{d.category}</div>
          </div>
          <div style={{textAlign:'right',color:'var(--muted)'}}>{formatCurrency(d.revenue)} <span style={{opacity:0.8}}>({Math.round((d.revenue/total||0)*100)}%)</span></div>
        </div>
      ))}
    </div>
  )
}

export default function CategoryPieChart({from, to, category}){
  const [data, setData] = useState([])
  useEffect(()=>{
    API.get('/sales/by-category', {params:{from, to, category}})
      .then(r=> setData(r.data))
      .catch(()=> setData([]))
  },[from,to,category])

  if(!data || data.length === 0) return <div className="card"><h4>Category Share</h4><div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div></div>

  if(!data || data.length === 0) return <div className="card"><h4>Category Share</h4><div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div></div>

  return (
    <div className="card">
      <h4>Category Share</h4>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{width:'60%'}}>
          <div style={{height:'var(--chart-height)'}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              {
                (()=>{
                  const RADIAN = Math.PI / 180;
                  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill={"var(--muted)"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${(percent*100).toFixed(0)}%`}
                      </text>
                    );
                  };

                  return (
                    <Pie
                      data={data}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={renderCustomizedLabel}
                      labelLine={false}
                      animationDuration={900}
                      stroke={'var(--panel)'}
                      strokeWidth={2}
                      fillOpacity={1}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={"var(--panel)"} strokeWidth={1} />
                      ))}
                    </Pie>
                  )
                })()
              }
              <Tooltip formatter={(value)=> formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{width:'40%'}}>
          <CustomLegend data={data} />
        </div>
      </div>
    </div>
  )
}
