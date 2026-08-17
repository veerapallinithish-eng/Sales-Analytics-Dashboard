import React, {useEffect, useState} from 'react'
import API from '../api'

export default function TopProductsTable({from, to, category}){
  const [rows, setRows] = useState([])
  useEffect(()=>{
    API.get('/sales/top-products', {params:{from, to, category}})
      .then(r=> setRows(r.data))
      .catch(()=> setRows([]))
  },[from,to,category])

  if(!rows || rows.length === 0) return <div className="card"><h4>Top Products</h4><div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div></div>

  return (
    <div className="card">
      <h4>Top Products</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Category</th>
            <th style={{textAlign:'right'}}>Units</th>
            <th style={{textAlign:'right'}}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=> (
            <tr key={r.id}>
              <td>{i+1}</td>
              <td>{r.name}</td>
              <td>{r.category}</td>
              <td style={{textAlign:'right'}}>{r.units_sold}</td>
              <td style={{textAlign:'right'}}>₹{Number(r.revenue).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
