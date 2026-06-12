const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--gold:#C4A35A;--gold-light:#D4B36A;--gold-dim:rgba(196,163,90,0.12);--gold-border:rgba(196,163,90,0.22);--bg:#000;--surface:#070707;--surface2:#0d0d0d;--text:#fff;--muted:#555;--muted2:#888;--accent:#00D4AA;--danger:#ff4d4d;--radius:12px}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.6;overflow-x:hidden}
a{color:var(--gold);text-decoration:none;transition:color .15s}a:hover{color:#fff}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}

.hdr{position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(196,163,90,0.12);background:rgba(0,0,0,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.hdr-inner{max-width:1000px;margin:0 auto;padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:10px;font-size:1rem;font-weight:800;letter-spacing:-0.02em;color:#fff}
.logo-mark{width:28px;height:28px;background:var(--gold);border:1px solid var(--gold);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#000}
.logo em{font-style:normal;color:var(--gold)}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite;flex-shrink:0}
.nav{display:flex;align-items:center;gap:6px}
.nav a{color:rgba(255,255,255,0.5);font-size:0.82rem;font-weight:500;padding:6px 11px;border-radius:7px;transition:color .15s,background .15s}
.nav a:hover{color:#fff;background:rgba(255,255,255,0.05)}
.nav a.active{color:#fff;background:rgba(255,255,255,0.07)}
.nav-cta{background:var(--gold)!important;color:#000!important;font-weight:700!important;padding:8px 20px!important;border-radius:8px!important;font-size:0.82rem!important;letter-spacing:0.01em!important;transition:background .15s,transform .12s,box-shadow .15s!important;box-shadow:none!important}
.nav-cta:hover{background:var(--gold-light)!important;color:#000!important;transform:translateY(-1px)!important;box-shadow:0 4px 16px rgba(196,163,90,0.28)!important}
.nav-ai-btn{color:var(--accent)!important;border:1px solid rgba(0,212,170,0.3)!important;border-radius:7px!important;padding:5px 13px!important;font-size:0.82rem!important;font-weight:600!important;transition:color .15s,border-color .15s,background .15s!important}
.nav-ai-btn:hover,.nav-ai-btn.nav-ai-active{background:rgba(0,212,170,0.08)!important;border-color:rgba(0,212,170,0.5)!important;color:var(--accent)!important}
.nav-donate{color:rgba(255,255,255,0.5)!important;transition:color .15s,background .15s!important}
.nav-donate:hover{color:#fff!important;background:rgba(255,255,255,0.05)!important;text-shadow:none!important}
.mob-ai{color:var(--accent)!important;font-weight:600!important}
.nav-oracle-pill{display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:600;color:rgba(255,255,255,0.55);padding:4px 10px;border:1px solid #1e1e1e;border-radius:6px;transition:color .15s,border-color .15s;white-space:nowrap}
.nav-oracle-pill:hover,.nav-oracle-pill.active{color:var(--gold);border-color:var(--gold-border)}
.nav-guide-pill{display:inline-flex;align-items:center;font-size:0.71rem;font-weight:600;color:rgba(255,255,255,0.38);padding:4px 10px;border:1px solid #1a1a1a;border-radius:6px;transition:color .15s,border-color .15s;white-space:nowrap}
.nav-guide-pill:hover,.nav-guide-pill.active{color:var(--gold);border-color:var(--gold-border)}
.nav-guide-pill:hover{color:var(--gold);border-color:var(--gold-border)}

.hero{max-width:820px;margin:0 auto;padding:72px 28px 52px;text-align:center}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--gold-dim);border:1px solid var(--gold-border);color:var(--gold);font-size:0.72rem;font-weight:700;padding:5px 14px;border-radius:100px;margin-bottom:28px;letter-spacing:0.05em;text-transform:uppercase}
.hero h1{font-size:clamp(2.2rem,5vw,3.4rem);font-weight:800;letter-spacing:-0.04em;line-height:1.06;margin-bottom:16px}
.hero h1 em{font-style:normal;color:var(--gold)}
.hero-sub{font-size:0.97rem;color:var(--muted2);max-width:500px;margin:0 auto}

.status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:780px;margin:48px auto 0}
.stat-card{background:var(--surface);border:1px solid #111;border-radius:var(--radius);padding:22px 20px;text-align:center;transition:border-color .2s}
.stat-card:hover{border-color:var(--gold-border)}
.stat-card.accent-border{border-color:rgba(0,212,170,0.2)}
.stat-num{font-size:2rem;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px}
.stat-num.gold{color:var(--gold)}.stat-num.green{color:var(--accent)}
.stat-label{font-size:0.75rem;color:var(--muted2);font-weight:500}

.lp-wrap{max-width:780px;margin:40px auto 0;background:var(--surface);border:1px solid var(--gold-border);border-radius:var(--radius);padding:28px;text-align:center}
.lp-eyebrow{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted2);margin-bottom:10px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px}
.lp-price{font-size:2.6rem;font-weight:800;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;margin-bottom:18px}
.lp-stats{display:flex;border-top:1px solid #111;padding-top:16px}
.lp-stat{flex:1;text-align:center;border-right:1px solid #111;padding:0 8px}
.lp-stat:last-child{border-right:none}
.lp-stat-label{font-size:0.7rem;color:var(--muted2);margin-bottom:4px}
.lp-stat-val{font-size:0.92rem;font-weight:700;font-variant-numeric:tabular-nums}
.up{color:var(--accent)}.down{color:var(--danger)}

.section{max-width:1000px;margin:0 auto;padding:72px 28px 0}
.sec-title{font-size:1.3rem;font-weight:800;letter-spacing:-0.025em;margin-bottom:6px}
.sec-title span{color:var(--gold)}
.sec-sub{font-size:0.84rem;color:var(--muted2);margin-bottom:28px}

.ep-list{display:flex;flex-direction:column;gap:8px}
.ep{background:var(--surface);border:1px solid #111;border-radius:10px;padding:14px 18px;display:flex;align-items:flex-start;gap:12px;transition:border-color .2s}
.ep:hover{border-color:var(--gold-border)}
.ep-method{font-size:0.68rem;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:0.06em;white-space:nowrap;flex-shrink:0;margin-top:3px}
.m-get{background:rgba(0,212,170,0.1);color:var(--accent);border:1px solid rgba(0,212,170,0.22)}
.ep-path{font-family:'Menlo','Monaco',monospace;font-size:0.83rem;color:#fff;margin-bottom:3px}
.ep-desc{font-size:0.79rem;color:var(--muted2);line-height:1.55}
.ep-try{margin-top:7px}
.ep-try a{font-size:0.72rem;color:var(--gold);border:1px solid var(--gold-border);padding:2px 10px;border-radius:4px;transition:background .15s,color .15s}
.ep-try a:hover{background:var(--gold-dim);color:#fff}

.tools-cta{max-width:1000px;margin:48px auto 0;padding:0 28px}
.tools-cta-inner{background:var(--surface);border:1px solid var(--gold-border);border-radius:16px;padding:32px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.tools-cta-text h3{font-size:1.1rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:6px}
.tools-cta-text p{font-size:0.84rem;color:var(--muted2);max-width:420px;line-height:1.65}
.tools-cta-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.tbadge{font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:5px;letter-spacing:0.04em;text-transform:uppercase}
.tbadge.free{background:rgba(136,136,136,0.1);color:var(--muted2);border:1px solid #222}
.tbadge.starter{background:var(--gold-dim);color:var(--gold);border:1px solid var(--gold-border)}
.tbadge.pro{background:rgba(100,160,255,0.1);color:#64A0FF;border:1px solid rgba(100,160,255,0.2)}
.tbadge.biz{background:rgba(255,100,100,0.1);color:#FF7070;border:1px solid rgba(255,100,100,0.2)}
.btn-tools{background:var(--gold);color:#000;font-weight:800;font-size:0.88rem;padding:13px 28px;border-radius:10px;white-space:nowrap;transition:background .15s,transform .1s;display:inline-block}
.btn-tools:hover{background:var(--gold-light);color:#000;transform:translateY(-1px)}

.donate-cta{max-width:1000px;margin:40px auto 0;padding:0 28px 72px}
.donate-cta-inner{background:linear-gradient(135deg,rgba(196,163,90,0.07) 0%,rgba(0,0,0,0) 60%);border:1px solid var(--gold-border);border-radius:16px;padding:36px;text-align:center}
.donate-cta-inner h3{font-size:1.15rem;font-weight:800;letter-spacing:-0.025em;margin-bottom:10px}
.donate-cta-inner p{font-size:0.87rem;color:var(--muted2);max-width:460px;margin:0 auto 24px;line-height:1.7}
.btn-donate{display:inline-flex;align-items:center;gap:9px;background:var(--gold);color:#000;font-weight:800;font-size:0.9rem;padding:13px 32px;border-radius:100px;transition:background .15s,box-shadow .2s,transform .15s;box-shadow:0 0 20px rgba(196,163,90,0.22)}
.btn-donate:hover{background:var(--gold-light);color:#000;transform:translateY(-2px);box-shadow:0 0 32px rgba(196,163,90,0.42)}
.donate-note{margin-top:14px;font-size:0.75rem;color:var(--muted2)}

.tool-card{background:var(--surface);border:1px solid var(--gold-border);border-radius:var(--radius);padding:22px}
.field{margin-bottom:14px}
.field label{display:block;font-size:0.72rem;color:var(--muted2);margin-bottom:6px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase}
.field select{width:100%;background:var(--surface2);border:1px solid #1c1c1c;border-radius:8px;color:#fff;padding:9px 12px;font-size:0.85rem;outline:none;font-family:inherit;transition:border-color .15s;min-height:44px}
.field select:focus{border-color:var(--gold-border)}
.field select option{background:#111}
.tool-btn{width:100%;background:var(--gold);color:#000;border:none;padding:11px;border-radius:8px;font-weight:700;font-size:0.88rem;cursor:pointer;font-family:inherit;transition:background .15s;min-height:44px}
.tool-btn:hover{background:var(--gold-light)}
.tool-result{margin-top:12px;font-size:0.83rem;min-height:16px}
.tool-result.ok{color:var(--accent)}.tool-result.err{color:var(--danger)}.tool-result.loading{color:var(--muted2)}
.json-out{display:none;margin-top:12px;background:var(--surface2);border:1px solid #1a1a1a;border-radius:8px;padding:12px;font-family:'Menlo','Monaco',monospace;font-size:0.76rem;color:#aaa;overflow-x:auto;white-space:pre;max-height:220px;overflow-y:auto}
.json-out.visible{display:block}

.footer{border-top:1px solid #080808;padding:32px 28px;text-align:center;color:var(--muted2);font-size:0.76rem;margin-top:72px}
.footer-links{display:flex;justify-content:center;gap:24px;margin-bottom:12px;flex-wrap:wrap}
.footer-links a{color:var(--muted2)}
.badge-strip{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:32px auto 0;max-width:820px;padding:0 28px}
.sbadge{display:inline-flex;align-items:center;background:var(--surface);border:1px solid #1a1a1a;border-radius:6px;overflow:hidden;font-size:0.72rem}
.sbk{padding:4px 10px;color:var(--muted2);font-weight:500;border-right:1px solid #161616;white-space:nowrap}
.sbv{padding:4px 10px;font-weight:700;white-space:nowrap}
.sbv-green{background:#00D4AA;color:#000}
.sbv-gold{background:var(--gold);color:#000}
.sbv-blue{background:#3B82F6;color:#fff}
.sbv-teal{background:rgba(0,212,170,0.12);color:var(--accent)}
.sbv-gray{background:#1a1a1a;color:#aaa}
.cmp-wrap{max-width:780px;margin:40px auto 0;padding:0 28px}
.cmp-card{background:var(--surface);border:1px solid #111;border-radius:var(--radius);overflow:hidden}
.cmp-head{display:grid;grid-template-columns:1fr 64px 1fr;background:var(--surface2);border-bottom:1px solid #0d0d0d;padding:10px 24px;align-items:center;text-align:center;gap:8px}
.cmp-head-label{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted2)}
.cmp-body{display:grid;grid-template-columns:1fr 64px 1fr;padding:28px 24px;align-items:center;text-align:center;gap:8px}
.cmp-cost{font-size:2.4rem;font-weight:800;letter-spacing:-0.04em;line-height:1}
.cmp-cost.red{color:#ff5555}
.cmp-cost.green{color:var(--accent)}
.cmp-detail{font-size:0.77rem;color:var(--muted2);margin-top:6px}
.cmp-detail.hi{color:var(--accent)}
.cmp-vs{font-size:0.82rem;font-weight:700;color:var(--muted);text-align:center}
.cmp-note{font-size:0.72rem;text-align:center;color:var(--muted);padding:10px 24px;border-top:1px solid #0a0a0a;background:var(--surface2);letter-spacing:0.03em}
.nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:520px;margin:40px auto 0;padding:0 28px}
.ngi{background:var(--surface);border:1px solid #111;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px;text-decoration:none;transition:border-color .2s,background .15s}
.ngi:hover{border-color:var(--gold-border);background:rgba(196,163,90,0.04)}
.ngi-ico{width:30px;height:30px;border-radius:7px;background:rgba(196,163,90,0.08);border:1px solid rgba(196,163,90,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.9rem}
.ngi-ico.g{background:rgba(0,212,170,0.08);border-color:rgba(0,212,170,0.2)}
.ngi span{font-size:0.82rem;font-weight:600;color:#ccc}
.ngi:hover span{color:#fff}
@media(max-width:640px){.cmp-head,.cmp-body{grid-template-columns:1fr 48px 1fr}.cmp-cost{font-size:1.7rem}.nav-grid{grid-template-columns:1fr}}

.why-wrap{max-width:780px;margin:40px auto 0;padding:0 28px}
.why-title{font-size:1.15rem;font-weight:800;letter-spacing:-0.025em;margin-bottom:16px}
.why-table{background:var(--surface);border:1px solid #111;border-radius:var(--radius);overflow:hidden}
.wt-head{display:grid;grid-template-columns:1fr 160px 140px;padding:11px 18px;background:var(--surface2);border-bottom:1px solid #0d0d0d;font-size:0.73rem;font-weight:700;letter-spacing:0.04em}
.wt-row{display:grid;grid-template-columns:1fr 160px 140px;padding:11px 18px;border-bottom:1px solid #0a0a0a;font-size:0.82rem;align-items:center}
.wt-row:last-child{border-bottom:none}
.wt-row:hover{background:rgba(255,255,255,0.02)}
.wt-feat{color:#ccc}
.wt-col{text-align:center;font-size:0.82rem}
.wt-col.muted{color:var(--muted2)}
.wt-col.gold{color:var(--gold);font-weight:700}
.wt-col.bold{font-size:1rem;font-weight:800}
.wt-check{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;background:rgba(0,212,170,0.15);color:var(--accent);font-size:0.85rem;font-weight:700}
.wt-x{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;background:rgba(255,77,77,0.1);color:#ff5555;font-size:0.85rem;font-weight:700}
@media(max-width:640px){.wt-head,.wt-row{grid-template-columns:1fr 80px 80px;padding:10px 12px}.wt-feat{font-size:0.76rem}}
.hbg{display:none;background:none;border:none;cursor:pointer;padding:8px;flex-direction:column;gap:5px;justify-content:center;align-items:center;flex-shrink:0}
.hbg span{display:block;width:20px;height:2px;background:var(--muted2);border-radius:2px;transition:all .25s}
.hbg.is-open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hbg.is-open span:nth-child(2){opacity:0}
.hbg.is-open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mob-nav{display:none;position:fixed;top:60px;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);padding:16px 20px 40px;z-index:998;flex-direction:column;gap:0;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);overflow-y:auto}
.mob-nav.is-open{display:flex}
.mob-nav a{display:block;padding:14px 16px;color:var(--muted2);font-size:0.95rem;font-weight:500;border-radius:10px;transition:color .15s,background .15s;border-bottom:1px solid #0d0d0d}
.mob-nav a.mob-active{color:var(--gold);background:rgba(196,163,90,0.08)}
.mob-nav .mob-cta{background:var(--gold);color:#000!important;font-weight:800;text-align:center;margin-top:14px;border-radius:10px;padding:15px 16px!important;border:none;display:block;border-bottom:none!important;font-size:0.95rem}
.mob-nav .mob-ai{color:var(--accent)!important;border:1px solid rgba(0,212,170,0.3);border-radius:8px;text-align:center;margin-top:6px;border-bottom:none!important;padding:12px 16px!important;font-weight:600!important}
@media(max-width:480px){.nav-guide-pill{display:none}}
@media(max-width:640px){
  .status-grid{grid-template-columns:1fr 1fr}
  .lp-stats{flex-wrap:wrap}
  .lp-stat{min-width:50%;border-bottom:1px solid #111;padding:8px 0}
  .lp-stat:last-child{border-bottom:none}
  .tools-cta-inner{flex-direction:column;text-align:center}
  .tools-cta-text p{max-width:100%}
  .hbg{display:flex}
  .nav a{display:none!important}
  .hdr-inner{padding:0 16px}
  .section{padding:0 16px 60px}
  .wrap{padding:0 16px}
  .ep-list{gap:10px}
  .ep{padding:14px 16px;flex-direction:column;gap:8px}
  .ep-method{align-self:flex-start}
  .field select,.tool-btn{font-size:0.9rem}
  .donate-cta-inner{padding:24px 16px}
  .btn-donate{width:100%;justify-content:center}
}
`;

export function renderHome(socialUrl: string): string {
  const base = socialUrl || "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KTA Oracle — Intelligence Engine</title>
<meta name="description" content="KTA Oracle — real-time price intelligence, FX rates, whale detection and on-chain analytics. Powered by Keeta Network.">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>${CSS}</style>
</head>
<body>

<header class="hdr">
  <div class="hdr-inner">
    <div style="display:flex;align-items:center;gap:8px">
      <a href="${base}/onboard" class="logo" style="text-decoration:none">
        <div class="logo-mark"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg></div>
        KTA <em>Oracle</em>
      </a>
      <div style="width:1px;height:16px;background:#1e1e1e;margin:0 2px;flex-shrink:0"></div>
      <a href="${base ? base+'/oracle' : '#'}" class="nav-oracle-pill active"><span class="live-dot" style="width:5px;height:5px;flex-shrink:0"></span>Oracle</a>
      ${base ? `<a href="${base}/guide" class="nav-guide-pill">Guide</a>` : ''}
    </div>
    <nav class="nav">
      ${base ? `<a href="${base}/onboard">Onboard</a>` : ''}
      ${base ? `<a href="${base}/checkout">Pricing</a>` : ''}
      <a href="#sdk-tools">Tools</a>
      ${base ? `<a href="${base}/donate" class="nav-donate">Donate</a>` : ''}
      ${base ? `<a href="${base}/tools#ai" class="nav-ai-btn">Connect AI</a>` : ''}
      ${base ? `<a href="${base}/checkout" class="nav-cta">Get access →</a>` : ''}
    </nav>
    <button class="hbg" id="hbg-btn" onclick="toggleMobNav()" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</header>
<nav class="mob-nav" id="mob-nav">
  <a href="${base ? base+'/oracle' : '#'}">Oracle</a>
  ${base ? `<a href="${base}/onboard">Onboard</a>` : ''}
  ${base ? `<a href="${base}/guide">Guide</a>` : ''}
  ${base ? `<a href="${base}/checkout">Pricing</a>` : ''}
  <a href="#sdk-tools">Tools</a>
  ${base ? `<a href="${base}/donate" class="mob-donate">Donate</a>` : ''}
  ${base ? `<a href="${base}/tools#ai" class="mob-ai">Connect AI</a>` : ''}
  ${base ? `<a href="${base}/checkout" class="mob-cta">Get access →</a>` : ''}
</nav>
<script>
function toggleMobNav(){var b=document.getElementById('hbg-btn'),m=document.getElementById('mob-nav');if(!b||!m)return;b.classList.toggle('is-open');m.classList.toggle('is-open');}
document.addEventListener('click',function(e){var m=document.getElementById('mob-nav'),b=document.getElementById('hbg-btn');if(!m||!m.classList.contains('is-open'))return;if(!m.contains(e.target)&&(!b||!b.contains(e.target))){m.classList.remove('is-open');if(b)b.classList.remove('is-open');}});
</script>

<section class="hero">
  <div class="hero-badge"><span class="live-dot"></span>Live · Keeta Network · 0.4s settlement</div>
  <h1>KTA <em>Oracle</em><br>Intelligence Engine</h1>
  <p class="hero-sub">Real-time price data, FX rates, whale detection, and on-chain analytics — running natively on Keeta Network.</p>

  <div class="badge-strip">
    <div class="sbadge"><span class="sbk">Currencies</span><span class="sbv sbv-gray">160+</span></div>
    <div class="sbadge"><span class="sbk">Settlement</span><span class="sbv sbv-gold">0.4s</span></div>
    <div class="sbadge"><span class="sbk">Tools</span><span class="sbv sbv-teal">19 active</span></div>
    <div class="sbadge"><span class="sbk">Uptime</span><span class="sbv sbv-blue">99.9% SLA</span></div>
    <div class="sbadge"><span class="sbk">Network</span><span class="sbv sbv-gold">Keeta</span></div>
    <div class="sbadge"><span class="sbk">Chain</span><span class="sbv sbv-gold">Decentralized</span></div>
    <div class="sbadge"><a href="https://github.com/Elemzir/KTA-Oracle" target="_blank" rel="noopener" style="text-decoration:none"><span class="sbk">GitHub</span><span class="sbv sbv-teal">Open ↗</span></a></div>
  </div>
</section>

<div style="max-width:1000px;margin:0 auto;padding:40px 28px 0">
  <div class="lp-wrap">
    <div class="lp-eyebrow"><span class="live-dot"></span>KTA / USD — Updating every 30s</div>
    <div class="lp-price" id="lp-price">—</div>
    <div class="lp-stats">
      <div class="lp-stat"><div class="lp-stat-label">1h change</div><div class="lp-stat-val" id="lp-1h">—</div></div>
      <div class="lp-stat"><div class="lp-stat-label">24h change</div><div class="lp-stat-val" id="lp-24h">—</div></div>
      <div class="lp-stat"><div class="lp-stat-label">7d change</div><div class="lp-stat-val" id="lp-7d">—</div></div>
    </div>
  </div>
</div>

<div class="cmp-wrap">
  <div class="cmp-card">
    <div class="cmp-head">
      <div class="cmp-head-label">SWIFT wire — $50,000</div>
      <div></div>
      <div class="cmp-head-label">Keeta Network — $50,000</div>
    </div>
    <div class="cmp-body">
      <div>
        <div class="cmp-cost red">~$1,050</div>
        <div class="cmp-detail">3–5 business days</div>
      </div>
      <div class="cmp-vs">vs</div>
      <div>
        <div class="cmp-cost green">$75</div>
        <div class="cmp-detail hi">0.4 seconds</div>
      </div>
    </div>
    <div class="cmp-note">14× cheaper &nbsp;·&nbsp; 1,080,000× faster &nbsp;·&nbsp; same global finality</div>
  </div>
</div>

<div class="why-wrap">
  <div class="why-title">Why KTA-Oracle?</div>
  <div class="why-table">
    <div class="wt-head">
      <div class="wt-feat"></div>
      <div class="wt-col muted">Most MCP servers</div>
      <div class="wt-col gold">KTA-Oracle</div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">Tools available</div>
      <div class="wt-col muted">1–5</div>
      <div class="wt-col gold bold">19</div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">AI-powered reasoning on every response</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">Tiered subscriptions + on-chain payments</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">Agent-specific onboarding (autonomous)</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">AML + compliance tools</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">Production SDK code snippets</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">Rate limiting + abuse protection</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
    <div class="wt-row">
      <div class="wt-feat">Listed on 5+ marketplaces</div>
      <div class="wt-col"><span class="wt-x">✕</span></div>
      <div class="wt-col"><span class="wt-check">✓</span></div>
    </div>
  </div>
</div>

<div class="nav-grid" style="margin-bottom:0">
  ${base ? `<a href="${base}/onboard" class="ngi"><div class="ngi-ico">🌐</div><span>Live Portal</span></a>` : ''}
  <a href="/health" class="ngi"><div class="ngi-ico g"><span style="color:var(--accent);font-size:0.65rem">●</span></div><span>System Status</span></a>
  ${base ? `<a href="${base}/guide" class="ngi"><div class="ngi-ico">📖</div><span>How to Use</span></a>` : ''}
  ${base ? `<a href="${base}/legal" class="ngi"><div class="ngi-ico">🔒</div><span>Legal &amp; Privacy</span></a>` : ''}
  ${base ? `<a href="${base}/onboard#status" class="ngi"><div class="ngi-ico">💳</div><span>Account &amp; Tier Status</span></a>` : ''}
  <a href="https://x.com/elemzir" target="_blank" rel="noopener" class="ngi"><div class="ngi-ico">💬</div><span>Support on X</span></a>
  ${base ? `<a href="${base}/guide" class="ngi"><div class="ngi-ico">🔧</div><span>Troubleshoot</span></a>` : ''}
  ${base ? `<a href="${base}/onboard#register" class="ngi"><div class="ngi-ico">👤</div><span>Social Agent</span></a>` : ''}
</div>

<div class="tools-cta" id="sdk-tools" style="margin-top:40px">
  <div class="tools-cta-inner">
    <div class="tools-cta-text">
      <h3>19 SDK tools — all active</h3>
      <p>From live price queries to on-chain certificate operations, wallet scoring, and compliance checks. Each tool is built directly on the Keeta Network SDK and available across all tiers.</p>
      <div class="tools-cta-badges">
        <span class="tbadge free">Free</span>
        <span class="tbadge starter">Starter</span>
        <span class="tbadge pro">Pro</span>
        <span class="tbadge biz">Business</span>
      </div>
    </div>
    ${base ? `<a href="${base}/tools" class="btn-tools">Browse all 19 tools →</a>` : ''}
  </div>
</div>

<section class="section" id="endpoints">
  <div class="sec-title">Public <span>endpoints</span></div>
  <div class="sec-sub">All endpoints return JSON. Verify your wallet in the Try it section below to test live.</div>
  <div style="position:relative">
    <div id="endpoints-lock" style="position:absolute;inset:0;z-index:10;background:rgba(0,0,0,0.62);backdrop-filter:blur(4px);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <div style="font-size:0.78rem;color:rgba(196,163,90,0.6);font-weight:600">Verify wallet in Try it below to unlock</div>
    </div>
    <div id="endpoints-grid" style="opacity:0.25;pointer-events:none;transition:opacity .3s">
      <div class="ep-list">
        <div class="ep">
          <span class="ep-method m-get">GET</span>
          <div>
            <div class="ep-path">/price</div>
            <div class="ep-desc">Current KTA/USD price with 1h, 24h, and 7d change percentages. Sourced natively from Keeta Network.</div>
            <div class="ep-try"><a href="/price" target="_blank" rel="noopener">Try live →</a></div>
          </div>
        </div>
        <div class="ep">
          <span class="ep-method m-get">GET</span>
          <div>
            <div class="ep-path">/rate?currency=EUR</div>
            <div class="ep-desc">KTA exchange rate for a given currency. Supported: USD, EUR, GBP, SEK, NOK, JPY, AED, SGD.</div>
            <div class="ep-try"><a href="/rate?currency=EUR" target="_blank" rel="noopener">Try live →</a></div>
          </div>
        </div>
        <div class="ep">
          <span class="ep-method m-get">GET</span>
          <div>
            <div class="ep-path">/whale/alerts</div>
            <div class="ep-desc">Recent large on-chain KTA movements, classified as whale, institutional, or mega-whale.</div>
            <div class="ep-try"><a href="/whale/alerts" target="_blank" rel="noopener">Try live →</a></div>
          </div>
        </div>
        <div class="ep">
          <span class="ep-method m-get">GET</span>
          <div>
            <div class="ep-path">/subscription?wallet=</div>
            <div class="ep-desc">Returns tier, expiry, and social lifetime status for a given wallet address.</div>
            <div class="ep-try"><a href="/subscription?wallet=" target="_blank" rel="noopener">Try live →</a></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="tools" style="padding-bottom:0">
  <div class="sec-title">Try the <span>oracle</span></div>
  <div class="sec-sub">Active wallet required — Free tier (0.1 KTA) or above</div>

  <div class="tool-card" style="max-width:600px;margin:0 auto 20px">
    <div style="font-size:0.88rem;font-weight:700;color:#fff;margin-bottom:12px">Verify your wallet</div>
    <div style="font-size:0.78rem;color:var(--muted2);margin-bottom:14px">Enter your registered <code style="color:var(--gold);font-size:0.76rem">keeta_</code> wallet to unlock the live tools below. Free tier (0.1 KTA) is the minimum.</div>
    <div style="display:flex;gap:8px">
      <input type="text" id="tool-wallet" placeholder="keeta_ your wallet address" style="flex:1;background:#0d0d0d;border:1px solid #1c1c1c;border-radius:8px;color:#fff;padding:9px 12px;font-size:0.82rem;outline:none;font-family:inherit" onfocus="this.style.borderColor='rgba(196,163,90,0.35)'" onblur="this.style.borderColor='#1c1c1c'" onkeydown="if(event.key==='Enter')verifyWallet()">
      <button class="tool-btn" style="width:auto;padding:9px 20px;white-space:nowrap" onclick="verifyWallet()">Verify</button>
    </div>
    <div class="tool-result" id="wallet-status" style="margin-top:10px"></div>
    ${base ? `<div style="font-size:0.74rem;color:var(--muted2);margin-top:10px">No wallet yet? <a href="${base}/onboard" style="color:var(--gold)">Register for free →</a></div>` : ''}
  </div>

  <div style="position:relative">
    <div id="tools-lock" style="position:absolute;inset:0;z-index:10;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(196,163,90,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <div style="font-size:0.78rem;color:rgba(196,163,90,0.6);font-weight:600">Verify wallet above to unlock</div>
    </div>
    <div id="tools-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;opacity:0.25;pointer-events:none;transition:opacity .3s">
      <div class="tool-card">
        <div class="field">
          <label style="font-size:0.88rem;font-weight:700;text-transform:none;letter-spacing:0;color:#fff;margin-bottom:12px;display:block">Exchange rate</label>
          <label>Currency</label>
          <select id="rate-currency">
            <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
            <option value="SEK">SEK</option><option value="NOK">NOK</option><option value="JPY">JPY</option>
            <option value="AED">AED</option><option value="SGD">SGD</option>
          </select>
        </div>
        <button class="tool-btn" onclick="fetchRate()">Get rate</button>
        <div class="tool-result" id="rate-result"></div>
      </div>
      <div class="tool-card">
        <div class="field">
          <label style="font-size:0.88rem;font-weight:700;text-transform:none;letter-spacing:0;color:#fff;margin-bottom:12px;display:block">Whale alerts</label>
          <label style="color:var(--muted2);font-size:0.7rem">Results limited by your tier</label>
        </div>
        <button class="tool-btn" onclick="fetchWhales()">Load whale alerts</button>
        <div class="tool-result" id="whale-tier-note" style="margin-top:8px"></div>
        <div class="json-out" id="whale-out"></div>
        <input type="hidden" id="whale-wallet">
      </div>
    </div>
  </div>
</section>

<div class="donate-cta">
  <div class="donate-cta-inner">
    <h3>Keep the Oracle alive ⚡</h3>
    <p>KTA Oracle is an independent project running 24/7 on Keeta Network. Every donation goes directly toward keeping the price engine, AI insights, and whale tracking running for the whole community.</p>
    ${base ? `<a href="${base}/donate" class="btn-donate">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
      Support the project
    </a>` : ''}
    <div class="donate-note">Accepts KTA · Visa Direct</div>
  </div>
</div>

<footer class="footer">
  <div class="footer-links">
    ${base ? `<a href="${base}/onboard">Onboard</a>` : ''}
    ${base ? `<a href="${base}/tools">Tools</a>` : ''}
    ${base ? `<a href="${base}/checkout">Pricing</a>` : ''}
    ${base ? `<a href="${base}/donate">Donate</a>` : ''}
    ${base ? `<a href="${base}/legal">Legal</a>` : ''}
    ${base ? `<a href="${base}/privacy">Privacy</a>` : ''}
    <a href="https://x.com/elemzir" target="_blank" rel="noopener">@elemzir</a>
  </div>
  <div style="margin-bottom:8px">KTA Oracle Agent &nbsp;·&nbsp; Powered by Keeta Network &nbsp;·&nbsp; Sweden, EU</div>
  <div style="font-size:0.71rem;letter-spacing:0.03em">&copy; 2026 ELEMZIR. All rights reserved.</div>
</footer>

<script>
(function(){
  function fmt(n){return n==null?'—':(n>=0?'+':'')+n.toFixed(2)+'%'}
  function cls(n){return n==null?'':(n>=0?' up':' down')}
  async function load(){
    try{
      var r=await fetch('/price',{signal:AbortSignal.timeout(8000)});if(!r.ok)return;
      var d=await r.json();
      var priceTxt='$'+Number(d.price).toFixed(6);
      document.getElementById('lp-price').textContent=priceTxt;
      document.getElementById('lp-price-sm').textContent=priceTxt;
      var e1=document.getElementById('lp-1h');e1.textContent=fmt(d.change_pct);e1.className='lp-stat-val'+cls(d.change_pct);
      var e2=document.getElementById('lp-24h');e2.textContent=fmt(d.change_24h);e2.className='lp-stat-val'+cls(d.change_24h);
      var e3=document.getElementById('lp-7d');e3.textContent=fmt(d.change_7d);e3.className='lp-stat-val'+cls(d.change_7d);
    }catch(e){}
  }
  load();setInterval(load,30000);
})();

async function fetchRate(){
  var cur=document.getElementById('rate-currency').value;
  var res=document.getElementById('rate-result');
  res.className='tool-result loading';res.textContent='Fetching…';
  try{
    var r=await fetch('/rate?currency='+cur,{signal:AbortSignal.timeout(8000)});
    var d=await r.json();
    if(d.rate){res.className='tool-result ok';res.textContent='1 KTA = '+d.rate+' '+cur;}
    else{res.className='tool-result err';res.textContent=d.error||'Error';}
  }catch(e){res.className='tool-result err';res.textContent='Network error';}
}

var _activeTier='';

async function verifyWallet(){
  var wallet=(document.getElementById('tool-wallet').value||'').trim();
  var status=document.getElementById('wallet-status');
  if(!wallet.startsWith('keeta_')){
    status.className='tool-result err';
    status.textContent='Enter a valid keeta_ wallet address.';
    return;
  }
  status.className='tool-result loading';
  status.textContent='Checking…';
  try{
    var r=await fetch('/subscription?wallet='+encodeURIComponent(wallet));
    var d=await r.json();
    var t=(d.tier||'').toLowerCase();
    if(t==='free'||t==='starter'||t==='social'||t==='pro'||t==='business'){
      _activeTier=t;
      document.getElementById('whale-wallet').value=wallet;
      document.getElementById('tools-lock').style.display='none';
      document.getElementById('endpoints-lock').style.display='none';
      var grid=document.getElementById('tools-grid');
      grid.style.opacity='1';
      grid.style.pointerEvents='auto';
      var epGrid=document.getElementById('endpoints-grid');
      epGrid.style.opacity='1';
      epGrid.style.pointerEvents='auto';
      status.className='tool-result ok';
      status.textContent='✓ Active — '+t+' tier. Tools unlocked.';
    } else {
      status.className='tool-result err';
      status.textContent='Wallet not activated. Send 0.1 KTA and activate at /onboard first.';
    }
  }catch(e){
    status.className='tool-result err';
    status.textContent='Could not verify. Try again.';
  }
}

async function fetchWhales(){
  var wallet=(document.getElementById('whale-wallet').value||'').trim();
  var note=document.getElementById('whale-tier-note');
  var out=document.getElementById('whale-out');
  out.className='json-out visible';out.textContent='Loading…';
  note.textContent='';
  var t=_activeTier||'free';
  var limit=(t==='business'||t==='pro'||t==='social')?9999:(t==='starter'?3:1);
  var tierLabel=(t==='business'||t==='pro'||t==='social')?(t+' — unlimited'):(t==='starter'?'starter — up to 3':'free — 1 alert');
  try{
    var r=await fetch('/whale/alerts');
    if(!r.ok){out.textContent='Service unavailable.';return;}
    var d=await r.json();
    var all=d.alerts||[];
    var shown=all.slice(0,limit);
    note.className='tool-result ok';
    note.textContent='Tier: '+tierLabel+(all.length?'  ·  showing '+shown.length+' of '+all.length:'');
    if(!shown.length){out.textContent='No whale activity detected yet.';}
    else{out.textContent=JSON.stringify(shown,null,2);}
  }catch(e){out.textContent='Network error — try again.';}
}
</script>
</body>
</html>`;
}
