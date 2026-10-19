# Aurelia Creative Agency — interactive website project

A responsive React/Vite agency website inspired by the approved premium creative-agency direction, with:
- Homepage, services, portfolio, client reviews, process, contact details and footer
- Customer package builder with an estimated total
- Project brief/order request flow
- Demo admin panel to edit brand copy, contact info, services, portfolio, reviews, process steps, prices and announcement bar
- Local browser persistence for rapid design/content testing
- Starter Supabase client and Vercel configuration

## Important: current stage

This is a **local prototype**, not yet production-ready. In local mode, content and submitted requests are saved in the browser's `localStorage`; they do not automatically sync between browsers or devices. The admin login is intentionally only a demo gate (`ican-demo`) and is **not secure authentication**. Do not deploy this version publicly with the demo admin login. The starter includes a Supabase client hook for order inserts, but the complete database-backed CMS, secure admin authorization and image upload flow must be connected before production.

## 1. Run on your computer

**Windows quick start:** open this extracted project folder in VS Code. The folder you open must contain `package.json`. In VS Code Terminal, choose **Command Prompt** if PowerShell blocks scripts, then run `npm install` followed by `npm run dev`. If you stay in PowerShell, use `npm.cmd install` and `npm.cmd run dev`. Open the localhost URL printed in the terminal.


Install Node.js LTS (18+; 20+ recommended), then in this project folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Check the production build:

```bash
npm run build
npm run preview
```

## 2. Customize while local

1. Open the site and scroll to the footer.
2. Click **Admin**.
3. Demo password: `ican-demo`.
4. Edit brand name, hero copy, phone, email, address, currency, announcement, services, portfolio, reviews and process steps.
5. Content is saved to that browser only. Use **Backup / live setup → Export website content** to download JSON before clearing browser data.
6. For images in the prototype, paste a public image URL into the portfolio/brand image fields. The image itself is not uploaded by this starter.

For a quick reset, clear this site's local storage in browser dev tools, or use Restore starter content where available.

## 3. Supabase setup (production work)

Create a Supabase project, then create database tables for the content and orders. Suggested normalized structure:

- `site_settings`: one row containing editable brand/settings JSON; restrict writes to authenticated admins.
- `services`: id, name, category, description, price, unit, active, sort_order.
- `portfolio`: id, title, category, description, image_url, project_url, sort_order.
- `reviews`: id, client_name, company, quote, rating, photo_url, published, sort_order.
- `process_steps`: id, title, description, sort_order.
- `orders`: id, customer_name, email, phone, company, timeline, details, selected_services JSONB, estimate, status, created_at.

Enable **Row Level Security (RLS)** on every table. Public visitors should only be able to read published website content and submit an order through a narrowly scoped policy or Edge Function. Only authorized admin users should be able to create/update/delete website content and read customer orders. Do not use an unrestricted anonymous write policy for the admin CMS. Do not place the Supabase `service_role` secret in frontend environment variables.

### Images

Create a Supabase Storage bucket for public site images (e.g. `site-media`) and define upload policies so only authenticated admins can upload/replace/delete. Store each uploaded file's public URL in the corresponding content record. For private customer files, use a private bucket and signed URLs instead.

### Admin authentication

Use Supabase Auth (email/password or magic link) and protect the admin route. Admin status should be determined using a server-verified role or a protected admin-members table/policy, not a hard-coded password in React. Remove the demo password gate before production.

### Connecting this starter

The `src/supabase.js` file initializes a client when valid Vite environment variables exist. `.env.example` shows the variable names. The order form contains an example insert to an `orders` table; you must create the matching table and RLS policies before using it. To make **all sections dynamic across devices**, replace the `localStorage` content initialization/update flow in `src/App.jsx` with Supabase reads and writes for each content table. Until this step is completed, editing in admin changes only the current browser.

## 4. Deploy to Vercel

1. Put the project in a GitHub repository (do not commit `.env` or secrets).
2. In Vercel, choose **Add New → Project**, import that GitHub repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. In Vercel Project → Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable/anon key
5. Redeploy after adding or changing environment variables.
6. Add your Vercel domain in Supabase Auth → URL Configuration, and set the production Site URL plus redirect URLs.
7. Test on the deployed URL: responsive pages, package total, order insertion, admin login, edit/save from a second browser, and image upload.

The included `vercel.json` rewrites routes to the SPA entry point. For a static Vite site, Vercel can also detect this automatically.

## 5. Recommended build order

1. Approve agency branding, service names, prices, images and copy.
2. Finish local UI and test mobile layouts.
3. Create Supabase schema + RLS policies.
4. Connect content reads/writes and secure admin Auth.
5. Connect Storage uploads and order workflow.
6. Test permissions with a normal visitor and a separate admin account.
7. Deploy to Vercel and verify production behavior.

## 6. Project structure

```text
src/
  App.jsx        Main site, package builder, admin prototype
  data.js        Demo content to replace with your agency details
  main.jsx       React entry
  styles.css     Responsive visual design
  supabase.js    Supabase client bootstrap
index.html
.env.example
vercel.json
```

## Notes

- All brand names, portfolio items, testimonials and prices are sample content; replace them before publishing.
- Get client permission before publishing testimonials, photos or portfolio work.
- Never commit real credentials, service-role keys, passwords or customer data to GitHub.
