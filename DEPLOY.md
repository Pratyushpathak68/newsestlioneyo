# Deploy

## Stack

- Frontend: `lioneyo-rebuild` using React + Vite
- Backend: `lioneyo-backend` using FastAPI
- Admin panel: `/admin`
- Images: Cloudflare R2
- Content data: MongoDB

## Local run

### Backend

1. Copy `.env.example` to `.env`
2. Install:
   `pip install -r requirements.txt`
3. Run:
   `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

### Frontend

1. Copy `.env.example` to `.env`
2. Install:
   `npm install`
3. Run:
   `npm run dev`

## Easy deploy path

### Backend

- Deploy `lioneyo-backend` on Render or Railway
- Build command:
  `pip install -r requirements.txt`
- Start command:
  `uvicorn main:app --host 0.0.0.0 --port 10000`

### Frontend

- Put backend URL in `VITE_API_URL`
- Run `npm run build`
- Upload everything inside `dist/` to Hostinger `public_html`
- Keep `.htaccess` in `public_html`

## Admin

- Open `/admin`
- Login with backend `.env` values
- Hero image, products and collections can be updated from the panel
- Image upload stores files in Cloudflare R2
- Content saves in MongoDB `site_content` collection

## Important note

- Create an R2 bucket and public URL before deploying.
- Add MongoDB Atlas connection string in `MONGO_URL`.
