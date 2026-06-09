import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);
const TOKEN_KEY = "lioneyo-admin-token";

const fallbackContent = {
  brand: {
    name: "LIONEYO",
    tagline: "Streetwear rebuilt for clean deployment",
    whatsapp: "https://wa.me/919999999999",
    email: "mailto:hello@lioneyo.com",
  },
  hero: {
    eyebrow: "Fresh Build. Better Foundation.",
    title: "Streetwear store that looks sharp and is actually easy to deploy.",
    description:
      "Yeh naya version static-first hai, isliye Hostinger par direct chal sakta hai. Jab ready ho, hum backend aur payments baad me clean tareeke se add kar denge.",
    primaryCta: "Explore Drops",
    secondaryCta: "Setup My Store",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    spotlight:
      "Campus streetwear with premium energy, not template vibes.",
  },
  products: [
    {
      id: 1,
      name: "Voltage Oversized Tee",
      category: "Oversized",
      price: 1499,
      tag: "Best Seller",
      color: "Midnight Black",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "IIT Core Hoodie",
      category: "Campus",
      price: 2499,
      tag: "New Drop",
      color: "Concrete Grey",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Shinobi Panel Tee",
      category: "Anime",
      price: 1699,
      tag: "Limited",
      color: "Deep Indigo",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    },
  ],
  collections: [
    {
      id: 1,
      name: "Campus Code",
      subtitle:
        "Smart, clean essentials for college days that still feel premium.",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      name: "Oversized Motion",
      subtitle:
        "Relaxed silhouettes with strong graphics and heavyweight feel.",
      image:
        "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Anime Signal",
      subtitle:
        "Graphic-led drops made for fans who want edge, not costume.",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    },
  ],
  reviews: [
    {
      id: 1,
      name: "Aarav",
      text: "Yeh finally aisi brand feel hoti hai jo student budget aur premium vibe dono balance karti hai.",
    },
    {
      id: 2,
      name: "Riya",
      text: "Fabric aur layout dono classy lage. Website bhi fast hai aur products clear dikhte hain.",
    },
    {
      id: 3,
      name: "Ishaan",
      text: "Mujhe direct no-noise store chahiye tha. Is version me woh clean confidence aa raha hai.",
    },
  ],
  steps: [
    "Drop choose karo",
    "WhatsApp ya Instagram par order confirm karo",
    "Manual payment ya COD flow set karo",
    "Delivery updates directly share karo",
  ],
};

const categories = ["All", "Oversized", "Campus", "Anime", "Drops"];

