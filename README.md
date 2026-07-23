# The Khabar Thread

A Hindi news/blog website with a Firebase-backed admin CMS for publishing news articles and homepage advertisements.

## Stack

- **Frontend:** static HTML/CSS/JS (no build step)
- **Auth:** Firebase Authentication (Google Sign-In, restricted to a single admin account)
- **Database:** Cloud Firestore (`news` and `ads` collections)
- **Image hosting:** Cloudinary (unsigned upload preset)
- **Hosting:** static hosting on a custom domain (see `CNAME`)

## Project structure

```
index.html, news.html, category.html, about.html, ...   Public pages
admin/                                                    Admin panel (CMS)
  login.html, dashboard.html, add-news.html, edit-news.html,
  all-news.html, add-ad.html, edit-ad.html, ads.html, settings.html
js/                                                        Shared frontend + admin JS modules
  firebase.js       Firebase app/Firestore init
  auth.js           Auth helpers (googleLogin, logout, requireAdmin)
  content-format.js Markdown-lite -> safe HTML formatter for article content
  editor-toolbar.js Formatting toolbar for the article textarea
  escape-html.js     HTML-escaping helper used before any innerHTML insert
css/, style.css                                            Public site styles
admin/admin.css                                            Admin panel styles
data/news.json                                             Sample/static news data
firestore.rules                                             Firestore security rules
```

## Setup

1. **Firebase**
   - Create a Firebase project and enable **Authentication → Google** sign-in and **Firestore**.
   - Copy your Firebase config into `js/firebase.js` (`firebaseConfig` object).
   - Set the admin account's email as `ADMIN_EMAIL` in `js/auth.js` — this is the only account the CMS will let into `admin/`.
   - Deploy `firestore.rules` (Firebase Console → Firestore → Rules, or `firebase deploy --only firestore:rules` if using the CLI). Rules allow public read on `news`/`ads` and restrict writes to the admin email.
   - Firestore composite index: `category.js` queries `news` filtered by `category` and ordered by `createdAt`. The first time this runs, Firestore may prompt (via a console error link) to create the required composite index — follow that link once, in the Firebase Console.

2. **Cloudinary**
   - Create a Cloudinary account and an **unsigned upload preset**.
   - Update the cloud name (`m9332fjb`) and `upload_preset` (`thekhabarthread`) references in `js/add-news.js`, `js/edit-news.js`, `js/add-ad.js`, and `js/edit-ad.js` if you use different values.

3. **Deploy**
   - This is a static site — upload the project as-is to your host (GitHub Pages, Firebase Hosting, Netlify, etc.).
   - `CNAME` is set for GitHub Pages custom domain hosting; update or remove it depending on your host.

## Admin panel

- Go to `admin/login.html` and sign in with the configured Google admin account.
- **Add News / All News** — publish and manage articles. The article body supports a small markdown-lite syntax via the formatting toolbar (bold, italic, heading, list, quote, link) with a live preview.
- **Ads** — manage homepage/sidebar/article/footer advertisement banners.
- **Settings** — view the signed-in admin profile and static site configuration (site name, domain, Firebase project, storage providers). This page is informational only; actual config lives in `js/firebase.js` and `js/auth.js`.

## Notes

- Admin pages guard access client-side via `requireAdmin()` in `js/auth.js`; the real enforcement is `firestore.rules`, which rejects writes from any account other than `ADMIN_EMAIL`.
- Any text rendered from Firestore into `innerHTML` (news titles, categories, ad titles, etc.) is passed through `escapeHTML()` first to prevent stored-XSS.
