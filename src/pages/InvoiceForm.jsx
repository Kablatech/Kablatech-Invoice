import React, { useState, useEffect } from 'react'

const VAT_RATE = 0.075 // 7.5% standard Nigeria VAT

const genInvoiceNum = () => {
  const d = new Date()
  const y = d.getFullYear().toString().slice(2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 900) + 100
  return `KBL-${y}${m}-${rand}`
}

const today = () => new Date().toISOString().split('T')[0]
const addDays = (d, n) => {
  const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]
}

const emptyItem = () => ({ id: Date.now() + Math.random(), description: '', quantity: 1, unitPrice: '', total: 0 })

export default function InvoiceForm({ invoice, onSave, onCancel }) {
  const [form, setForm] = useState(() => invoice || {
    id: crypto.randomUUID?.() || String(Date.now()),
    invoiceNumber: genInvoiceNum(),
    status: 'draft',
    issueDate: today(),
    dueDate: addDays(today(), 30),
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCompany: '',
    items: [emptyItem()],
    notes: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    applyVAT: true,
    discount: 0,
  })

  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const updateItem = (id, key, val) => {
    setForm(f => ({
      ...f,
      items: f.items.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, [key]: val }
        if (key === 'quantity' || key === 'unitPrice') {
          updated.total = parseFloat(updated.quantity || 0) * parseFloat(updated.unitPrice || 0)
        }
        return updated
      })
    }))
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }))
  const removeItem = (id) => {
    if (form.items.length === 1) return
    setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }))
  }

  const subtotal = form.items.reduce((s, i) => s + (parseFloat(i.quantity || 0) * parseFloat(i.unitPrice || 0)), 0)
  const discountAmt = parseFloat(form.discount || 0)
  const afterDiscount = Math.max(0, subtotal - discountAmt)
  const vatAmt = form.applyVAT ? afterDiscount * VAT_RATE : 0
  const grandTotal = afterDiscount + vatAmt

  const validate = () => {
    const e = {}
    if (!form.clientName.trim()) e.clientName = 'Client name is required'
    if (!form.invoiceNumber.trim()) e.invoiceNumber = 'Invoice number is required'
    if (!form.issueDate) e.issueDate = 'Issue date is required'
    if (!form.dueDate) e.dueDate = 'Due date is required'
    if (form.items.some(i => !i.description.trim())) e.items = 'All items need a description'
    if (form.items.some(i => !i.unitPrice || parseFloat(i.unitPrice) <= 0)) e.itemPrice = 'All items need a valid price'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = (newStatus) => {
    if (!validate()) return
    onSave({
      ...form,
      status: newStatus || form.status,
      subtotal,
      discountAmt,
      vatAmt,
      grandTotal,
      updatedAt: new Date().toISOString(),
    })
  }

  const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--slate)' }}>
            {invoice ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p style={{ color: 'var(--slate-muted)', fontSize: 14, marginTop: 3 }}>
            Fill in the details below to {invoice ? 'update' : 'create'} an invoice.
          </p>
        </div>
        <StatusBadge status={form.status} onChange={v => set('status', v)} />
      </div>

      {/* Invoice Meta */}
      <Section title="Invoice details">
        <Grid cols={3}>
          <Field label="Invoice number" error={errors.invoiceNumber}>
            <input value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Issue date" error={errors.issueDate}>
            <input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Due date" error={errors.dueDate}>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} style={inputStyle} />
          </Field>
        </Grid>
      </Section>

      {/* Client Info */}
      <Section title="Client information">
        <Grid cols={2}>
          <Field label="Client / Company name" error={errors.clientName}>
            <input value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Acme Corporation" style={inputStyle} />
          </Field>
          <Field label="Contact person">
            <input value={form.clientCompany} onChange={e => set('clientCompany', e.target.value)} placeholder="e.g. John Adeyemi" style={inputStyle} />
          </Field>
          <Field label="Email address">
            <input type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="client@example.com" style={inputStyle} />
          </Field>
          <Field label="Phone number">
            <input value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="08012345678" style={inputStyle} />
          </Field>
        </Grid>
        <Field label="Client address" style={{ marginTop: 12 }}>
          <textarea
            value={form.clientAddress}
            onChange={e => set('clientAddress', e.target.value)}
            placeholder="Street, City, State, Country"
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </Field>
      </Section>

      {/* Line Items */}
      <Section title="Services / Products">
        {errors.items && <ErrMsg msg={errors.items} />}
        {errors.itemPrice && <ErrMsg msg={errors.itemPrice} />}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ background: 'var(--forest-faint)', borderBottom: '2px solid var(--forest-pale)' }}>
                {['Description', 'Qty', 'Unit Price (₦)', 'Total (₦)', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right',
                    fontSize: 12, fontWeight: 600, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--slate-faint)' }}>
                  <td style={{ padding: '8px 12px', width: '42%' }}>
                    <input
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="e.g. Web development — June 2025"
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', width: '10%' }}>
                    <input
                      type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      style={{ ...inputStyle, textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', width: '20%' }}>
                    <input
                      type="number" min="0" step="0.01" value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      style={{ ...inputStyle, textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', width: '20%', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                    {fmt(parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0))}
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'center', width: '8%' }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={form.items.length === 1}
                      style={{
                        width: 26, height: 26, borderRadius: '50%', border: 'none',
                        background: form.items.length === 1 ? 'transparent' : 'var(--danger-pale)',
                        color: 'var(--danger)', fontSize: 16, lineHeight: 1,
                        opacity: form.items.length === 1 ? 0.3 : 1,
                        cursor: form.items.length === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} style={{
          marginTop: 12, padding: '8px 16px', borderRadius: 7, background: 'var(--forest-faint)',
          border: '1px dashed var(--forest-light)', color: 'var(--forest)', fontWeight: 500, fontSize: 13
        }}>+ Add line item</button>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <div style={{ width: 300 }}>
            <TotalRow label="Subtotal" value={fmt(subtotal)} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate-faint)' }}>
              <span style={{ fontSize: 14, color: 'var(--slate-muted)' }}>Discount (₦)</span>
              <input
                type="number" min="0" value={form.discount}
                onChange={e => set('discount', e.target.value)}
                style={{ ...inputStyle, width: 100, textAlign: 'right', padding: '4px 8px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate-faint)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--slate-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.applyVAT} onChange={e => set('applyVAT', e.target.checked)} style={{ accentColor: 'var(--forest)' }} />
                VAT (7.5%)
              </label>
              <span style={{ fontSize: 14, color: 'var(--slate-muted)' }}>{fmt(vatAmt)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '12px 0',
              borderTop: '2px solid var(--forest)', marginTop: 4
            }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--forest)' }}>Grand Total</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--forest)' }}>{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Payment & Notes */}
      <Grid cols={2} style={{ gap: 16, marginBottom: 0 }}>
        <Section title="Payment details" compact>
          <Field label="Bank name">
            <input value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g. Zenith Bank" style={inputStyle} />
          </Field>
          <Field label="Account name" style={{ marginTop: 10 }}>
            <input value={form.accountName} onChange={e => set('accountName', e.target.value)} placeholder="Kablatech Solutions" style={inputStyle} />
          </Field>
          <Field label="Account number" style={{ marginTop: 10 }}>
            <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="0123456789" style={inputStyle} />
          </Field>
        </Section>
        <Section title="Notes & terms" compact>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Payment terms, delivery notes, or any additional information for the client…"
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
          />
        </Section>
      </Grid>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-border)' }}>
        <button onClick={onCancel} style={{
          padding: '10px 20px', borderRadius: 8, background: 'white',
          border: '1px solid var(--slate-border)', color: 'var(--slate-mid)', fontWeight: 500
        }}>Cancel</button>
        <button onClick={() => handleSave('draft')} style={{
          padding: '10px 20px', borderRadius: 8, background: 'var(--slate-faint)',
          border: '1px solid var(--slate-border)', color: 'var(--slate)', fontWeight: 500
        }}>Save as draft</button>
        <button onClick={() => handleSave('sent')} style={{
          padding: '10px 24px', borderRadius: 8, background: 'var(--forest)',
          color: 'white', fontWeight: 600
        }}>Save & mark as sent</button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '8px 11px', border: '1px solid var(--slate-border)',
  borderRadius: 7, background: 'white', fontSize: 14, color: 'var(--slate)'
}

function Section({ title, children, compact }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, border: '1px solid var(--slate-border)',
      padding: compact ? '1.25rem' : '1.5rem', marginBottom: '1.25rem'
    }}>
      <h2 style={{
        fontSize: 13, fontWeight: 600, color: 'var(--forest)', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{ width: 3, height: 14, background: 'var(--amber)', borderRadius: 2, display: 'inline-block' }} />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Grid({ cols, children, style }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, ...style }}>
      {children}
    </div>
  )
}

function Field({ label, children, error, style }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--slate-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function TotalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate-faint)' }}>
      <span style={{ fontSize: 14, color: 'var(--slate-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function ErrMsg({ msg }) {
  return <div style={{ padding: '8px 12px', background: 'var(--danger-pale)', color: 'var(--danger)', borderRadius: 6, fontSize: 13, marginBottom: 10 }}>{msg}</div>
}

function StatusBadge({ status, onChange }) {
  const options = ['draft', 'sent', 'paid', 'overdue']
  const colors = { draft: '#6B6B6E', sent: '#185FA5', paid: '#1B4332', overdue: '#C0392B' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--slate-muted)', fontWeight: 500 }}>Status:</span>
      <select value={status} onChange={e => onChange(e.target.value)} style={{
        padding: '6px 12px', borderRadius: 7, border: '1px solid var(--slate-border)',
        background: 'white', fontWeight: 600, fontSize: 13, color: colors[status]
      }}>
        {options.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
      </select>
    </div>
  )
}
