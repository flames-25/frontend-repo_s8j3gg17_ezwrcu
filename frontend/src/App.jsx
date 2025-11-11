import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

const COLORS = {
  bg: "#F9F9F9",
  card: "#EDEDED",
  dark: "#2F343A",
  accent: "#8E96AA",
};

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("br_token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("br_token", token);
      apiRequest("/auth/me", { token })
        .then((u) => setUser(u))
        .catch(() => setUser(null));
    } else {
      localStorage.removeItem("br_token");
      setUser(null);
    }
  }, [token]);

  const logout = () => setToken("");

  return { token, setToken, user, setUser, logout };
}

function Navbar({ route, setRoute, onLogout, user }) {
  const Link = ({ to, children }) => (
    <button
      onClick={() => setRoute(to)}
      className={`px-4 py-2 rounded-xl transition-colors ${
        route === to ? "bg-white/10 text-white" : "text-white/80 hover:text-white"
      }`}
    >
      {children}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-[#2F343A]/90 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold">BR</div>
          <span className="font-semibold text-white text-lg">Bina Ragam</span>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-white/80 hidden sm:block">Hi, {user.name}</span>
              <button onClick={onLogout} className="px-4 py-2 rounded-xl bg-[#8E96AA] text-[#2F343A] font-medium hover:opacity-90">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setRoute("/login")} className="px-4 py-2 rounded-xl text-white/90 hover:text-white">Login</button>
              <button onClick={() => setRoute("/register")} className="px-4 py-2 rounded-xl bg-white text-[#2F343A] font-medium">Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-20 bg-[#2F343A] text-white/80">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold">BR</div>
            <span className="font-semibold text-white text-lg">Bina Ragam</span>
          </div>
          <p className="text-sm">Platform display produk elegan untuk menampilkan ragam pilihan dan redirect ke marketplace.</p>
        </div>
        <div className="sm:text-right">
          <p>Follow kami:</p>
          <div className="mt-2 flex sm:justify-end gap-3">
            <a className="hover:text-white" href="#">Instagram</a>
            <a className="hover:text-white" href="#">TikTok</a>
            <a className="hover:text-white" href="#">Shopee</a>
            <a className="hover:text-white" href="#">Tokopedia</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} Bina Ragam. All rights reserved.</div>
    </footer>
  );
}

