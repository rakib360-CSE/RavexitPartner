import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, CircleCheck, Clapperboard, Code2, Instagram, Layers3, Menu, MessageCircle, Palette, Play, Plus, Quote, Send, Settings2, ShieldCheck, Sparkles, Star, Video, X } from "lucide-react";
import { starterData } from "./data";
import { supabase } from "./supabase";

const clone = (v) => JSON.parse(JSON.stringify(v));
const money = (v, currency) => `${currency || "৳"}${Number(v || 0).toLocaleString("en-BD")}`;
const blankPortfolio = () => ({ id: crypto.randomUUID(), title: "", category: "Creative", description: "", image: "", link: "" });
const blankReview = () => ({ id: crypto.randomUUID(), name: "", company: "", quote: "", rating: 5, photo: "" });
const blankService = () => ({ id: crypto.randomUUID(), name: "", category: "Creative", description: "", price: 0, unit: "project", active: true });

export default function App() {
  const [data, setData] = useState(() => {
    try { return { ...clone(starterData), ...JSON.parse(localStorage.getItem("agency-content") || "{}") }; }
    catch { return clone(starterData); }
  });
  const [selected, setSelected] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);
  useEffect(() => { localStorage.setItem("agency-content", JSON.stringify(data)); }, [data]);
useEffect(() => { localStorage.setItem("agency-orders", JSON.stringify(orders)); }, [orders]);
  
