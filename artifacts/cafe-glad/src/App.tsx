import { useEffect, useMemo, useState, type ReactNode, type FormEvent, type ChangeEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter, Link } from 'wouter';
import { ArrowDownRight, ArrowRight, Bike, Clock3, Coffee, MapPin, Menu as MenuIcon, Phone, X } from 'lucide-react';

const queryClient = new QueryClient();
const PHONE = '+4561427733';
const EMAIL = 'adm.gladcafe@gmail.com';
const ADDRESS = 'Frederiks Allé 127, 8000 Aarhus C';
const images = {
  flatbread: '/images/image_1791267171680.webp',
  salad: '/images/image_1791267181530.webp',
  bowls: '/images/image_1791267191899.webp',
  staff: '/images/image_1791267208543.webp',
  breakfast: '/images/breakfast.webp',
  spread: '/images/image_1791267233569.webp',
  feature: '/images/food-feature.webp',
  social: '/images/image_1791267131914.webp',
  promo: '/images/image_1791267159833.webp',
};
type MenuItem = { name: string; category: string; description: string; price: string; tags: string[]; addons: string; photo?: string };
type OpeningHours = { open: string; close: string; coffee: string };
const defaultHours: OpeningHours = { open: '09:00', close: '19:00', coffee: '08:30' };
const menuSeed: MenuItem[] = [
  { name:'Surdejsbolle',category:'Morgenmad',description:'Surdejsbolle fra morgenmenuen.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Avocado på surdejsbrød',category:'Morgenmad',description:'Avocado på surdejsbrød.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Vafler af kernegrød',category:'Morgenmad',description:'Vafler af kernegrød.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Grøn morgenskål',category:'Morgenmad',description:'Grøn morgenskål fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Overnight grød',category:'Morgenmad',description:'Overnight grød fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Morgensalat',category:'Morgenmad',description:'Morgensalat fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Svampetoast',category:'Morgenmad',description:'Svampetoast fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Sandwich',category:'Sandwich',description:'GLADs sandwich. Spørg os om dagens udvalg.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Spinatpandekage',category:'Sandwich',description:'Spinatpandekage fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Sæsonens salater',category:'Salat',description:'Salater med sæsonens udvalg.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Dips',category:'Andet',description:'Dips fra GLAD. Spørg os om dagens udvalg.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Friskpresset juice',category:'Drikke',description:'Frisk juice fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Kaffe',category:'Drikke',description:'Kaffe fra kl. 08.30.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Matcha',category:'Drikke',description:'Matcha fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Te',category:'Drikke',description:'Te fra GLAD.',price:'',tags:[],addons:'Ikke oplyst' },
  { name:'Hjemmelavede kager',category:'Kager',description:'Kager lavet hos GLAD. Spørg efter dagens udvalg.',price:'',tags:[],addons:'Ikke oplyst' },
];
const pagesMeta: Record<string,{title:string;description:string;h1:string}> = {
  '/': { title:'Café GLAD Aarhus | Hjemmelavet mad & takeaway',description:'Mad, der gør dig GLAD. Økologisk, hjemmelavet mad, kaffe og takeaway på Frederiks Allé i Aarhus C.',h1:'Mad, der gør dig GLAD.' },
  '/menu': { title:'Menu | Café GLAD på Frederiks Allé i Aarhus',description:'Se menuen fra Café GLAD i Aarhus C: morgenmad, sandwich, salater, drikke, kager og mere.',h1:'Menu fra Café GLAD' },
  '/takeaway-aarhus': { title:'Takeaway i Aarhus | Café GLAD',description:'Tag GLAD med på farten. Ring til Café GLAD på Frederiks Allé for takeaway og lokal cykellevering.',h1:'GLAD på farten' },
  '/catering-aarhus': { title:'Catering i Aarhus | Café GLAD',description:'Skal vi lave maden til dit næste arrangement? Spørg Café GLAD om catering i Aarhus.',h1:'Mad til mennesker, du holder af.' },
  '/firmafrokost-aarhus': { title:'Firmafrokost i Aarhus | Café GLAD',description:'Sund firmafrokost i Aarhus fra Café GLAD. Spørg os om en firmaaftale og fortæl, hvad I har brug for.',h1:'Sund firmafrokost i Aarhus' },
  '/om-glad': { title:'Om Café GLAD | Aarhus siden 2005',description:'Café GLAD har lavet sund takeaway i Aarhus siden 2005. Mød vores idé om mad lavet fra bunden.',h1:'Et lille sted med stor glæde.' },
  '/kontakt': { title:'Kontakt Café GLAD | Frederiks Allé, Aarhus C',description:'Find Café GLAD på Frederiks Allé 127 i Aarhus C. Se åbningstider, ring eller find vej.',h1:'Kig forbi. Vi er her.' },
  '/admin': { title:'Indholdsredigering | Café GLAD',description:'Lokal redigering af Café GLADs hjemmesideindhold.',h1:'GLAD indhold' },
};
function track(event: string, data: Record<string,string> = {}) {
  const detail = { event, ...data, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent('glad:business-event', { detail }));
  const win = window as Window & { dataLayer?: Array<Record<string,unknown>> };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push(detail);
}
function usePageMeta(path: string) {
  useEffect(() => {
    const meta = pagesMeta[path] ?? pagesMeta['/'];
    document.title = meta.title;
    const setMeta = (selector: string, attr: string, value: string) => {
      let node = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!node) { node = document.createElement('meta'); document.head.appendChild(node); }
      node.setAttribute(attr,value);
    };
    setMeta('meta[name="description"]','content',meta.description);
    setMeta('meta[property="og:title"]','content',meta.title);
    setMeta('meta[property="og:description"]','content',meta.description);
    setMeta('meta[property="og:url"]','content',new URL(path,window.location.origin).href);
    setMeta('meta[property="og:image"]','content',new URL(images.feature,window.location.origin).href);
    setMeta('meta[property="og:type"]','content','website');
    setMeta('meta[name="twitter:card"]','content','summary_large_image');
    setMeta('meta[name="twitter:title"]','content',meta.title);
    setMeta('meta[name="twitter:description"]','content',meta.description);
    setMeta('meta[name="twitter:image"]','content',new URL(images.feature,window.location.origin).href);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel='canonical'; document.head.appendChild(canonical); }
    canonical.href = new URL(path,window.location.origin).href;
  },[path]);
}
function SiteImage({ src, alt, className='', eager=false }: {src:string;alt:string;className?:string;eager?:boolean}) {
  return <img className={className} src={src} alt={alt} width="600" height="800" sizes="(max-width: 680px) 100vw, 50vw" loading={eager?'eager':'lazy'} fetchPriority={eager?'high':'auto'} decoding="async" />;
}
function OrderLink({ children='BESTIL TAKEAWAY', className='button-primary' }: {children?:ReactNode;className?:string}) {
  return <a data-testid="link-order-takeaway" className={className} href={`tel:${PHONE}`} onClick={()=>track('ORDER',{method:'phone'})}>{children}<ArrowRight size={16}/></a>;
}
function Header() {
  const [open,setOpen]=useState(false);
  const close=()=>setOpen(false);
  const links=[['Menu','/menu'],['Take away','/takeaway-aarhus'],['Catering','/catering-aarhus'],['Om GLAD','/om-glad'],['Kontakt','/kontakt']];
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="Café GLAD – forsiden" onClick={close}>GL<span>A</span><em>D</em></Link>
    <nav className={`nav-links ${open?'open':''}`} aria-label="Hovednavigation">
      {links.map(([label,href])=><Link key={href} href={href} onClick={close}>{label}</Link>)}
      <OrderLink className="order-button">BESTIL NU</OrderLink>
    </nav>
    <OrderLink className="order-button desktop-order">BESTIL NU</OrderLink>
    <button className="menu-toggle" aria-label={open?'Luk menu':'Åbn menu'} aria-expanded={open} onClick={()=>setOpen(!open)} data-testid="button-mobile-menu">{open?<X/>:<MenuIcon/>}</button>
  </div></header>;
}
function Footer() {
  const content=readContent();
  return <footer className="footer"><div className="footer-inner">
    <div><Link href="/" className="brand">GL<span>A</span><em>D</em></Link><p>Vi laver maden fra bunden, fordi vi synes, det smager bedre.<br/>Frederiks Allé 127<br/>8000 Aarhus C</p></div>
    <div className="footer-links"><Link href="/menu">Menu</Link><Link href="/takeaway-aarhus">Take away</Link><Link href="/catering-aarhus">Catering</Link><Link href="/firmafrokost-aarhus">Firmafrokost</Link><Link href="/om-glad">Om GLAD</Link><Link href="/kontakt">Kontakt</Link><Link href="/admin">Indholdsredigering</Link></div>
    <div><p><strong>Åbningstider</strong><br/>{hoursDisplay(content.hours)}</p><p><a href={`tel:${PHONE}`} onClick={()=>track('CALL')}>+45 61 42 77 33</a><br/><a href={`mailto:${EMAIL}`} onClick={()=>track('EMAIL')}>{EMAIL}</a></p><a href="https://www.instagram.com/cafeglad/" target="_blank" rel="noopener noreferrer" onClick={()=>track('SOCIAL',{network:'instagram'})}>Instagram · {content.social}</a></div>
  </div><div className="small-muted" style={{maxWidth:1200,margin:'40px auto 0'}}>© Café GLAD · Aarhus</div></footer>;
}
function MobileBar() {
  return <nav className="sticky-bottom" aria-label="Hurtige handlinger">
    <a href={`tel:${PHONE}`} onClick={()=>track('ORDER',{method:'phone'})}>BESTIL</a><Link href="/menu" onClick={()=>track('MENU_VIEW')}>MENU</Link><a href={`tel:${PHONE}`} onClick={()=>track('CALL')}><Phone size={16}/> RING</a><a href="https://maps.google.com/?q=Frederiks+All%C3%A9+127,+8000+Aarhus+C" target="_blank" rel="noopener noreferrer" onClick={()=>track('DIRECTIONS')}><MapPin size={16}/> FIND VEJ</a>
  </nav>;
}
function Shell({ children }: {children:ReactNode}) {
  return <><a href="#main" className="skip-link">Spring til indhold</a><Header/>{children}<Footer/><MobileBar/><ReturnNudge/></>;
}
function ReturnNudge() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    let previous=window.scrollY;let timer=window.setTimeout(show,25000);
    const already=sessionStorage.getItem('glad-return-nudge')==='seen';
    function show(){if(!already){setVisible(true);sessionStorage.setItem('glad-return-nudge','seen')}}
    function onScroll(){const current=window.scrollY;if(current>350&&current<previous-10){show();window.removeEventListener('scroll',onScroll);window.clearTimeout(timer)}previous=current}
    if(!already)window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{window.removeEventListener('scroll',onScroll);window.clearTimeout(timer)};
  },[]);
  if(!visible)return null;
  return <aside className="return-nudge" role="status"><span>Sulten? Bestil take away.</span><OrderLink>BESTIL <ArrowRight size={14}/></OrderLink><button type="button" aria-label="Luk besked" onClick={()=>setVisible(false)}>×</button></aside>;
}
function Marquee() { return <div className="marquee" aria-label="Økologisk, hjemmelavet, fra bunden, Aarhus"><span>Økologisk &nbsp;·&nbsp; Hjemmelavet &nbsp;·&nbsp; Fra bunden &nbsp;·&nbsp; Aarhus &nbsp;·&nbsp; Økologisk &nbsp;·&nbsp; Hjemmelavet &nbsp;·&nbsp; Fra bunden &nbsp;·&nbsp; Aarhus &nbsp;·&nbsp;</span></div>; }
function OpenStatus() {
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),30000);return()=>window.clearInterval(timer)},[]);
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Copenhagen',hour:'2-digit',hourCycle:'h23'}).format(now));
  const minute=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Copenhagen',minute:'2-digit'}).format(now));
  const {open:opens,close:closes}=readContent().hours;
  const total=hour*60+minute, open=total>=minutes(opens)&&total<minutes(closes);
  const closing=danishTime(closes), opening=danishTime(opens);
  return <span className="pill" data-testid="status-opening-hours"><i style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:open?'#6b8a55':'#c87650',marginRight:7}}/>{open?`Åbent nu · Lukker kl. ${closing}`:total<minutes(opens)?`Lukket nu · Åbner kl. ${opening}`:`Lukket nu · Åbner i morgen kl. ${opening}`}</span>;
}
function Home() {
  const content=readContent();
  const [localTime,setLocalTime]=useState(()=>new Date());
  useEffect(()=>{const id=window.setInterval(()=>setLocalTime(new Date()),60000);return()=>window.clearInterval(id)},[]);
  useEffect(()=>track('PAGE_VIEW',{page:'home'}),[]);
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Copenhagen',hour:'2-digit',hourCycle:'h23'}).format(localTime));
  const headline=hour<11?'Start dagen GLAD.':hour<15?'Frokost? Gør den GLAD.':'Kaffe og kage?';
  const socialVisitor=new URLSearchParams(window.location.search).get('utm_source')==='instagram';
  return <Shell><main id="main">
    <section className={`hero${socialVisitor?' hero-social':''}`}>
      <div className="hero-copy reveal">{socialVisitor&&<span className="pill" style={{alignSelf:'flex-start',marginBottom:14}}>Velkommen fra Instagram · GLAD kan bestilles på telefon</span>}<span className="eyebrow">Frederiksbjerg · Aarhus</span><h1>{headline.split(' ').slice(0,-1).join(' ')} <span>{headline.split(' ').at(-1)}</span></h1>
        <p>Sund, hjemmelavet og økologisk mad i hjertet af Aarhus. Kaffe fra 08.30 – og noget godt at tage med.</p>
        <div className="hero-actions"><OrderLink/><Link href="/menu" className="button-outline" onClick={()=>track('MENU_VIEW')}>SE MENU</Link></div>
        <p className="hero-small">{hoursDisplay(content.hours)} · Frederiks Allé 127</p>{content.promotion&&<div className="notice" data-testid="text-promotion">{content.promotion}</div>}<Link href="/catering-aarhus" className="hero-small" style={{color:'var(--orange)',fontWeight:700}}>Skal vi lave mad til dit næste arrangement? →</Link>
      </div>
      <div className="hero-visual"><SiteImage src={images.feature} alt="Farverige retter og salater fra Café GLADs servering" eager/><div className="sticker">Kaffe<br/>fra 08.30</div><span className="hero-caption">En god dag begynder her.</span></div>
    </section>
    <div style={{padding:'18px 6vw',display:'flex',justifyContent:'center'}}><OpenStatus/></div>
    <Marquee/>
    <section className="section"><div className="section-inner">
      <div className="section-head"><div><span className="eyebrow">Noget for enhver lyst</span><h2>Hvad har du lyst til?</h2></div><Link href="/menu" className="button-outline" onClick={()=>track('MENU_VIEW')}>Hele menuen <ArrowRight size={15}/></Link></div>
      <div className="category-grid">
        {[['Morgenmad',images.breakfast,'Morgenmad og juice hos GLAD'],['Salater',images.salad,'Farverige salater og dips hos GLAD'],['Sandwich',images.flatbread,'Savory fladbrød fra Café GLAD'],['Drikke',images.breakfast,'Juice serveret hos Café GLAD']].map(([name,src,alt])=><Link href={`/menu#${name==='Salater'?'salat':name.toLowerCase()}`} className="category-card" key={name}><SiteImage src={src} alt={alt}/><strong>{name}</strong></Link>)}
        <Link href="/menu#kager" className="category-card" data-testid="category-kager"><div className="category-image-slot" role="img" aria-label="Foto af kager mangler"><span>Foto mangler<br/>Kager</span></div><strong>Kager</strong></Link>
      </div>
    </div></section>
    <section className="section soft-section"><div className="section-inner feature-grid">
      <div className="photo-frame"><SiteImage src={images.bowls} alt="Skåle med farverige salater, grøntsager og dips fra Café GLAD"/><span className="image-caption">Fra køkkenet på Frederiks Allé</span></div>
      <div><span className="eyebrow">Noget fra menuen</span><h2>Farver på tallerkenen. Ro i maven.</h2><p className="section-lead">Sæsonens salater, friskbagt brød og retter lavet med omtanke. Spørg os gerne om dagens udvalg og muligheder for særlige ønsker.</p>
        <div className="menu-feature-list">{['Avocado på surdejsbrød','Vafler af kernegrød','Sæsonens salater','Hjemmelavede kager'].map((item,i)=><div className="dish-row" key={item}><strong>{item}</strong><span>{i===2?'Fra salatmenuen':'Fra GLADs køkken'}</span><span className="price">Pris: se i caféen</span></div>)}</div>
        <p className="small-muted">Priserne er ikke oplyst her endnu. Spørg os i caféen eller ring.</p><Link href="/menu" className="button-outline" onClick={()=>track('MENU_VIEW')}>SE HELE MENUEN <ArrowRight size={15}/></Link>
      </div>
    </div></section>
    <section className="section"><div className="section-inner"><div className="section-head"><div><span className="eyebrow">Det skal smage af noget</span><h2>Hvorfor GLAD?</h2></div><p className="section-lead">Vi laver maden fra bunden, fordi vi synes, det smager bedre. Økologi, omtanke og lokale leverandører hører til i vores køkken.</p></div><div className="info-strip">
      {[[<Coffee size={22}/>,'Fra bunden','Meget af vores mad laver vi selv.'],[<span>Ø</span>,'Økologisk','Vi vælger økologisk og bæredygtigt.'],[<MapPin size={22}/>,'Aarhus','Et nabolagssted på Frederiks Allé siden 2005.']].map(([icon,title,desc])=><div className="info-cell" key={String(title)}>{icon}<strong>{title}</strong><span>{desc}</span></div>)}
    </div></div></section>
    <section className="section dark-section"><div className="section-inner split-callout"><div><span className="eyebrow">Tag GLAD med</span><h2>GLAD på farten.</h2><p className="section-lead">Bestil takeaway ved at ringe til os. Vi tilbyder også lokal cykellevering. Ring, så finder vi ud af det sammen.</p><div className="bike-trail" aria-label="Lokal cykellevering i Aarhus"><Bike size={28}/><span>Lokal cykellevering i Aarhus</span></div><p>+45 61 42 77 33</p><div className="hero-actions"><OrderLink/><Link className="button-outline" href="/takeaway-aarhus" style={{color:'var(--cream)',borderColor:'var(--cream)'}}>SÅDAN BESTILLER DU</Link></div></div><div className="callout-art"><SiteImage src={images.flatbread} alt="Savory fladbrød serveret hos Café GLAD"/><SiteImage className="mini-photo" src={images.staff} alt="GLAD-medarbejder ved kaffemaskinen"/></div></div></section>
    <section className="section"><div className="section-inner feature-grid"><div><span className="eyebrow">Til de gode stunder</span><h2>Mad til flere end dig selv.</h2><p className="section-lead">Firmafrokost, reception, fest eller en dag med familien. Fortæl os om jeres dag og særlige ønsker – så tager vi en snak.</p><div className="pill-row"><span className="pill">Firmafrokost</span><span className="pill">Reception</span><span className="pill">Private arrangementer</span><span className="pill">Kursus & workshop</span></div><Link href="/catering-aarhus" className="button-primary" onClick={()=>track('CATERING_CTA')}>FÅ ET TILBUD <ArrowRight size={15}/></Link></div><div className="photo-frame" style={{minHeight:440}}><SiteImage src={images.spread} alt="Anretninger med salater og dips til deling"/></div></div></section>
    <section className="section soft-section"><div className="section-inner split-callout"><div className="callout-art"><SiteImage src={images.staff} alt="GLAD-medarbejder laver kaffe ved espressomaskinen"/><SiteImage className="mini-photo" src={images.breakfast} alt="Morgenmad og kaffe på GLAD"/></div><div><span className="eyebrow">Et sted i Aarhus siden 2005</span><h2>Hej, vi er GLAD.</h2><p className="section-lead">Vi begyndte med en enkel idé: sund takeaway, lavet med omhu. Siden har GLAD været et sted at mødes om morgenmad, kaffe og mad fra bunden.</p><Link href="/om-glad" className="button-outline">LÆR OS AT KENDE <ArrowRight size={15}/></Link></div></div></section>
    <section className="section"><div className="section-inner split-callout"><div><span className="eyebrow">Et lille ekstra</span><h2>Gem GLAD til senere.</h2><p className="section-lead">Gavekort, kaffekort og klippekort til sandwich eller salat. Spørg os i caféen, så hjælper vi dig med at finde det rigtige.</p><Link href="/kontakt" className="button-outline">SPØRG I CAFÉEN <ArrowRight size={15}/></Link></div><div className="photo-frame" style={{minHeight:370}}><SiteImage src={images.bowls} alt="Farverig salat fra Café GLAD"/></div></div></section>
    <section className="section dark-section"><div className="section-inner split-callout"><div><span className="eyebrow">Følg med hos GLAD</span><h2>Små glimt fra caféen.</h2><p className="section-lead">Se hvad der rører sig hos os på Instagram. Du finder os som @cafeglad.</p><a className="button-primary" href="https://www.instagram.com/cafeglad/" target="_blank" rel="noopener noreferrer" onClick={()=>track('SOCIAL',{network:'instagram'})}>FØLG @CAFÉGLAD <ArrowRight size={15}/></a></div><div className="photo-frame" style={{minHeight:360}}><SiteImage src={images.social} alt="Salatservering fotograferet hos Café GLAD; billedet er et kundeleveret socialt opslag"/></div></div></section>
    <ContactPreview/>
  </main></Shell>;
}
function Subhero({eyebrow,title,copy,children}:{eyebrow:string;title:string;copy:string;children?:ReactNode}) {
  return <div className="subhero"><div className="subhero-inner"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p>{children}</div></div>;
}
function MenuPage() {
  const [filter,setFilter]=useState('Alle');
  const [items,setItems]=useState<MenuItem[]>(()=>readContent().menu);
  useEffect(()=>track('MENU_VIEW'),[]);
  const categories=['Morgenmad','Sandwich','Salat','Drikke','Kager','Andet'];
  const filtered=useMemo(()=>items.filter(i=>filter==='Alle'||i.tags.includes(filter)),[items,filter]);
  return <Shell><main id="main"><Subhero eyebrow="Lavet på GLAD" title="Menu fra Café GLAD" copy="Morgenmad, salater, sandwich, kager og drikke. Vi har samlet menuen her – spørg os gerne om dagens udvalg og særlige ønsker."><OrderLink/></Subhero>
    <section className="section"><div className="section-inner menu-layout"><nav className="menu-side" aria-label="Menuens kategorier">{categories.map(c=><a href={`#${c.toLowerCase()}`} key={c}>{c}</a>)}</nav><div>
      <div className="filterbar" aria-label="Filtrer menu efter kostønske">{['Alle','Vegetarisk','Vegansk','Glutenreduceret'].map(v=><button type="button" key={v} className={`filter-chip ${filter===v?'active':''}`} aria-pressed={filter===v} onClick={()=>setFilter(v)} data-testid={`filter-${v.toLowerCase()}`}>{v}</button>)}</div>
      {filter!=='Alle'&&<p className="small-muted">Viser kun retter, der er markeret med {filter.toLowerCase()}. Ikke-markerede retter er udeladt, ikke vurderet. Spørg os gerne om indhold og allergener.</p>}
      {filter!=='Alle'&&filtered.length===0&&<div className="notice">GLAD har vegetariske, veganske og glutenreducerede muligheder. Vi har ikke fået bekræftet, hvilke konkrete menupunkter der passer til dette filter – spørg os gerne i caféen.</div>}
      {categories.map(cat=>{const group=filtered.filter(i=>i.category===cat);return <section id={cat.toLowerCase()} className="menu-group" key={cat}><h2>{cat}</h2>{group.length?group.map(item=><article className="menu-item" key={item.name}><div className="menu-item-copy"><h3>{item.name}</h3><p>{item.description}</p><p className="small-muted">Tilvalg: {item.addons||'Ikke oplyst'}</p>{item.tags.length>0&&<span className="tag">{item.tags.join(' · ')}</span>}</div>{item.photo?<img className="menu-item-photo" src={item.photo} alt={`Foto af ${item.name} hos Café GLAD`} width="120" height="100" loading="lazy" decoding="async"/>:<div className="menu-photo-slot" role="img" aria-label={`Foto af ${item.name} mangler`}><span>Foto ikke tilføjet</span></div>}<span className="price">{item.price||'Pris ikke oplyst'}</span></article>):<p className="small-muted">Spørg os om dagens udvalg i denne kategori.</p>}</section>})}
      <div className="notice"><strong>Priser og ingredienser</strong><br/>Priser er endnu ikke oplyst på hjemmesiden. Spørg os i caféen eller ring på <a href={`tel:${PHONE}`} onClick={()=>track('CALL')}>+45 61 42 77 33</a>. Kontakt os gerne om allergener og kostønsker.</div>
      <LunchPicker items={items}/>
    </div></div></section></main></Shell>;
}
function LunchPicker({items}:{items:MenuItem[]}) {
  const [type,setType]=useState('Frokost');const [diet,setDiet]=useState('Ingen særlige ønsker');const [drink,setDrink]=useState('Kaffe');
  const suggestion=type==='Morgenmad'?'Vafler af kernegrød':'Sæsonens salater';
  return <section className="lunch-picker"><span className="eyebrow">Tre hurtige valg</span><h2>Byg din GLAD-frokost</h2><p className="section-lead">Et lille forslag fra menuen – spørg os om dagens udvalg.</p><div className="picker-grid">
    <label>1. Hvad har du lyst til?<select value={type} onChange={e=>setType(e.target.value)}><option>Frokost</option><option>Morgenmad</option><option>En lille snack</option></select></label>
    <label>2. Kostønske<select value={diet} onChange={e=>setDiet(e.target.value)}><option>Ingen særlige ønsker</option><option>Vegetarisk</option><option>Vegansk</option><option>Glutenreduceret</option></select></label>
    <label>3. Noget at drikke?<select value={drink} onChange={e=>setDrink(e.target.value)}><option>Kaffe</option><option>Te</option><option>Matcha</option><option>Friskpresset juice</option></select></label>
  </div><div className="notice">Dit GLAD-forslag: <strong>{items.some(i=>i.name===suggestion)?suggestion:'Sæsonens salater'}</strong> med {drink.toLowerCase()}. {diet!=='Ingen særlige ønsker'&&`Spørg os om muligheder for ${diet.toLowerCase()}.`} Kostønsker og indhold bekræftes altid hos os.</div><div style={{marginTop:20}}><OrderLink>RING OG BESTIL <Phone size={15}/></OrderLink></div></section>;
}
function TakeawayPage() {
  return <Shell><main id="main"><Subhero eyebrow="Tag maden med hjem" title="GLAD på farten" copy="Bestil takeaway fra Café GLAD i Aarhus C. Ring direkte til os, så aftaler vi, hvad du har lyst til og hvornår du henter."><OrderLink>RING OG BESTIL <Phone size={15}/></OrderLink></Subhero>
     <section className="section"><div className="section-inner split-callout"><div><span className="eyebrow">Bestil direkte hos os</span><h2>En telefon. En glad frokost.</h2><p className="section-lead">Vi har ikke et online bestillingslink på denne side. Ring til caféen på <a href={`tel:${PHONE}`} onClick={()=>track('CALL')}>+45 61 42 77 33</a> for takeaway og lokal cykellevering.</p><p>{hoursDisplay(readContent().hours)}</p><OrderLink>RING TIL CAFÉ GLAD <Phone size={15}/></OrderLink><p className="small-muted">Afhentning og leveringsmuligheder aftales direkte med caféen.</p></div><div className="photo-frame"><SiteImage src={images.flatbread} alt="Savory fladbrød fra Café GLAD til takeaway"/></div></div></section>
    <section className="section soft-section"><div className="section-inner"><div className="section-head"><div><span className="eyebrow">Fra køkkenet</span><h2>Tag plads – eller tag med.</h2></div><p className="section-lead">Du kan spise hos os inde eller ude, hente takeaway eller spørge os om lokal cykellevering.</p></div><div className="info-strip">{[['Ring','Vi tager imod din bestilling på telefon.'],['Hent','Aftal afhentning direkte med caféen.'],['Få GLAD leveret','Spørg os om lokal cykellevering.']].map(([a,b])=><div className="info-cell" key={a}><strong>{a}</strong><span>{b}</span></div>)}</div></div></section></main></Shell>;
}
function CateringPage({firm=false}:{firm?:boolean}) {
  const cateringCopy=readContent().catering;
  const [sent,setSent]=useState(false);const [started,setStarted]=useState(false);
  const types=firm?['Firmafrokost','Andet']:['Firmafrokost','Fest','Reception','Private arrangementer','Kursus eller workshop','Udendørs arrangement','Andet'];
  const title=firm?'Sund firmafrokost i Aarhus':'Skal vi lave maden til dit næste arrangement?';
  function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();const form=new FormData(e.currentTarget);
    const subject=firm?'Forespørgsel om firmafrokost':'Forespørgsel om catering';
    const body=[`Navn: ${form.get('name')}`,`Email: ${form.get('email')}`,`Telefon: ${form.get('phone')}`,`Dato: ${form.get('date')}`,`Antal personer: ${form.get('people')}`,`Type af arrangement: ${form.get('type')}`,`Ønsker: ${form.get('wishes')}`,`Budget: ${form.get('budget')||'Ikke oplyst'}`].join('\n');
    track('CATERING_ENQUIRY',{kind:firm?'firmafrokost':'catering'});
    setSent(true);
    window.location.href=`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return <Shell><main id="main"><Subhero eyebrow={firm?'Til arbejdsdagen':'Mad til jeres dag'} title={title} copy={firm?'GLAD tilbyder firmafrokost. Fortæl os lidt om jeres hverdag, antal og ønsker – så tager vi en snak om, hvad der passer.':'Firmafrokost, fest, reception eller en særlig dag. Fortæl os om jeres arrangement og særlige kostønsker.'}><a href="#forespoergsel" className="button-primary" onClick={()=>track('CATERING_CTA')}>{firm?'SPØRG OM FIRMAAFTALE':'FÅ ET TILBUD'} <ArrowDownRight size={15}/></a></Subhero>
    <section className="section"><div className="section-inner feature-grid"><div><span className="eyebrow">God mad samler</span><h2>Fortæl os, hvad I drømmer om.</h2><p className="section-lead">{cateringCopy} Har I særlige kostønsker? Skriv det i formularen, så taler vi om mulighederne.</p><div className="pill-row">{types.slice(0,5).map(t=><span className="pill" key={t}>{t}</span>)}</div></div><div className="photo-frame"><SiteImage src={images.salad} alt="Salater, grøntsager og dips serveret hos GLAD"/></div></div></section>
    <section className="section soft-section" id="forespoergsel"><div className="section-inner" style={{maxWidth:850}}><span className="eyebrow">Forespørgsel</span><h2>{firm?'Spørg om firmaaftale':'Lad os høre om jeres dag.'}</h2><p className="section-lead">Udfyld felterne. Når du trykker send, åbner din mail-app med en færdig besked til Café GLAD. Intet sendes til en server fra denne formular.</p>
      {sent?<div className="notice" role="status"><strong>Din mail-app er åbnet med en kladde til Café GLAD.</strong><br/>Tryk selv Send i din mail-app. Først når mailen er sendt, modtager GLAD din forespørgsel og kan vende tilbage.</div>:<form className="form-grid" onSubmit={submit} onFocus={()=>{if(!started){setStarted(true);track('CATERING_FORM_START',{kind:firm?'firmafrokost':'catering'})}}}>
        <label>Navn *<input name="name" required autoComplete="name" data-testid="input-catering-name"/></label><label>Email *<input name="email" type="email" required autoComplete="email" data-testid="input-catering-email"/></label>
        <label>Telefon *<input name="phone" type="tel" required autoComplete="tel" data-testid="input-catering-phone"/></label><label>Dato *<input name="date" type="date" required data-testid="input-catering-date"/></label>
        <label>Antal personer *<input name="people" type="number" min="1" required data-testid="input-catering-people"/></label><label>Type af arrangement *<select name="type" required defaultValue=""><option value="" disabled>Vælg type</option>{types.map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="full">Ønsker og særlige kostbehov *<textarea name="wishes" required placeholder="Fortæl os lidt om jeres arrangement."/></label><label>Budget (valgfrit)<input name="budget" type="text" placeholder="Valgfrit"/></label>
        <div className="full"><button type="submit" className="button-primary" data-testid="button-catering-submit">{firm?'SEND FIRMAFORESPØRGSEL':'SEND FORESPØRGSEL'} <ArrowRight size={15}/></button></div>
      </form>}
    </div></section></main></Shell>;
}
function AboutPage() {
  return <Shell><main id="main"><Subhero eyebrow="Café GLAD · Aarhus siden 2005" title="Et lille sted med stor glæde." copy="Vi begyndte med sund takeaway. I dag er GLAD stadig et sted, hvor maden laves med omhu – og hvor der er plads til at blive lidt længere."/>
    <section className="section"><div className="section-inner split-callout"><div><span className="eyebrow">Historien om GLAD</span><h2>Det begyndte med en idé.</h2><p className="section-lead">Café GLAD blev grundlagt i 2005 med sund takeaway. Siden har vi holdt fast i det, der betyder noget for os: økologiske råvarer, lokale leverandører og mad lavet fra bunden.</p><p>Vi tror på omtanke i køkkenet og på at bruge råvarerne godt, så mindre går til spilde. Det er en del af den måde, vi gerne vil drive café på.</p><Link className="button-primary" href="/takeaway-aarhus">TAG GLAD MED <ArrowRight size={15}/></Link></div><div className="photo-frame"><SiteImage src={images.staff} alt="GLAD-medarbejder tilbereder kaffe i caféen"/></div></div></section>
    <section className="section soft-section"><div className="section-inner feature-grid"><div className="photo-frame"><SiteImage src={images.spread} alt="Serveringer fra Café GLAD ved et dækket bord"/></div><div><span className="eyebrow">Hjemmelavet, økologisk, lokalt</span><h2>Mad, der bliver lavet med hænderne.</h2><p className="section-lead">Vi laver meget fra bunden og samarbejder med lokale leverandører. Vi vælger økologisk og tænker over, hvordan vi bruger råvarerne.</p><p>Der er vegetariske, veganske og glutenreducerede muligheder. Spørg os gerne om dagens udvalg og indhold.</p></div></div></section></main></Shell>;
}
function ContactPreview() {
  return <section className="section"><div className="section-inner"><div className="section-head"><div><span className="eyebrow">Find GLAD på Frederiks Allé</span><h2>Vi glæder os til at se dig.</h2></div><Link className="button-outline" href="/kontakt">KONTAKT & FIND VEJ <ArrowRight size={15}/></Link></div><div className="info-strip"><div className="info-cell"><strong><Clock3/> Åbningstider</strong><span>{hoursDisplay(readContent().hours)}</span></div><div className="info-cell"><strong><MapPin/> Frederiks Allé 127</strong><span>8000 Aarhus C</span></div><div className="info-cell"><strong><Phone/> Ring til os</strong><span><a href={`tel:${PHONE}`} onClick={()=>track('CALL')}>+45 61 42 77 33</a></span></div></div></div></section>;
}
function ContactPage() {
  return <Shell><main id="main"><Subhero eyebrow="Frederiksbjerg · Aarhus C" title="Kig forbi. Vi er her." copy="Find Café GLAD på Frederiks Allé. Der er plads til at spise hos os – både inde og ude."/>
    <section className="section"><div className="section-inner feature-grid"><div><span className="eyebrow">Kontakt os</span><h2>Her finder du os.</h2><p className="section-lead">{ADDRESS}</p><p>{hoursDisplay(readContent().hours)}</p><div className="menu-feature-list"><div className="dish-row"><strong>Telefon</strong><a href={`tel:${PHONE}`} onClick={()=>track('CALL')}>+45 61 42 77 33</a></div><div className="dish-row"><strong>Email</strong><a href={`mailto:${EMAIL}`} onClick={()=>track('EMAIL')}>{EMAIL}</a></div></div><a className="button-primary" href="https://maps.google.com/?q=Frederiks+All%C3%A9+127,+8000+Aarhus+C" target="_blank" rel="noopener noreferrer" onClick={()=>track('DIRECTIONS')}>FIND VEJ <MapPin size={16}/></a></div>
    <div className="map-box"><div><MapPin size={32}/><h2>Café GLAD</h2><p>{ADDRESS}</p><a href="https://maps.google.com/?q=Frederiks+All%C3%A9+127,+8000+Aarhus+C" target="_blank" rel="noopener noreferrer" onClick={()=>track('DIRECTIONS')}>Åbn rutevejledning ↗</a></div></div></div></section>
    <section className="section soft-section"><div className="section-inner"><span className="eyebrow">Her er plads til dig</span><h2>Indenfor eller under åben himmel.</h2><p className="section-lead">Vi har siddepladser både inde og ude. Kig forbi til kaffe fra 08.30 eller mad i løbet af dagen.</p><OrderLink>RING OG BESTIL <Phone size={15}/></OrderLink></div></section></main></Shell>;
}
const defaultContent = { menu: menuSeed, hours:defaultHours, catering:'Firmafrokost, fester, receptioner, private arrangementer, kurser og workshops.', promotion:'', social:'@cafeglad' };
type Content = typeof defaultContent;
function readContent():Content {
  try {
    const saved=localStorage.getItem('glad-local-content');
    if(saved) {
      const parsed=JSON.parse(saved);
      const storedHours=parsed.hours;
      const hours:OpeningHours=storedHours&&typeof storedHours==='object'
        ? {open:validTime(storedHours.open)?storedHours.open:defaultHours.open,close:validTime(storedHours.close)?storedHours.close:defaultHours.close,coffee:validTime(storedHours.coffee)?storedHours.coffee:defaultHours.coffee}
        : defaultHours;
      const storedMenu=Array.isArray(parsed.menu)?parsed.menu:menuSeed;
      const menu:MenuItem[]=storedMenu.filter((item:unknown)=>item&&typeof item==='object').map((item:Partial<MenuItem>)=>{
        const seeded=menuSeed.some(seed=>seed.name===item.name);
        const rawTags=Array.isArray(item.tags)?item.tags.filter((tag):tag is string=>typeof tag==='string'):[];
        const tags=seeded&&typeof item.addons!=='string'?[]:rawTags;
        return {
          name:typeof item.name==='string'?item.name:'Menupunkt',
          category:typeof item.category==='string'?item.category:'Andet',
          description:typeof item.description==='string'?item.description:'',
          price:typeof item.price==='string'?item.price:'',
          tags,
          addons:typeof item.addons==='string'?item.addons:'Ikke oplyst',
          ...(typeof item.photo==='string'?{photo:item.photo}:{})
        };
      });
      return {...defaultContent,...parsed,hours,menu};
    }
  } catch { /* corrupted browser storage falls back to the supplied content */ }
  return defaultContent;
}
function validTime(value:unknown):value is string {
  return typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
function minutes(value:string):number {
  const [hour,minute]=value.split(':').map(Number);
  return hour*60+minute;
}
function danishTime(value:string):string { return value.replace(':','.'); }
function hoursDisplay(hours:OpeningHours):string {
  return `${danishTime(hours.open)}–${danishTime(hours.close)} alle dage · kaffe fra ${danishTime(hours.coffee)}`;
}
function compressPhotoToWebp(file:File):Promise<string> {
  return new Promise((resolve,reject)=>{
    const objectUrl=URL.createObjectURL(file);
    const image=new Image();
    image.onload=()=>{
      URL.revokeObjectURL(objectUrl);
      let scale=Math.min(1,1100/Math.max(image.naturalWidth,image.naturalHeight));
      while(scale>=0.25) {
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const context=canvas.getContext('2d');
        if(!context){reject(new Error('Billedet kunne ikke behandles.'));return}
        context.drawImage(image,0,0,canvas.width,canvas.height);
        for(const quality of [0.76,0.62,0.48]) {
          const compressed=canvas.toDataURL('image/webp',quality);
          if(compressed.startsWith('data:image/webp')&&compressed.length<=180_000){resolve(compressed);return}
        }
        scale*=0.8;
      }
      reject(new Error('Billedet kunne ikke komprimeres til en passende størrelse. Prøv et mindre foto.'));
    };
    image.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(new Error('Billedet kunne ikke åbnes.'))};
    image.src=objectUrl;
  });
}
function AdminPage() {
  const [content,setContent]=useState<Content>(()=>readContent());const [tab,setTab]=useState('Menu');const [saved,setSaved]=useState(false);
  const [photoError,setPhotoError]=useState('');
  function update(next:Content){setContent(next);try{localStorage.setItem('glad-local-content',JSON.stringify(next));setSaved(true);window.setTimeout(()=>setSaved(false),2200)}catch{setSaved(false);setPhotoError('Browserens lokale lager er fyldt. Fjern et foto eller eksportér indholdet.');}}
  function updateItem(i:number,key:keyof MenuItem,value:string){const menu=content.menu.map((m,index)=>index===i?{...m,[key]:key==='tags'?value.split(',').map(v=>v.trim()).filter(Boolean):value}:m);update({...content,menu})}
  async function uploadItemPhoto(index:number,file:File){setPhotoError('');try{const photo=await compressPhotoToWebp(file);updateItem(index,'photo',photo)}catch(error){setPhotoError(error instanceof Error?error.message:'Fotoet kunne ikke gemmes.')}} 
  function addItem(){update({...content,menu:[...content.menu,{name:'Nyt menupunkt',category:'Andet',description:'',price:'',tags:[],addons:'Ikke oplyst'}]})}
  function deleteItem(index:number){update({...content,menu:content.menu.filter((_,i)=>i!==index)})}
  function exportContent(){const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cafe-glad-indhold.json';a.click();URL.revokeObjectURL(url)}
  function importContent(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result));const imported=Array.isArray(parsed.menu)?parsed.menu:defaultContent.menu;update({...defaultContent,...parsed,hours:parsed.hours&&typeof parsed.hours==='object'?parsed.hours:defaultHours,menu:imported})}catch{alert('Filen kunne ikke læses som Café GLAD-indhold.')}};reader.readAsText(file)}
  return <Shell><main id="main"><Subhero eyebrow="Lokal indholdsredigering" title="GLAD indhold" copy="Redigér indhold i denne browser. Det ændrer ikke en fælles eller publiceret hjemmeside."/>
    <section className="section"><div className="admin-wrap"><div className="notice"><strong>Kun på denne enhed.</strong> Ændringer gemmes i denne browsers lokale lager og vises ikke for andre eller på en publiceret hjemmeside. Der findes ingen fælles CMS eller serverforbindelse.</div>
    <div className="admin-tabs" role="tablist">{['Menu','Åbningstider','Catering','Kampagner','Sociale links'].map(t=><button key={t} type="button" role="tab" aria-selected={tab===t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {tab==='Menu'&&<><p className="small-muted">Redigér navn, kategori, beskrivelse, pris, tilvalg og foto. Kostmærker skal kun tilføjes, når GLAD har bekræftet dem. Priser, tilvalg og retfotos starter som ikke oplyst.</p><div className="admin-list">{content.menu.map((item,i)=><div className="admin-row" key={`${i}-${item.name}`}><div className="admin-item-fields">
      <input className="admin-field" aria-label={`Navn på menupunkt ${i+1}`} value={item.name} onChange={e=>updateItem(i,'name',e.target.value)}/>
      <input className="admin-field" aria-label={`Pris for ${item.name}`} placeholder="Pris ikke oplyst" value={item.price} onChange={e=>updateItem(i,'price',e.target.value)}/>
      <input className="admin-field field-wide" aria-label={`Beskrivelse for ${item.name}`} placeholder="Beskrivelse" value={item.description} onChange={e=>updateItem(i,'description',e.target.value)}/>
      <select className="admin-field" aria-label={`Kategori for ${item.name}`} value={item.category} onChange={e=>updateItem(i,'category',e.target.value)}>{['Morgenmad','Sandwich','Salat','Drikke','Kager','Andet'].map(c=><option key={c}>{c}</option>)}</select>
      <input className="admin-field field-wide" aria-label={`Tilvalg for ${item.name}`} placeholder="Tilvalg – ikke oplyst" value={item.addons} onChange={e=>updateItem(i,'addons',e.target.value)}/>
      <input className="admin-field field-wide" aria-label={`Kostmærker for ${item.name}`} placeholder="Bekræftede kostmærker, adskilt af komma" value={item.tags.join(', ')} onChange={e=>updateItem(i,'tags',e.target.value)}/>
      <div className="photo-upload-row">{item.photo&&<img src={item.photo} alt={`Foto valgt til ${item.name}`} width="64" height="54"/>}<label className="button-outline photo-upload">Vælg retfoto<input type="file" accept="image/*" aria-label={`Upload foto til ${item.name}`} onChange={e=>{const file=e.target.files?.[0];if(file)void uploadItemPhoto(i,file);e.target.value=''}} hidden/></label>{item.photo&&<button type="button" className="filter-chip" onClick={()=>updateItem(i,'photo','')} aria-label={`Fjern foto fra ${item.name}`}>Fjern foto</button>}</div>
      </div><button className="filter-chip admin-delete" type="button" onClick={()=>deleteItem(i)} aria-label={`Slet ${item.name}`}>×</button></div>)}</div>{photoError&&<p role="alert" className="notice">{photoError}</p>}<button className="button-outline" type="button" onClick={addItem}>+ Tilføj menupunkt</button></>}
    {tab==='Åbningstider'&&<div className="hours-editor"><p className="small-muted">Disse tider styrer visningen af åbningstider og statusmærket. GLADs angivne tider er alle dage 09.00–19.00, kaffe fra 08.30.</p><label>Åbner<input type="time" className="admin-field" value={content.hours.open} onChange={e=>validTime(e.target.value)&&update({...content,hours:{...content.hours,open:e.target.value}})}/></label><label>Lukker<input type="time" className="admin-field" value={content.hours.close} onChange={e=>validTime(e.target.value)&&update({...content,hours:{...content.hours,close:e.target.value}})}/></label><label>Kaffe fra<input type="time" className="admin-field" value={content.hours.coffee} onChange={e=>validTime(e.target.value)&&update({...content,hours:{...content.hours,coffee:e.target.value}})}/></label></div>}
    {tab==='Catering'&&<label style={{display:'grid',gap:10,maxWidth:600}}>Cateringoplysninger<textarea className="admin-field" value={content.catering} onChange={e=>update({...content,catering:e.target.value})}/></label>}
    {tab==='Kampagner'&&<label style={{display:'grid',gap:10,maxWidth:600}}>Kampagnetekst<textarea className="admin-field" value={content.promotion} onChange={e=>update({...content,promotion:e.target.value})} placeholder="Ingen kampagne angivet."/></label>}
    {tab==='Sociale links'&&<label style={{display:'grid',gap:10,maxWidth:500}}>Instagram-handle<input className="admin-field" value={content.social} onChange={e=>update({...content,social:e.target.value})}/><span className="small-muted">Indsæt kun destinationer, som ejeren har verificeret. Instagram er aktuelt @cafeglad.</span></label>}
    <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:28}}><button className="button-outline" onClick={exportContent} type="button">EKSPORTÉR JSON</button><label className="button-outline" style={{cursor:'pointer'}}>IMPORTÉR JSON<input type="file" accept="application/json" onChange={importContent} hidden/></label>{saved&&<span role="status" className="notice" style={{margin:0,padding:'10px 16px'}}>Gemt lokalt på denne enhed.</span>}</div>
    </div></section></main></Shell>;
}
function Router() {
  const [path]=useLocation();
  usePageMeta(path);
  useEffect(()=>{window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})},[path]);
  return <ErrorBoundary resetKey={path}><Switch>
    <Route path="/" component={Home}/><Route path="/menu" component={MenuPage}/><Route path="/takeaway-aarhus" component={TakeawayPage}/>
    <Route path="/catering-aarhus" component={()=><CateringPage/>}/><Route path="/firmafrokost-aarhus" component={FirmCateringPage}/>
    <Route path="/om-glad" component={AboutPage}/><Route path="/kontakt" component={ContactPage}/><Route path="/admin" component={AdminPage}/><Route component={NotFound}/>
  </Switch></ErrorBoundary>;
}
function FirmCateringPage() { return <CateringPage firm/>; }
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;
