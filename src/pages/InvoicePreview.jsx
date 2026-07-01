import React, { useRef } from 'react'
import LOGO from '../assets/logo.js'

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const STATUS_LABELS = { draft: 'Draft', sent: 'Invoice', paid: 'Receipt', overdue: 'Invoice — Overdue' }

export default function InvoicePreview({ invoice, onBack, onEdit }) {
  const printRef = useRef()

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    // Ensure base64 logo renders in print window (replace src if needed)
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoice.invoiceNumber} — Kablatech Solutions</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet"/>
          <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; color: #1C1C1E; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const inv = invoice

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Controls */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', alignItems: 'center' }}>
        <button onClick={onBack} style={{
          padding: '8px 16px', borderRadius: 7, background: 'white',
          border: '1px solid var(--slate-border)', color: 'var(--slate)', fontWeight: 500, fontSize: 13
        }}>← Back to invoices</button>
        <div style={{ flex: 1 }} />
        <button onClick={onEdit} style={{
          padding: '8px 18px', borderRadius: 7, background: 'white',
          border: '1px solid var(--amber)', color: 'var(--amber)', fontWeight: 600, fontSize: 13
        }}>Edit invoice</button>
        <button onClick={handlePrint} style={{
          padding: '8px 20px', borderRadius: 7, background: 'var(--forest)',
          color: 'white', fontWeight: 600, fontSize: 13
        }}>Print / Download PDF</button>
      </div>

      {/* Invoice Document */}
      <div ref={printRef} style={{
        background: 'white',
        minHeight: '297mm',
        padding: '0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Header band */}
        <div style={{
          background: '#1B4332',
          padding: '40px 48px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          {/* Company info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <img src={LOGO} alt="Kablatech Solutions" style={{
                width: 64, height: 64, objectFit: 'contain',
                background: 'white', borderRadius: 10, padding: 4, flexShrink: 0,
              }} />
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 20, letterSpacing: '-0.3px' }}>Kablatech Solutions</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 1 }}>IT & Software Services</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              <div>10, Elsbeth Ojo Close, Off Aladesanmi Road</div>
              <div>Asero, Abeokuta, Ogun State, Nigeria</div>
              <div style={{ marginTop: 4 }}>Tel: 09169621561</div>
            </div>
          </div>

          {/* Invoice title & number */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 36, fontWeight: 700, color: 'white',
              fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-1px', lineHeight: 1
            }}>
              {STATUS_LABELS[inv.status] || 'Invoice'}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{
                display: 'inline-block',
                background: '#E76F00', color: 'white',
                padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 14
              }}>{inv.invoiceNumber}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 12, lineHeight: 1.8 }}>
              <div>Issue date: <span style={{ color: 'white', fontWeight: 500 }}>{inv.issueDate}</span></div>
              <div>Due date: <span style={{ color: inv.status === 'overdue' ? '#F4A261' : 'white', fontWeight: 500 }}>{inv.dueDate}</span></div>
            </div>
          </div>
        </div>

        {/* Amber accent line */}
        <div style={{ height: 4, background: '#E76F00' }} />

        {/* Bill to */}
        <div style={{ padding: '28px 48px', borderBottom: '1px solid #F2F2F7', display: 'flex', gap: 48 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E76F00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Billed to</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1C1E', marginBottom: 2 }}>{inv.clientName || '—'}</div>
            {inv.clientCompany && <div style={{ fontSize: 13, color: '#6B6B6E', marginBottom: 2 }}>{inv.clientCompany}</div>}
            {inv.clientEmail && <div style={{ fontSize: 13, color: '#6B6B6E' }}>{inv.clientEmail}</div>}
            {inv.clientPhone && <div style={{ fontSize: 13, color: '#6B6B6E' }}>{inv.clientPhone}</div>}
            {inv.clientAddress && <div style={{ fontSize: 13, color: '#6B6B6E', marginTop: 4, lineHeight: 1.5 }}>{inv.clientAddress}</div>}
          </div>
          {inv.status === 'paid' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                border: '3px solid #1B4332', borderRadius: 8, padding: '8px 20px',
                color: '#1B4332', fontWeight: 800, fontSize: 22, letterSpacing: '0.1em',
                transform: 'rotate(-12deg)', opacity: 0.85
              }}>PAID</div>
            </div>
          )}
        </div>

        {/* Line items */}
        <div style={{ padding: '0 48px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
            <thead>
              <tr style={{ background: '#F0FFF4', borderBottom: '2px solid #D8F3DC' }}>
                <th style={thStyle('left', '44%')}>Description</th>
                <th style={thStyle('right', '10%')}>Qty</th>
                <th style={thStyle('right', '20%')}>Unit price</th>
                <th style={thStyle('right', '26%')}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(inv.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '13px 14px 13px 0', fontSize: 14, color: '#1C1C1E' }}>
                    <div style={{ fontWeight: 500 }}>{item.description}</div>
                  </td>
                  <td style={{ padding: '13px 14px', textAlign: 'right', fontSize: 14, color: '#6B6B6E' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '13px 14px', textAlign: 'right', fontSize: 14, color: '#6B6B6E' }}>
                    {fmt(item.unitPrice)}
                  </td>
                  <td style={{ padding: '13px 0 13px 14px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#1C1C1E' }}>
                    {fmt(parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 0 32px' }}>
            <div style={{ width: 280 }}>
              <TRow label="Subtotal" val={fmt(inv.subtotal)} />
              {inv.discountAmt > 0 && <TRow label="Discount" val={`− ${fmt(inv.discountAmt)}`} color="#C0392B" />}
              {inv.applyVAT && <TRow label="VAT (7.5%)" val={fmt(inv.vatAmt)} />}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '14px 16px', marginTop: 6, borderRadius: 8,
                background: '#1B4332', color: 'white'
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total due</span>
                <span style={{ fontWeight: 700, fontSize: 18 }}>{fmt(inv.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment + Notes */}
        <div style={{
          padding: '24px 48px', background: '#FAFAF7',
          borderTop: '1px solid #F2F2F7', display: 'flex', gap: 40
        }}>
          {(inv.bankName || inv.accountNumber) && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E76F00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Payment details</div>
              {inv.bankName && <PayRow label="Bank" val={inv.bankName} />}
              {inv.accountName && <PayRow label="Account name" val={inv.accountName} />}
              {inv.accountNumber && <PayRow label="Account no." val={inv.accountNumber} />}
            </div>
          )}
          {inv.notes && (
            <div style={{ flex: 1.5 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E76F00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Notes & terms</div>
              <p style={{ fontSize: 13, color: '#6B6B6E', lineHeight: 1.6 }}>{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#1B4332', padding: '14px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Thank you for your business.</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{inv.invoiceNumber} · Kablatech Solutions</span>
        </div>
      </div>
    </div>
  )
}

const thStyle = (align, width) => ({
  padding: '10px 14px 10px ' + (align === 'left' ? '0' : '14px'),
  textAlign: align, width, fontSize: 11, fontWeight: 700,
  color: '#1B4332', textTransform: 'uppercase', letterSpacing: '0.06em'
})

function TRow({ label, val, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F2F2F7' }}>
      <span style={{ fontSize: 13, color: '#6B6B6E' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: color || '#1C1C1E' }}>{val}</span>
    </div>
  )
}

function PayRow({ label, val }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: '#6B6B6E', minWidth: 90 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1E' }}>{val}</span>
    </div>
  )
}
