import React, { useState } from 'react'

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PaymentModal({ invoice, onClose, onSave }) {
  const totalPaid    = (invoice.payments || []).reduce((s, p) => s + p.amount, 0)
  const outstanding  = (invoice.grandTotal || 0) - totalPaid
  const today        = new Date().toISOString().split('T')[0]

  const [amount,  setAmount]  = useState(outstanding > 0 ? outstanding : '')
  const [method,  setMethod]  = useState('transfer')
  const [date,    setDate]    = useState(today)
  const [ref,     setRef]     = useState('')
  const [note,    setNote]    = useState('')
  const [error,   setError]   = useState('')

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0)          return setError('Enter a valid amount.')
    if (amt > outstanding + 0.01)  return setError('Amount exceeds outstanding balance of ' + fmt(outstanding) + '.')
    if (!date)                     return setError('Select a payment date.')
    setError('')
    onSave({ id: Date.now(), amount: amt, method, date, reference: ref.trim(), note: note.trim() })
  }

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',
    }} onClick={onClose}>
      <div style={{
        background:'white',borderRadius:16,width:'100%',maxWidth:480,
        boxShadow:'0 24px 60px rgba(0,0,0,0.25)',overflow:'hidden',
      }} onClick={e=>e.stopPropagation()}>

        <div style={{background:'var(--forest)',padding:'1.25rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{color:'white',fontWeight:700,fontSize:16}}>Record Payment</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:2}}>{invoice.invoiceNumber} · {invoice.clientName}</div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',width:30,height:30,borderRadius:'50%',fontSize:16}}>×</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:'1px solid var(--slate-faint)'}}>
          <BalCell label="Invoice total" value={fmt(invoice.grandTotal)} />
          <BalCell label="Already paid"  value={fmt(totalPaid)} color="var(--forest)" />
          <BalCell label="Outstanding"   value={fmt(outstanding)} color={outstanding>0?'var(--amber)':'var(--forest)'} highlight />
        </div>

        <div style={{padding:'1.5rem'}}>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Amount received (₦)</label>
            <input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" style={inp} />
            <div style={{display:'flex',gap:6,marginTop:6}}>
              <QuickBtn label="Full balance" onClick={()=>setAmount(outstanding)} />
              {outstanding>0 && <QuickBtn label="Half" onClick={()=>setAmount((outstanding/2).toFixed(2))} />}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <label style={lbl}>Payment method</label>
              <select value={method} onChange={e=>setMethod(e.target.value)} style={inp}>
                <option value="transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="pos">POS</option>
                <option value="ussd">USSD</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Payment date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp} />
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={lbl}>Reference / Transaction ID <span style={{color:'var(--slate-muted)',fontWeight:400,textTransform:'none'}}>(optional)</span></label>
            <input type="text" value={ref} onChange={e=>setRef(e.target.value)} placeholder="e.g. TRF/2025/001234" style={inp} />
          </div>

          <div style={{marginBottom:16}}>
            <label style={lbl}>Note <span style={{color:'var(--slate-muted)',fontWeight:400,textTransform:'none'}}>(optional)</span></label>
            <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Part payment — balance due 15 Aug" style={inp} />
          </div>

          {error && <div style={{padding:'9px 13px',borderRadius:8,background:'var(--danger-pale)',color:'var(--danger)',fontSize:13,marginBottom:14}}>⚠️ {error}</div>}

          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:'11px',borderRadius:9,background:'var(--slate-faint)',border:'1px solid var(--slate-border)',color:'var(--slate)',fontWeight:600}}>Cancel</button>
            <button onClick={handleSave} style={{flex:2,padding:'11px',borderRadius:9,background:'var(--forest)',color:'white',fontWeight:700,fontSize:14,boxShadow:'0 4px 12px rgba(27,67,50,0.3)'}}>
              Record & Generate Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BalCell({label,value,color,highlight}) {
  return (
    <div style={{padding:'12px 16px',textAlign:'center',background:highlight?'var(--amber-pale)':'var(--slate-faint)',borderRight:'1px solid var(--slate-faint)'}}>
      <div style={{fontSize:11,color:'var(--slate-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{label}</div>
      <div style={{fontSize:15,fontWeight:700,color:color||'var(--slate)'}}>{value}</div>
    </div>
  )
}
function QuickBtn({label,onClick}) {
  return <button onClick={onClick} style={{padding:'4px 10px',borderRadius:5,fontSize:12,fontWeight:500,background:'var(--forest-faint)',color:'var(--forest)',border:'1px solid var(--forest-pale)'}}>{label}</button>
}
const lbl={display:'block',fontSize:11,fontWeight:700,color:'var(--slate-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:5}
const inp={width:'100%',padding:'9px 12px',border:'1.5px solid var(--slate-border)',borderRadius:8,background:'var(--slate-faint)',fontSize:14}
