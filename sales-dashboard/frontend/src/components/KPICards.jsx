import React, {useEffect, useState} from 'react'
import API from '../api'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function KPICards({from, to, category}){
  const [kpis, setKpis] = useState(null)
  const [spark, setSpark] = useState([])
  useEffect(()=>{
    API.get('/kpis', {params:{from, to, category}})
      .then(r=> setKpis(r.data))
      .catch(()=> setKpis(null))

    // also fetch monthly revenue to draw small sparklines
    API.get('/sales/monthly', { params: { from, to, category } })
      .then(r=> setSpark(r.data || []))
      .catch(()=> setSpark([]))
  },[from,to,category])

  function formatCurrency(v){ return '₹' + Number(v).toLocaleString() }

  if(!kpis) return (
    <div className="kpi-grid">
      {[0,1,2,3].map(i=> (
        <div key={i} className="card" style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>
      ))}
    </div>
  )
  return (
    <div className="kpi-grid">
      <div className="card">
        <small className="subtitle-small">Total Revenue</small>
        <div className="kpi-value">{formatCurrency(kpis.total_revenue)}</div>
        <div style={{height:40,marginTop:8}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="subtitle-small" style={{color:'var(--accent)'}}>+18.6% vs last month</div>
      </div>
      <div className="card">
        <small className="subtitle-small">Total Orders</small>
        <div className="kpi-value">{kpis.total_orders}</div>
        <div style={{height:40,marginTop:8}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-2)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="subtitle-small" style={{color:'var(--accent)'}}>+14.2% vs last month</div>
      </div>
      <div className="card">
        <small className="subtitle-small">Avg Order Value</small>
        <div className="kpi-value">{formatCurrency(kpis.average_order_value)}</div>
        <div style={{height:40,marginTop:8}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="subtitle-small" style={{color:'var(--accent-2)'}}>+6.3% vs last month</div>
      </div>
      <div className="card">
        <small className="subtitle-small">Best Selling</small>
        <div className="kpi-value small">{kpis.best_selling_product.name} <span className="muted">({kpis.best_selling_product.units_sold})</span></div>
        <div style={{height:40,marginTop:8}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-4)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="subtitle-small">Top product this period</div>
      </div>
    </div>
  )
}
