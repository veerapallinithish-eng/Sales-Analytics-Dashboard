import React from 'react'

export default function FilterBar({from, to, category, onChange}){
  return (
    <div className="filter-row">
      <div>
        <label style={{display:'block',color:'var(--muted)',fontSize:12}}>From</label>
        <input type="date" value={from} onChange={e=> onChange('from', e.target.value)} />
      </div>
      <div>
        <label style={{display:'block',color:'var(--muted)',fontSize:12}}>To</label>
        <input type="date" value={to} onChange={e=> onChange('to', e.target.value)} />
      </div>
      <div>
        <label style={{display:'block',color:'var(--muted)',fontSize:12}}>Category</label>
        <select value={category} onChange={e=> onChange('category', e.target.value)}>
          <option value="">All</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Food</option>
          <option>Books</option>
          <option>Sports</option>
        </select>
      </div>
      <div style={{display:'flex',alignItems:'end',gap:8}}>
        <button onClick={()=>{ onChange('apply', true) }}>Apply</button>
        <button className="secondary" onClick={()=>{ onChange('reset', true) }}>Reset</button>
      </div>
    </div>
  )
}
