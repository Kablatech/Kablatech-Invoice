# Kablatech Invoice System

## Login Credentials
| Username   | Password        | Role  |
|------------|-----------------|-------|
| admin      | Kablatech@2025  | Admin |
| kablatech  | Invoice@2025    | Staff |

To change: open src/pages/Login.jsx and edit the USERS array.

## Deploy to Vercel

1. Push this folder to GitHub (see steps below)
2. Go to vercel.com/new and import the repo
3. Framework: Vite | Build: vite build | Output: dist
4. Click Deploy

## Push to GitHub

```bash
git init
git add .
git commit -m "Kablatech invoice app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kablatech-invoice.git
git push -u origin main
```

## EmailJS Setup (for email receipts)
1. Sign up at emailjs.com (free)
2. Add email service → connect Gmail
3. Create template with these variables:
   to_name, receipt_no, invoice_no, amount_paid,
   payment_date, method, reference, outstanding
4. Open src/components/ReceiptModal.jsx
5. Replace YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, YOUR_PUBLIC_KEY
6. Push to GitHub — Vercel redeploys automatically

## Local Development
```bash
npm install
npm run dev
```