useEffect(() => {
  let cancelled = false;

  async function loadSharedContent() {
    try {
      if (!supabase) {
        setDbLoaded(true);
        return;
      }

      const { data: row, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      if (error) throw error;

      if (!cancelled && row?.content) {
        setData({
          ...clone(starterData),
          ...row.content
        });
      }
    } catch (error) {
      console.error("Failed to load shared content:", error);
    } finally {
      if (!cancelled) setDbLoaded(true);
    }
  }

  loadSharedContent();

  return () => {
    cancelled = true;
  };
}, []);

  const [page, setPage] = useState("home");
  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState("brand");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [order, setOrder] = useState({ name: "", email: "", phone: "", company: "", timeline: "", details: "" });
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("agency-orders") || "[]"));
  const [portfolioDraft, setPortfolioDraft] = useState(null);
  const [reviewDraft, setReviewDraft] = useState(null);
  const [serviceDraft, setServiceDraft] = useState(null);

  useEffect(() => { localStorage.setItem("agency-content", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("agency-orders", JSON.stringify(orders)); }, [orders]);
  const activeServices = data.services.filter(s => s.active);
  const chosen = useMemo(() => activeServices.filter(s => selected.includes(s.id)), [activeServices, selected]);
  const total = chosen.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const updateBrand = (key, value) => setData(d => ({ ...d, brand: { ...d.brand, [key]: value } }));
  const updateSettings = (key, value) => setData(d => ({ ...d, settings: { ...d.settings, [key]: value } }));
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const submitOrder = async (e) => {
    e.preventDefault();
    const newOrder = { ...order, id: crypto.randomUUID(), services: chosen.map(s => ({ id: s.id, name: s.name, price: s.price })), estimate: total, status: "New", createdAt: new Date().toISOString() };
    if (supabase) {
      // Configure the orders table + RLS before enabling live order submissions.
      const { error } = await supabase.from("orders").insert({ customer_name: order.name, email: order.email, phone: order.phone, company: order.company, timeline: order.timeline, details: order.details, selected_services: newOrder.services, estimate: total, status: "New" });
      if (error) { notify("Could not send to database. Check Supabase setup."); return; }
    }
    setOrders(prev => [newOrder, ...prev]); setOrder({ name: "", email: "", phone: "", company: "", timeline: "", details: "" }); setSelected([]);
    notify("Request received! We’ll contact you soon."); setPage("home");
  };
  const nav = [{ id: "services", label: "Services" }, { id: "work", label: "Our work" }, { id: "reviews", label: "Reviews" }, { id: "process", label: "Process" }];
  const go = (p) => { setPage(p); setAdmin(false); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const imageStyle = (url) => url ? { backgroundImage: `linear-gradient(180deg, transparent, rgba(12,13,22,.25)), url("${url}")`, backgroundSize: "cover", backgroundPosition: "center" } : {};

  return <div className="app-shell">
    <div className="announcement">{data.settings.announcement} <span>↗</span></div>
    <header className="topbar">
      <button className="brand" onClick={() => go("home")} aria-label="Go home">
        {data.brand.logo ? <img className="logo-img" src={data.brand.logo} alt="Agency logo" /> : <span className="brand-mark"><Sparkles size={18}/></span>}
        <span>{data.brand.name}<small>CREATIVE STUDIO</small></span>
      </button>
      <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
        {nav.map(n => <button key={n.id} onClick={() => go(n.id)}>{n.label}</button>)}
        <button className="nav-cta" onClick={() => go("builder")}>Build a package <ArrowUpRight size={16}/></button>
      </nav>
      <button className="icon-btn mobile-toggle" onClick={() => setMobileMenu(v => !v)} aria-label="Toggle menu">{mobileMenu ? <X/> : <Menu/>}</button>
    </header>

    {!admin ? <>
      {page === "home" && <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot"/> {data.brand.tagline}</div>
            <h1>{data.brand.headline.split(" ").slice(0, -3).join(" ")} <em>{data.brand.headline.split(" ").slice(-3).join(" ")}</em></h1>
            <p className="hero-sub">{data.brand.subheadline}</p>
            <div className="hero-actions"><button className="primary-btn" onClick={() => go("builder")}>Create your package <ArrowUpRight size={18}/></button><button className="text-btn" onClick={() => go("work")}><span className="play-circle"><Play size={13} fill="currentColor"/></span> Explore our work</button></div>
            <div className="hero-proof"><div className="avatar-stack"><span>✦</span><span>●</span><span>✳</span><span>+</span></div><div><strong>Creative minds, practical results</strong><small>Strategy · Design · Production · Digital</small></div></div>
          </div>
          <div className="hero-visual" style={imageStyle(data.brand.heroImage)}>
            <div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div>
            <div className="hero-floating floating-top"><span className="float-icon purple"><Layers3 size={18}/></span><span><b>Made for your goals</b><small>Flexible by design</small></span><CircleCheck className="float-check" size={19}/></div>
            <div className="hero-art">{data.brand.heroImage ? null : <><div className="art-sun"></div><div className="art-card card-back"></div><div className="art-card card-front"><div className="art-window"><span></span><span></span><span></span></div><div className="art-lines"><i></i><i></i><i></i></div><div className="art-burst">✳</div></div><div className="art-label">MAKE<br/>IT MATTER.</div></>}</div>
            <div className="hero-floating floating-bottom"><span className="float-icon orange"><Video size={18}/></span><span><b>One team. Many skills.</b><small>Built around your brief</small></span></div>
            <div className="visual-index">01 / CREATIVE PARTNERS</div>
          </div>
          <div className="hero-bottom-note"><span>SCROLL TO DISCOVER</span><div className="scroll-line"></div><span>01—04</span></div>
        </section>
        <section className="trust-strip"><span>WHAT WE CAN DO TOGETHER</span><div><b>Strategy</b><i>✳</i><b>Content</b><i>✳</i><b>Design</b><i>✳</i><b>Digital</b><i>✳</i><b>Production</b></div></section>
        <Services data={data} selected={selected} setSelected={setSelected} go={go} />
        <Portfolio data={data} imageStyle={imageStyle} go={go}/>
        <Reviews data={data}/>
        <Process data={data} go={go}/>
        <section className="cta-band section-wrap"><div><span className="eyebrow">YOUR IDEA, OUR NEXT PROJECT</span><h2>Let’s make something <em>worth noticing.</em></h2></div><button className="primary-btn light-btn" onClick={() => go("builder")}>Build your package <ArrowUpRight size={18}/></button><div className="cta-spark">✳</div></section>
      </main>}
      {page === "services" && <main><PageHeading eyebrow="WHAT WE DO" title="Services that move your brand forward." text="Choose the services you need. Every package can be tailored to your goals."/><Services data={data} selected={selected} setSelected={setSelected} go={go}/></main>}
      {page === "work" && <main><PageHeading eyebrow="SELECTED WORK" title="A little of what we do." text="A few examples of the kind of work we love making."/><Portfolio data={data} imageStyle={imageStyle} go={go}/></main>}
      {page === "reviews" && <main><PageHeading eyebrow="KIND WORDS" title="Good work. Good relationships." text="The best measure of our work is how it helps our clients move forward."/><Reviews data={data}/></main>}
      {page === "process" && <main><PageHeading eyebrow="HOW WE WORK" title="Clear steps. No guesswork." text="From the first message to final delivery, you’ll know what comes next."/><Process data={data} go={go}/></main>}
      {page === "builder" && <main><PageHeading eyebrow="YOUR CUSTOM PACKAGE" title="Build a package that fits." text="Select what you need. We’ll use your choices to prepare a tailored proposal."/><section className="builder-layout section-wrap"><div className="builder-services"><div className="builder-toolbar"><span>01 / SELECT SERVICES</span><span>{chosen.length} selected</span></div><div className="service-pick-list">{activeServices.map(s => <button className={selected.includes(s.id) ? "service-pick selected" : "service-pick"} key={s.id} onClick={() => setSelected(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}><span className="pick-check">{selected.includes(s.id) && <Check size={15}/>}</span><span className="pick-copy"><b>{s.name}</b><small>{s.description}</small><em>{s.category} · per {s.unit}</em></span><strong>{data.settings.showPrices ? money(s.price, data.settings.currency) : "Custom"}</strong></button>)}</div><div className="builder-note"><ShieldCheck size={18}/><span><b>No commitment yet.</b> This is an estimate. We’ll confirm scope, timeline, and final pricing with you.</span></div></div><aside className="estimate-card"><span className="eyebrow">YOUR PACKAGE</span><h3>Let’s get started.</h3><p>Your selected services, gathered in one place.</p><div className="estimate-list">{chosen.length ? chosen.map(s => <div key={s.id}><span>{s.name}<small>Per {s.unit}</small></span><b>{data.settings.showPrices ? money(s.price, data.settings.currency) : "TBD"}</b></div>) : <div className="empty-estimate">Select a service to start building your package.</div>}</div><div className="estimate-total"><span>Estimated total</span><strong>{data.settings.showPrices ? money(total, data.settings.currency) : "Custom quote"}</strong></div><button className="primary-btn full-btn" onClick={() => { if (!chosen.length) { notify("Please select at least one service."); return; } setPage("order"); window.scrollTo(0,0); }}>Continue to brief <ArrowUpRight size={17}/></button><small className="estimate-foot">Final quote confirmed after consultation.</small></aside></section></main>}
      {page === "order" && <main><PageHeading eyebrow="PROJECT BRIEF" title="Tell us a little about your project." text="Leave your details and we’ll follow up to discuss the best next step."/><section className="order-layout section-wrap"><form className="order-form" onSubmit={submitOrder}><div className="form-grid"><label>Your name *<input required value={order.name} onChange={e => setOrder({...order, name:e.target.value})} placeholder="Full name"/></label><label>Email address *<input required type="email" value={order.email} onChange={e => setOrder({...order, email:e.target.value})} placeholder="you@company.com"/></label><label>Phone / WhatsApp *<input required value={order.phone} onChange={e => setOrder({...order, phone:e.target.value})} placeholder="+880..."/></label><label>Company / brand<input value={order.company} onChange={e => setOrder({...order, company:e.target.value})} placeholder="Your business name"/></label><label className="wide-label">Ideal timeline<select value={order.timeline} onChange={e => setOrder({...order, timeline:e.target.value})}><option value="">Select a timeline</option><option>As soon as possible</option><option>Within 2–4 weeks</option><option>Within 1–2 months</option><option>Flexible / not sure</option></select></label><label className="wide-label">Tell us about your project<textarea rows="5" value={order.details} onChange={e => setOrder({...order, details:e.target.value})} placeholder="Goals, audience, deliverables, references, or anything else we should know..."/></label></div><button className="primary-btn" type="submit">Send project request <Send size={17}/></button><p className="form-disclaimer">Your request is not a confirmed booking. We’ll contact you to discuss details.</p></form><aside className="order-summary"><span className="eyebrow">REQUEST SUMMARY</span><h3>Your package</h3>{chosen.map(s => <div className="summary-row" key={s.id}><span>{s.name}</span><b>{data.settings.showPrices ? money(s.price, data.settings.currency) : "TBD"}</b></div>)}<div className="estimate-total"><span>Estimate</span><strong>{data.settings.showPrices ? money(total, data.settings.currency) : "Custom quote"}</strong></div><p>Questions first? Contact us at <a href={`mailto:${data.brand.email}`}>{data.brand.email}</a> or {data.brand.phone}.</p><button className="text-btn" onClick={() => setPage("builder")}>← Edit selected services</button></aside></section></main>}
      <Footer data={data} go={go} openAdmin={() => {setAdmin(true); setTab("brand"); window.scrollTo(0,0);}}/>
    </> : <Admin data={data} setData={setData} tab={tab} setTab={setTab} close={() => setAdmin(false)} updateBrand={updateBrand} updateSettings={updateSettings} orders={orders} setOrders={setOrders} notify={notify} portfolioDraft={portfolioDraft} setPortfolioDraft={setPortfolioDraft} reviewDraft={reviewDraft} setReviewDraft={setReviewDraft} serviceDraft={serviceDraft} setServiceDraft={setServiceDraft}/>}
    {toast && <div className="toast"><CircleCheck size={18}/>{toast}</div>}
  </div>;
}

function PageHeading({eyebrow,title,text}) { return <section className="page-heading section-wrap"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></section>; }
function Services({data, selected, setSelected, go}) {
  const icons = [<Layers3/>,<Clapperboard/>,<Video/>,<Code2/>,<Palette/>,<Sparkles/>];
  return <section className="services-section section-wrap" id="services"><div className="section-heading"><div><span className="eyebrow">WHAT WE BRING</span><h2>One studio. <em>Many possibilities.</em></h2></div><p>Pick one service or combine a few. Your package should fit your business, not the other way around.</p></div><div className="service-grid">{data.services.filter(s=>s.active).map((s,i)=><article className="service-card" key={s.id}><div className="service-card-top"><span className={`service-icon icon-${i%6}`}>{icons[i%6]}</span><span className="service-number">0{i+1}</span></div><h3>{s.name}</h3><p>{s.description}</p><div className="service-card-bottom"><div><small>STARTING FROM</small><strong>{data.settings.showPrices ? money(s.price,data.settings.currency) : "Custom quote"}<small> / {s.unit}</small></strong></div><button className="round-arrow" aria-label={`Select ${s.name}`} onClick={()=>{setSelected(prev=>prev.includes(s.id)?prev:[...prev,s.id]);go("builder");}}><ArrowUpRight size={19}/></button></div></article>)}</div><div className="section-link-row"><span>Not sure what you need? We can help you figure it out.</span><button className="text-btn" onClick={()=>go("builder")}>Build your own package <ArrowUpRight size={16}/></button></div></section>;
}
function Portfolio({data,imageStyle,go}) {
  return <section className="portfolio-section section-wrap" id="work"><div className="section-heading"><div><span className="eyebrow">A FEW GOOD PROJECTS</span><h2>Work with <em>a point of view.</em></h2></div><p>Different challenges, thoughtful ideas, and work made with care.</p></div><div className="portfolio-grid">{data.portfolio.map((p,i)=><article className={`project-card project-${i%3}`} key={p.id}><div className="project-image" style={imageStyle(p.image)}>{!p.image && <div className={`project-art art-${i%3}`}><span>{i===0?"N°01":i===1?"PLAY / REPLAY":"DIGITAL FIRST"}</span><b>{i===0?"Make a mark.":i===1?"Stories move us.":"A better way in."}</b><i>✳</i></div>}<span className="project-category">{p.category}</span>{p.link && <a className="project-open" href={p.link} target="_blank" rel="noreferrer" aria-label="Open project"><ArrowUpRight/></a>}</div><div className="project-caption"><div><h3>{p.title}</h3><p>{p.description}</p></div><span>0{i+1}</span></div></article>)}</div><div className="portfolio-bottom"><span>Have a project in mind?</span><button className="text-btn" onClick={()=>go("builder")}>Let’s talk about it <ArrowUpRight size={16}/></button></div></section>;
}
function Reviews({data}) {
  return <section className="reviews-section section-wrap" id="reviews"><div className="section-heading"><div><span className="eyebrow">KIND WORDS</span><h2>Good people. <em>Good partnerships.</em></h2></div><p>Collaboration works best when everyone feels heard.</p></div><div className="review-grid">{data.reviews.map(r=><article className="review-card" key={r.id}><div className="review-stars">{Array.from({length:Math.max(0,Math.min(5,Number(r.rating)||0))}).map((_,i)=><Star size={15} fill="currentColor" key={i}/>)}</div><Quote className="quote-mark" size={25}/><blockquote>{r.quote}</blockquote><div className="review-person">{r.photo?<img src={r.photo} alt=""/>:<div className="review-avatar">{r.name?.charAt(0)||"C"}</div>}<div><b>{r.name}</b><small>{r.company}</small></div></div></article>)}</div></section>;
}
function Process({data,go}) {
  return <section className="process-section section-wrap" id="process"><div className="section-heading"><div><span className="eyebrow">A SIMPLE PROCESS</span><h2>From “what if” to <em>what’s next.</em></h2></div><p>Good collaboration starts with a clear plan and grows from there.</p></div><div className="process-grid">{data.process.map((p,i)=><article key={p.title} className="process-card"><span className="process-index">0{i+1}<span> / STEP</span></span><div className="process-line"></div><h3>{p.title}</h3><p>{p.text}</p></article>)}</div><div className="process-action"><span>Ready to take the first step?</span><button className="primary-btn" onClick={()=>go("builder")}>Start a project <ArrowUpRight size={17}/></button></div></section>;
}
function Footer({data,go,openAdmin}) {
  return <footer className="footer"><div className="footer-main section-wrap"><div className="footer-brand"><button className="brand footer-logo" onClick={()=>go("home")}><span className="brand-mark"><Sparkles size={18}/></span><span>{data.brand.name}<small>CREATIVE STUDIO</small></span></button><p>{data.brand.footerText}</p><div className="social-links"><a href={`https://wa.me/${(data.brand.phone||"").replace(/\D/g,"")}`} aria-label="WhatsApp"><MessageCircle size={17}/></a><a href="#" aria-label="Instagram"><Instagram size={17}/></a><a href={`mailto:${data.brand.email}`} aria-label="Email"><Send size={17}/></a></div></div><div className="footer-col"><b>EXPLORE</b><button onClick={()=>go("services")}>Services</button><button onClick={()=>go("work")}>Our work</button><button onClick={()=>go("reviews")}>Reviews</button><button onClick={()=>go("process")}>Our process</button></div><div className="footer-col"><b>LET’S CONNECT</b><a href={`mailto:${data.brand.email}`}>{data.brand.email}</a><a href={`tel:${data.brand.phone}`}>{data.brand.phone}</a><span>{data.brand.address}</span></div><div className="footer-contact"><span className="eyebrow">HAVE SOMETHING IN MIND?</span><h3>Let’s make it happen.</h3><button className="primary-btn" onClick={()=>go("builder")}>Create a package <ArrowUpRight size={17}/></button></div></div><div className="footer-bottom section-wrap"><span>© {new Date().getFullYear()} {data.brand.name}. All rights reserved.</span><span>Made with intention. <button onClick={openAdmin} className="admin-entry">Admin</button></span></div></footer>;
}

function Admin({data,setData,tab,setTab,close,updateBrand,updateSettings,orders,setOrders,notify,portfolioDraft,setPortfolioDraft,reviewDraft,setReviewDraft,serviceDraft,setServiceDraft}) {
  const [password,setPassword] = useState("");
  const [unlocked,setUnlocked] = useState(sessionStorage.getItem("agency-admin-demo")==="yes");
  const [storageMode,setStorageMode] = useState("local");
  const [jsonText,setJsonText] = useState("");
  const tabs = [{id:"brand",label:"Brand & content"},{id:"services",label:"Services"},{id:"portfolio",label:"Portfolio"},{id:"reviews",label:"Reviews"},{id:"process",label:"Process"},{id:"orders",label:"Orders"},{id:"backup",label:"Backup / live setup"}];
  const setList = (key, list) => setData(d=>({...d,[key]:list}));
  const updateItem = (key,id,patch) => setList(key,data[key].map(item=>item.id===id?{...item,...patch}:item));
  const removeItem = (key,id) => { if(confirm("Delete this item?")) setList(key,data[key].filter(item=>item.id!==id)); };
  const saveDraft = (key,draft,setDraft) => { if(!draft) return; if(!draft.name && key==="reviews") {notify("Add a client name first.");return;} if(!draft.title && key==="portfolio") {notify("Add a project title first.");return;} if(!draft.name && key==="services") {notify("Add a service name first.");return;} setList(key,[...data[key],draft]);setDraft(null);notify("Item added."); };
  const imageField = (label,value,onChange) => <label className="admin-field">{label}<input value={value||""} onChange={e=>onChange(e.target.value)} placeholder="Paste an image URL (or upload after Supabase setup)"/><small>For local preview, use an image URL. Supabase Storage upload is described in README.</small>{value && <img className="admin-image-preview" src={value} alt="Preview"/>}</label>;
  if(!unlocked) return <div className="admin-login"><div className="login-card"><span className="brand-mark"><Settings2/></span><span className="eyebrow">SITE MANAGEMENT</span><h1>Admin workspace</h1><p>This starter’s admin is a local demo. Set your own authentication before publishing.</p><form onSubmit={e=>{e.preventDefault();if(password==="ican-demo"){setUnlocked(true);sessionStorage.setItem("agency-admin-demo","yes");}else notify("Demo password is incorrect.");}}><label>Demo password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter demo password"/></label><button className="primary-btn full-btn">Open admin <ArrowUpRight size={17}/></button></form><small>Demo password: <b>ican-demo</b> (change/remove before deployment)</small><button className="text-btn" onClick={close}>← Back to website</button></div></div>;
  return <div className="admin-shell"><aside className="admin-sidebar"><button className="brand" onClick={close}><span className="brand-mark"><Sparkles size={18}/></span><span>{data.brand.name}<small>ADMIN WORKSPACE</small></span></button><div className="admin-side-label">MANAGE WEBSITE</div>{tabs.map(t=><button key={t.id} className={tab===t.id?"admin-tab active":"admin-tab"} onClick={()=>setTab(t.id)}>{t.label}{t.id==="orders"&&orders.length>0&&<span className="order-count">{orders.length}</span>}</button>)}<button className="admin-preview" onClick={close}>← View website</button></aside><main className="admin-content"><div className="admin-top"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h1>{tabs.find(t=>t.id===tab)?.label}</h1></div><span className="local-pill"><span></span>{storageMode==="local"?"Local preview mode":"Supabase mode"}</span></div>
    {tab==="brand"&&<div className="admin-panel"><h2>Brand identity</h2><p>Update the main text, contact details, and images used throughout the site.</p><div className="admin-form-grid">{[["name","Agency / company name"],["tagline","Tagline"],["headline","Hero headline"],["subheadline","Hero description"],["phone","Phone / WhatsApp"],["email","Email address"],["address","Address"],["logo","Logo image URL"],["heroImage","Hero image URL"],["footerText","Footer text"]].map(([key,label])=><label className="admin-field" key={key}>{label}{["subheadline","headline","footerText"].includes(key)?<textarea rows="2" value={data.brand[key]||""} onChange={e=>updateBrand(key,e.target.value)}/>:<input value={data.brand[key]||""} onChange={e=>updateBrand(key,e.target.value)}/>}</label>)}</div><div className="admin-divider"/><h2>Site preferences</h2><div className="admin-form-grid"><label className="admin-field">Currency symbol<input value={data.settings.currency} onChange={e=>updateSettings("currency",e.target.value)}/></label><label className="admin-field">Announcement bar<input value={data.settings.announcement} onChange={e=>updateSettings("announcement",e.target.value)}/></label><label className="admin-checkbox"><input type="checkbox" checked={data.settings.showPrices} onChange={e=>updateSettings("showPrices",e.target.checked)}/> Show service prices publicly</label></div><p className="save-note"><Check size={16}/> Changes save automatically in this browser.</p></div>}
    {tab==="services"&&<div className="admin-panel"><div className="admin-panel-head"><div><h2>Service catalogue</h2><p>Add, edit, hide, or remove services offered in the package builder.</p></div><button className="primary-btn" onClick={()=>setServiceDraft(blankService())}><Plus size={16}/> Add service</button></div>{serviceDraft&&<div className="edit-card"><h3>{data.services.some(s=>s.id===serviceDraft.id)?"Edit service":"New service"}</h3><div className="admin-form-grid"><label className="admin-field">Service name<input value={serviceDraft.name} onChange={e=>setServiceDraft({...serviceDraft,name:e.target.value})}/></label><label className="admin-field">Category<input value={serviceDraft.category} onChange={e=>setServiceDraft({...serviceDraft,category:e.target.value})}/></label><label className="admin-field">Price<input type="number" min="0" value={serviceDraft.price} onChange={e=>setServiceDraft({...serviceDraft,price:Number(e.target.value)})}/></label><label className="admin-field">Unit<input value={serviceDraft.unit} onChange={e=>setServiceDraft({...serviceDraft,unit:e.target.value})}/></label><label className="admin-field full-field">Description<textarea value={serviceDraft.description} onChange={e=>setServiceDraft({...serviceDraft,description:e.target.value})}/></label></div><div className="edit-actions"><button className="primary-btn" onClick={()=>{if(data.services.some(s=>s.id===serviceDraft.id))updateItem("services",serviceDraft.id,serviceDraft);else saveDraft("services",serviceDraft,setServiceDraft);setServiceDraft(null);}}>Save service</button><button className="text-btn" onClick={()=>setServiceDraft(null)}>Cancel</button></div></div>}{data.services.map(s=><div className="admin-list-item" key={s.id}><div><b>{s.name}</b><small>{s.category} · {money(s.price,data.settings.currency)} / {s.unit}</small></div><label className="mini-toggle"><input type="checkbox" checked={s.active} onChange={e=>updateItem("services",s.id,{active:e.target.checked})}/> Visible</label><button className="small-outline" onClick={()=>setServiceDraft({...s})}>Edit</button><button className="delete-btn" onClick={()=>removeItem("services",s.id)}>Delete</button></div>)}</div>}
    {tab==="portfolio"&&<div className="admin-panel"><div className="admin-panel-head"><div><h2>Portfolio projects</h2><p>Use public image URLs for local preview. Upload support can be connected to Supabase Storage later.</p></div><button className="primary-btn" onClick={()=>setPortfolioDraft(blankPortfolio())}><Plus size={16}/> Add project</button></div>{portfolioDraft&&<div className="edit-card"><h3>Project details</h3><div className="admin-form-grid"><label className="admin-field">Title<input value={portfolioDraft.title} onChange={e=>setPortfolioDraft({...portfolioDraft,title:e.target.value})}/></label><label className="admin-field">Category<input value={portfolioDraft.category} onChange={e=>setPortfolioDraft({...portfolioDraft,category:e.target.value})}/></label><label className="admin-field full-field">Description<textarea value={portfolioDraft.description} onChange={e=>setPortfolioDraft({...portfolioDraft,description:e.target.value})}/></label><label className="admin-field full-field">Image URL<input value={portfolioDraft.image} onChange={e=>setPortfolioDraft({...portfolioDraft,image:e.target.value})}/></label><label className="admin-field full-field">Project link<input value={portfolioDraft.link} onChange={e=>setPortfolioDraft({...portfolioDraft,link:e.target.value})}/></label></div><div className="edit-actions"><button className="primary-btn" onClick={()=>{if(data.portfolio.some(p=>p.id===portfolioDraft.id))updateItem("portfolio",portfolioDraft.id,portfolioDraft);else saveDraft("portfolio",portfolioDraft,setPortfolioDraft);setPortfolioDraft(null);}}>Save project</button><button className="text-btn" onClick={()=>setPortfolioDraft(null)}>Cancel</button></div></div>}{data.portfolio.map(p=><div className="admin-list-item" key={p.id}>{p.image?<img className="admin-thumb" src={p.image} alt=""/>:<span className="admin-thumb placeholder-thumb">✳</span>}<div className="admin-list-main"><b>{p.title}</b><small>{p.category} · {p.description}</small></div><button className="small-outline" onClick={()=>setPortfolioDraft({...p})}>Edit</button><button className="delete-btn" onClick={()=>removeItem("portfolio",p.id)}>Delete</button></div>)}</div>}
    {tab==="reviews"&&<div className="admin-panel"><div className="admin-panel-head"><div><h2>Client reviews</h2><p>Only publish real, permission-approved testimonials.</p></div><button className="primary-btn" onClick={()=>setReviewDraft(blankReview())}><Plus size={16}/> Add review</button></div>{reviewDraft&&<div className="edit-card"><div className="admin-form-grid"><label className="admin-field">Client name<input value={reviewDraft.name} onChange={e=>setReviewDraft({...reviewDraft,name:e.target.value})}/></label><label className="admin-field">Company<input value={reviewDraft.company} onChange={e=>setReviewDraft({...reviewDraft,company:e.target.value})}/></label><label className="admin-field">Rating<select value={reviewDraft.rating} onChange={e=>setReviewDraft({...reviewDraft,rating:Number(e.target.value)})}>{[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}</select></label><label className="admin-field">Photo URL<input value={reviewDraft.photo} onChange={e=>setReviewDraft({...reviewDraft,photo:e.target.value})}/></label><label className="admin-field full-field">Review<textarea rows="3" value={reviewDraft.quote} onChange={e=>setReviewDraft({...reviewDraft,quote:e.target.value})}/></label></div><div className="edit-actions"><button className="primary-btn" onClick={()=>{if(data.reviews.some(r=>r.id===reviewDraft.id))updateItem("reviews",reviewDraft.id,reviewDraft);else saveDraft("reviews",reviewDraft,setReviewDraft);setReviewDraft(null);}}>Save review</button><button className="text-btn" onClick={()=>setReviewDraft(null)}>Cancel</button></div></div>}{data.reviews.map(r=><div className="admin-list-item" key={r.id}><div className="admin-list-main"><b>{r.name} · {"★".repeat(r.rating)}</b><small>{r.company} — {r.quote}</small></div><button className="small-outline" onClick={()=>setReviewDraft({...r})}>Edit</button><button className="delete-btn" onClick={()=>removeItem("reviews",r.id)}>Delete</button></div>)}</div>}
    {tab==="process"&&<div className="admin-panel"><h2>Order process steps</h2><p>These steps are shown in the process section. Edit the copy inline.</p>{data.process.map((p,i)=><div className="process-edit" key={i}><span>0{i+1}</span><div><label className="admin-field">Step title<input value={p.title} onChange={e=>setList("process",data.process.map((x,j)=>i===j?{...x,title:e.target.value}:x))}/></label><label className="admin-field">Description<textarea rows="2" value={p.text} onChange={e=>setList("process",data.process.map((x,j)=>i===j?{...x,text:e.target.value}:x))}/></label></div><button className="delete-btn" onClick={()=>setList("process",data.process.filter((_,j)=>i!==j))}>Delete</button></div>)}<button className="small-outline" onClick={()=>setList("process",[...data.process,{title:"New step",text:"Describe this step."}])}><Plus size={15}/> Add step</button></div>}
    {tab==="orders"&&<div className="admin-panel"><h2>Customer requests</h2><p>Requests are stored in this browser in demo mode. Configure Supabase before taking real orders.</p>{orders.length===0?<div className="empty-state">No project requests yet.</div>:orders.map(o=><article className="order-admin-card" key={o.id}><div className="order-admin-head"><div><b>{o.name}</b><small>{o.company||"No company"} · {new Date(o.createdAt).toLocaleString()}</small></div><span className="status-badge">{o.status}</span></div><div className="order-contact">{o.email} · {o.phone}</div><p>{o.details||"No project details added."}</p><div className="order-tags">{(o.services||[]).map(s=><span key={s.id}>{s.name}</span>)}</div><div className="order-admin-bottom"><b>Estimate: {money(o.estimate,data.settings.currency)}</b><select value={o.status} onChange={e=>setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}><option>New</option><option>Contacted</option><option>Proposal sent</option><option>Approved</option><option>Completed</option><option>Cancelled</option></select><button className="delete-btn" onClick={()=>setOrders(prev=>prev.filter(x=>x.id!==o.id))}>Delete</button></div></article>)}</div>}
    {tab==="backup"&&<div className="admin-panel"><h2>Backup & deployment</h2><p>Export your content before moving from local browser storage to Supabase.</p><div className="backup-actions"><button className="primary-btn" onClick={()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="agency-content-backup.json";a.click();URL.revokeObjectURL(a.href);}}>Export website content <ArrowUpRight size={16}/></button><button className="small-outline" onClick={()=>setJsonText(JSON.stringify(data,null,2))}>Show JSON backup</button><button className="small-outline" onClick={()=>{if(confirm("Restore starter demo content? This replaces your current content.")){setData(clone(starterData));notify("Starter content restored.");}}}>Restore starter content</button></div>{jsonText&&<textarea className="json-area" rows="12" value={jsonText} readOnly/>}<div className="live-checklist"><h3>Before going live</h3>{["Set up Supabase tables and Row Level Security policies","Move content from localStorage into database tables","Set up Supabase Storage buckets for images","Replace demo admin access with Supabase Auth","Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel","Test order submission, admin access, and image updates"].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div><div className="warning-note"><ShieldCheck size={18}/><p><b>Important:</b> The demo password is not secure authentication. Do not publish the site with demo admin access or expose a Supabase service-role key in frontend code.</p></div></div>}
    </main></div>;
}