function absoluteMedia(url) {
  if (!url) {
    return "";
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_URL}${url}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function SiteLayout({ children, brand }) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">L</span>
          <span className="brand-copy">
            <strong>{brand.name}</strong>
            <small>{brand.tagline}</small>
          </span>
        </a>

        <nav className="topnav">
          <a href="#shop">Shop</a>
          <a href="#collections">Collections</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

function Storefront({ content }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") {
      return content.products;
    }

    return content.products.filter((product) => product.category === activeCategory);
  }, [activeCategory, content.products]);

  return (
    <SiteLayout brand={content.brand}>
      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className="hero-text">{content.hero.description}</p>

            <div className="hero-actions">
              <a className="button button-primary" href="#shop">
                {content.hero.primaryCta}
              </a>
              <a className="button button-secondary" href="#contact">
                {content.hero.secondaryCta}
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{String(content.products.length).padStart(2, "0")}</strong>
                <span>Launch-ready products</span>
              </div>
              <div>
                <strong>{String(content.collections.length).padStart(2, "0")}</strong>
                <span>Focused collections</span>
              </div>
              <div>
                <strong>01</strong>
                <span>Admin-connected backend</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div
              className="hero-card hero-card-large"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(22, 25, 32, 0.22), rgba(22, 25, 32, 0.95)), url(${absoluteMedia(content.hero.image)})`,
              }}
            >
              <p>Hero Image</p>
              <h2>{content.hero.spotlight}</h2>
            </div>
            <div className="hero-grid">
              <div className="hero-card">
                <p>Launch Stack</p>
                <strong>React + FastAPI</strong>
              </div>
              <div className="hero-card">
                <p>Admin Ready</p>
                <strong>Live CMS Save</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="shop">
          <div className="section-heading">
            <p className="eyebrow">Shop</p>
            <h2>Start with a clean product catalog</h2>
            <p>
              Hero image, products, collections aur brand links sab backend admin se
              editable hain.
            </p>
          </div>

          <div className="filter-row">
            {categories.map((category) => (
              <button
                key={category}
                className={category === activeCategory ? "chip chip-active" : "chip"}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div
                  className="product-art"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(22, 25, 32, 0.38)), url(${absoluteMedia(product.image)})`,
                  }}
                >
                  <span>{product.tag}</span>
                </div>
                <div className="product-copy">
                  <div className="product-meta">
                    <p>{product.category}</p>
                    <strong>{product.name}</strong>
                  </div>
                  <p className="product-color">{product.color}</p>
                  <div className="product-footer">
                    <strong>Rs. {product.price}</strong>
                    <a href="#contact">Order Now</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section alt-section" id="collections">
          <div className="section-heading">
            <p className="eyebrow">Collections</p>
            <h2>Three directions, one stronger identity</h2>
          </div>

          <div className="collection-grid">
            {content.collections.map((collection, index) => (
              <article
                className="collection-card"
                key={collection.id}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(17, 19, 26, 0.72)), url(${absoluteMedia(collection.image)})`,
                }}
              >
                <p className="collection-index">0{index + 1}</p>
                <h3>{collection.name}</h3>
                <p>{collection.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="reviews">
          <div className="section-heading">
            <p className="eyebrow">Feedback</p>
            <h2>What this rebuild improves</h2>
          </div>

          <div className="review-grid">
            {content.reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <p>{review.text}</p>
                <strong>{review.name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="section process-section">
          <div className="section-heading">
            <p className="eyebrow">Launch Process</p>
            <h2>Simple order flow for day one</h2>
          </div>

          <div className="steps-grid">
            {content.steps.map((step, index) => (
              <article className="step-card" key={step}>
                <span>0{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section cta-section" id="contact">
          <div className="cta-copy">
            <p className="eyebrow">Next</p>
            <h2>Ready for your real brand details and product images</h2>
            <p>Admin panel me save karte hi live frontend content update ho jayega.</p>
          </div>

          <div className="cta-actions">
            <a
              className="button button-primary"
              href={content.brand.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp CTA
            </a>
            <a className="button button-secondary" href={content.brand.email}>
              Email CTA
            </a>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function LoginForm({ onLogin, error, busy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="admin-shell">
      <section className="admin-card admin-login">
        <p className="eyebrow">Admin Login</p>
        <h1>Backend CMS access</h1>
        <p className="admin-note">
          Is page se real backend admin panel open hoga jahan hero image aur sab
          content save hoga.
        </p>

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="button button-primary"
          type="button"
          onClick={() => onLogin(email, password)}
          disabled={busy}
        >
          {busy ? "Signing In..." : "Sign In"}
        </button>
      </section>
    </div>
  );
}

function AdminPanel({ content, token, onSave, onReset, onLogout }) {
  const [draft, setDraft] = useState(content);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");

  function updateHero(field, value) {
    setDraft((current) => ({
      ...current,
      hero: { ...current.hero, [field]: value },
    }));
  }

  function updateBrand(field, value) {
    setDraft((current) => ({
      ...current,
      brand: { ...current.brand, [field]: value },
    }));
  }

  function updateProduct(index, field, value) {
    setDraft((current) => ({
      ...current,
      products: current.products.map((product, productIndex) =>
        productIndex === index ? { ...product, [field]: value } : product,
      ),
    }));
  }

  function updateCollection(index, field, value) {
    setDraft((current) => ({
      ...current,
      collections: current.collections.map((collection, collectionIndex) =>
        collectionIndex === index ? { ...collection, [field]: value } : collection,
      ),
    }));
  }

  async function uploadImage(file, onSuccess, key) {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploadingKey(key);
    setStatus("");

    try {
      const response = await fetch(`${API_URL}/api/admin/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onSuccess(data.url);
      setStatus("Image uploaded successfully.");
    } catch (error) {
      setStatus(error.message || "Upload failed");
    } finally {
      setUploadingKey("");
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      await onSave(draft);
      setStatus("Changes saved.");
    } catch (error) {
      setStatus(error.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Hero image aur frontend content edit karo</h1>
          <p className="admin-note">
            Ye panel backend par save karta hai. Image URL manually bhi daal sakte ho
            aur direct upload bhi kar sakte ho.
          </p>
        </div>
        <div className="admin-actions">
          <Link className="button button-secondary" to="/">
            View Site
          </Link>
          <button className="button button-secondary" onClick={onReset} type="button">
            Reset Demo Data
          </button>
          <button className="button button-secondary" onClick={onLogout} type="button">
            Logout
          </button>
          <button
            className="button button-primary"
            onClick={handleSave}
            type="button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {status ? <p className="admin-flash">{status}</p> : null}

      <div className="admin-grid">
        <section className="admin-card">
          <h2>Brand</h2>
          <label>
            Brand Name
            <input
              value={draft.brand.name}
              onChange={(event) => updateBrand("name", event.target.value)}
            />
          </label>
          <label>
            Tagline
            <input
              value={draft.brand.tagline}
              onChange={(event) => updateBrand("tagline", event.target.value)}
            />
          </label>
          <label>
            WhatsApp Link
            <input
              value={draft.brand.whatsapp}
              onChange={(event) => updateBrand("whatsapp", event.target.value)}
            />
          </label>
          <label>
            Email Link
            <input
              value={draft.brand.email}
              onChange={(event) => updateBrand("email", event.target.value)}
            />
          </label>
        </section>

        <section className="admin-card">
          <h2>Hero</h2>
          <label>
            Eyebrow
            <input
              value={draft.hero.eyebrow}
              onChange={(event) => updateHero("eyebrow", event.target.value)}
            />
          </label>
          <label>
            Title
            <textarea
              rows="3"
              value={draft.hero.title}
              onChange={(event) => updateHero("title", event.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              rows="4"
              value={draft.hero.description}
              onChange={(event) => updateHero("description", event.target.value)}
            />
          </label>
          <label>
            Hero Image URL
            <input
              value={draft.hero.image}
              onChange={(event) => updateHero("image", event.target.value)}
            />
          </label>
          <label className="upload-field">
            Upload Hero Image
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                uploadImage(
                  event.target.files?.[0],
                  (url) => updateHero("image", url),
                  "hero",
                )
              }
            />
            <span>{uploadingKey === "hero" ? "Uploading..." : "Choose image"}</span>
          </label>
          <label>
            Spotlight Text
            <textarea
              rows="2"
              value={draft.hero.spotlight}
              onChange={(event) => updateHero("spotlight", event.target.value)}
            />
          </label>
        </section>
      </div>

      <section className="admin-card admin-card-wide">
        <h2>Products</h2>
        <div className="admin-list">
          {draft.products.map((product, index) => (
            <div className="admin-item" key={product.id}>
              <label>
                Product Name
                <input
                  value={product.name}
                  onChange={(event) => updateProduct(index, "name", event.target.value)}
                />
              </label>
              <label>
                Category
                <input
                  value={product.category}
                  onChange={(event) =>
                    updateProduct(index, "category", event.target.value)
                  }
                />
              </label>
              <label>
                Tag
                <input
                  value={product.tag}
                  onChange={(event) => updateProduct(index, "tag", event.target.value)}
                />
              </label>
              <label>
                Color
                <input
                  value={product.color}
                  onChange={(event) => updateProduct(index, "color", event.target.value)}
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={product.price}
                  onChange={(event) =>
                    updateProduct(index, "price", Number(event.target.value))
                  }
                />
              </label>
              <label className="field-span">
                Product Image URL
                <input
                  value={product.image}
                  onChange={(event) => updateProduct(index, "image", event.target.value)}
                />
              </label>
              <label className="upload-field field-span">
                Upload Product Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    uploadImage(
                      event.target.files?.[0],
                      (url) => updateProduct(index, "image", url),
                      `product-${product.id}`,
                    )
                  }
                />
                <span>
                  {uploadingKey === `product-${product.id}`
                    ? "Uploading..."
                    : "Choose image"}
                </span>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card admin-card-wide">
        <h2>Collections</h2>
        <div className="admin-list">
          {draft.collections.map((collection, index) => (
            <div className="admin-item" key={collection.id}>
              <label>
                Collection Name
                <input
                  value={collection.name}
                  onChange={(event) =>
                    updateCollection(index, "name", event.target.value)
                  }
                />
              </label>
              <label className="field-span">
                Subtitle
                <textarea
                  rows="3"
                  value={collection.subtitle}
                  onChange={(event) =>
                    updateCollection(index, "subtitle", event.target.value)
                  }
                />
              </label>
              <label className="field-span">
                Collection Image URL
                <input
                  value={collection.image}
                  onChange={(event) =>
                    updateCollection(index, "image", event.target.value)
                  }
                />
              </label>
              <label className="upload-field field-span">
                Upload Collection Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    uploadImage(
                      event.target.files?.[0],
                      (url) => updateCollection(index, "image", url),
                      `collection-${collection.id}`,
                    )
                  }
                />
                <span>
                  {uploadingKey === `collection-${collection.id}`
                    ? "Uploading..."
                    : "Choose image"}
                </span>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [content, setContent] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function fetchContent() {
    try {
      const data = await apiRequest("/api/content");
      setContent(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContent().catch(() => setLoading(false));
  }, []);

  async function handleLogin(email, password) {
    setLoginBusy(true);
    setLoginError("");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (error) {
      setLoginError(error.message || "Login failed");
    } finally {
      setLoginBusy(false);
    }
  }

  async function saveContent(nextContent) {
    const data = await apiRequest("/api/admin/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nextContent),
    });
    setContent(data);
  }

  async function resetContent() {
    const data = await apiRequest("/api/admin/reset", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setContent(data);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  }

  if (loading) {
    return <div className="screen-state">Loading site...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Storefront content={content} />} />
      <Route
        path="/admin"
        element={
          token ? (
            <AdminPanel
              key={JSON.stringify(content)}
              content={content}
              token={token}
              onSave={saveContent}
              onReset={resetContent}
              onLogout={logout}
            />
          ) : (
            <LoginForm onLogin={handleLogin} error={loginError} busy={loginBusy} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
