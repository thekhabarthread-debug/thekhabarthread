# The Khabar Thread — सुरक्षित deployment

इस package में social preview, SEO rendering, dynamic sitemap, secure admin upload और security headers तैयार हैं। Cloudinary API Secret जानबूझकर किसी file में नहीं रखा गया है।

## 1. Cloudinary preset सुरक्षित करें

Cloudinary Console → Settings → Upload → Upload presets में `thekhabarthread` preset खोलें:

- Signing mode: **Signed**
- Allowed formats: `jpg,png,webp,avif`
- Maximum file size: `5 MB`
- Folder: `thekhabarthread`

## 2. Cloudflare secrets सेट करें

Project folder में terminal खोलकर:

```bash
npm install
npx wrangler login
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

पहली command में Cloudinary Console का API Key और दूसरी में API Secret paste करें। Secret screen या source code में दिखाई नहीं देगा।

## 3. Firestore security rules deploy करें

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

नई rules fake public view increments रोकती हैं और केवल verified Google admin account को write access देती हैं।

## 4. Cloudflare Worker deploy करें

```bash
npm run check
npm run deploy
```

उसी `thekhabarthread` Worker पर पहले से जुड़ा custom domain बना रहेगा। Worker:

- `www.thekhabarthread.in` को main domain पर 301 redirect करता है
- हर `news.html?id=...` URL पर server-side Open Graph/Twitter image बनाता है
- Facebook, WhatsApp और X के लिए 1200×630 preview image देता है
- सही canonical और NewsArticle schema देता है
- Firestore से हमेशा ताज़ा sitemap बनाता है

## 5. Deployment के बाद जांच

किसी खबर का पूरा URL खोलें और फिर इन tools में refresh/scrape करें:

- Facebook Sharing Debugger: `https://developers.facebook.com/tools/debug/`
- LinkedIn Post Inspector: `https://www.linkedin.com/post-inspector/`
- Google Rich Results Test: `https://search.google.com/test/rich-results`

WhatsApp पुराना preview cache कर सकता है। पहली जांच के लिए URL के अंत में अस्थायी `&v=2` जोड़ सकते हैं; canonical फिर भी मूल article URL ही रहेगा।

## जरूरी बात

Cloudinary preset को Signed करने और Worker secrets set करने के बाद ही नया image upload चलेगा। पुरानी खबरें और पुरानी images बिना बदलाव के चलती रहेंगी।