function Hero({ toShop }) {
  return (
    <section className="relative bg-[#F9F9F9]">
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2F343A] leading-tight">Tampilkan Produk Anda Dengan Gaya Modern</h1>
          <p className="mt-4 text-[#8E96AA] text-lg">Bina Ragam adalah platform display semi-ecommerce yang elegan, minimalis, dan profesional. Pembelian dialihkan ke marketplace pilihan Anda.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={toShop} className="px-6 py-3 rounded-2xl bg-[#2F343A] text-white font-medium hover:opacity-90">Lihat Produk</button>
            <a href="#" className="px-6 py-3 rounded-2xl bg-[#8E96AA] text-[#2F343A] font-medium hover:opacity-95">Tokopedia</a>
            <a href="#" className="px-6 py-3 rounded-2xl bg-white text-[#2F343A] border border-[#EDEDED]">Shopee</a>
          </div>
        </div>
        <div className="bg-[#EDEDED] rounded-2xl h-72 md:h-96" />
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const hasDiscount = product.discount && product.discount.active;
  const price = product.price ?? 0;
  const discounted = hasDiscount ? price * (1 - product.discount.percentage / 100) : price;
  return (
    <div className="rounded-2xl bg-white border border-[#EDEDED] overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-[#EDEDED]" style={{ backgroundImage: `url(${product.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="p-4">
        <h3 className="font-semibold text-[#2F343A] line-clamp-1">{product.name}</h3>
        <p className="text-sm text-[#8E96AA] line-clamp-2 mt-1">{product.description}</p>
        <div className="mt-3 flex items-baseline gap-2">
          {hasDiscount && <span className="text-[#8E96AA] line-through">Rp {price.toLocaleString()}</span>}
          <span className="text-lg font-semibold text-[#2F343A]">Rp {discounted.toLocaleString()}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <a href={product.marketplace_link || "#"} target="_blank" className="flex-1 text-center px-4 py-2 rounded-xl bg-[#2F343A] text-white">Lihat di Marketplace</a>
          <a href={`#product/${product.id}`} className="px-4 py-2 rounded-xl bg-[#8E96AA] text-[#2F343A]">Detail</a>
        </div>
      </div>
    </div>
  );
}

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  useEffect(() => {
    apiRequest(`/products?q=${encodeURIComponent(q)}&min_price=${min || ""}&max_price=${max || ""}`)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [q, min, max]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-2xl bg-white border border-[#EDEDED] p-4 flex flex-col sm:flex-row gap-3 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk..." className="flex-1 px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] outline-none" />
        <div className="flex gap-2 w-full sm:w-auto">
          <input value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" className="w-28 px-3 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED]" />
          <input value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max" className="w-28 px-3 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED]" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (<ProductCard key={p.id} product={p} />))}
      </div>
    </div>
  );
}

function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  useEffect(() => {
    if (!id) return;
    apiRequest(`/products/${id}`).then(setProduct).catch(() => setProduct(null));
  }, [id]);
  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 py-10">Memuat...</div>
  );
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div className="rounded-2xl bg-[#EDEDED] aspect-square" style={{ backgroundImage: `url(${product.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div>
        <h1 className="text-3xl font-bold text-[#2F343A]">{product.name}</h1>
        <p className="mt-3 text-[#8E96AA]">{product.description}</p>
        <div className="mt-4 text-2xl font-semibold text-[#2F343A]">Rp {Number(product.price||0).toLocaleString()}</div>
        <div className="mt-6 flex gap-3">
          <a href={product.marketplace_link || "#"} target="_blank" className="px-6 py-3 rounded-2xl bg-[#2F343A] text-white">Lihat di Marketplace</a>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-[#2F343A]">Tentang Bina Ragam</h2>
      <p className="mt-4 text-[#8E96AA] leading-relaxed">Bina Ragam adalah platform display produk semi-ecommerce yang membantu brand menampilkan katalog mereka dengan desain modern dan pengalaman pengguna yang rapi. Pembelian dilakukan melalui marketplace seperti Shopee atau Tokopedia.</p>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-[#2F343A]">Kontak</h2>
      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#EDEDED] p-6">
          <p className="text-[#8E96AA]">Email</p>
          <p className="font-medium text-[#2F343A]">hello@binaragam.com</p>
          <p className="text-[#8E96AA] mt-4">Instagram</p>
          <p className="font-medium text-[#2F343A]">@binaragam</p>
        </div>
        <form className="rounded-2xl bg-white border border-[#EDEDED] p-6">
          <input placeholder="Nama" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED]" />
          <input placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
          <textarea placeholder="Pesan" rows="4" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
          <button type="button" className="mt-3 px-5 py-3 rounded-2xl bg-[#2F343A] text-white">Kirim</button>
        </form>
      </div>
    </div>
  );
}

function LoginPage({ setToken, setRoute }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setToken(data.access_token);
      setRoute("/");
    } catch (e) {
      setErr("Login gagal");
    }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-[#2F343A]">Masuk</h2>
      {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
      <form onSubmit={submit} className="mt-6 rounded-2xl bg-white border border-[#EDEDED] p-6">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED]" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
        <button className="w-full mt-4 px-5 py-3 rounded-2xl bg-[#2F343A] text-white">Login</button>
      </form>
    </div>
  );
}

function RegisterPage({ setRoute }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await apiRequest("/auth/register", { method: "POST", body: { name, email, password } });
      setRoute("/login");
    } catch (e) {
      setErr("Registrasi gagal");
    }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-[#2F343A]">Daftar</h2>
      {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
      <form onSubmit={submit} className="mt-6 rounded-2xl bg-white border border-[#EDEDED] p-6">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nama" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED]" />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
        <button className="w-full mt-4 px-5 py-3 rounded-2xl bg-[#2F343A] text-white">Daftar</button>
      </form>
    </div>
  );
}

function AdminPage({ token }) {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");

  const load = async () => {
    try { setProducts(await apiRequest("/products")); } catch {}
    try { setUsers(await apiRequest("/users", { token })); } catch {}
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await apiRequest("/products", { method: "POST", token, body: { name, price: parseFloat(price||0), image_url: image, description: desc, marketplace_link: link } });
    setName(""); setPrice(""); setImage(""); setDesc(""); setLink("");
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex gap-2">
        <button onClick={()=>setTab("products")} className={`px-4 py-2 rounded-xl ${tab==='products'?'bg-[#2F343A] text-white':'bg-white border border-[#EDEDED]'}`}>Produk</button>
        <button onClick={()=>setTab("users")} className={`px-4 py-2 rounded-xl ${tab==='users'?'bg-[#2F343A] text-white':'bg-white border border-[#EDEDED]'}`}>Users</button>
      </div>
      {tab === 'products' && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <form onSubmit={create} className="rounded-2xl bg-white border border-[#EDEDED] p-6">
            <h3 className="font-semibold text-[#2F343A] mb-4">Tambah Produk</h3>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nama" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED]" />
            <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Harga" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
            <input value={image} onChange={(e)=>setImage(e.target.value)} placeholder="URL Gambar" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
            <input value={link} onChange={(e)=>setLink(e.target.value)} placeholder="Link Marketplace" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
            <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Deskripsi" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#EDEDED] mt-3" />
            <button className="mt-4 px-5 py-3 rounded-2xl bg-[#2F343A] text-white">Simpan</button>
          </form>
          <div>
            <h3 className="font-semibold text-[#2F343A] mb-4">Daftar Produk</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="rounded-2xl bg-white border border-[#EDEDED] p-4">
                  <div className="font-medium text-[#2F343A]">{p.name}</div>
                  <div className="text-sm text-[#8E96AA]">Rp {Number(p.price||0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === 'users' && (
        <div className="mt-6 rounded-2xl bg-white border border-[#EDEDED] p-6 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8E96AA]"><th className="py-2">Nama</th><th>Email</th><th>Role</th><th>Dibuat</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-[#EDEDED]"><td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.created_at).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState("/");
  const { token, setToken, user, logout } = useAuth();

  useEffect(() => {
    const nav = () => setRoute(window.location.hash.slice(1) || "/");
    nav();
    window.addEventListener("hashchange", nav);
    return () => window.removeEventListener("hashchange", nav);
  }, []);

  const content = useMemo(() => {
    if (route.startsWith("/shop")) return <ShopPage />;
    if (route.startsWith("/about")) return <AboutPage />;
    if (route.startsWith("/contact")) return <ContactPage />;
    if (route.startsWith("/login")) return <LoginPage setToken={setToken} setRoute={(r)=>{setRoute(r); window.location.hash = r;}}/>;
    if (route.startsWith("/register")) return <RegisterPage setRoute={(r)=>{setRoute(r); window.location.hash = r;}}/>;
    if (route.startsWith("/admin")) return user?.role === "admin" ? <AdminPage token={token} /> : <div className="max-w-6xl mx-auto px-4 py-10">Tidak berizin</div>;
    if (route.startsWith("/product/")) {
      const id = route.split("/product/")[1];
      return <ProductDetail id={id} />;
    }
    return (
      <>
        <Hero toShop={() => { setRoute("/shop"); window.location.hash = "/shop"; }} />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-[#2F343A]">Produk Populer</h2>
          <ShopPage />
        </div>
      </>
    );
  }, [route, user, token]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <Navbar route={route} setRoute={(r)=>{setRoute(r); window.location.hash = r;}} onLogout={logout} user={user} />
      {content}
      <Footer />
    </div>
  );
}
