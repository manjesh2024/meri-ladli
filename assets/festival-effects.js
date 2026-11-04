(() => {
  "use strict";
  window.__festivalCanvasActive = true;
  const host = document.getElementById("festivalEffects");
  if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const colors = ["#fff0bd","#ffd16d","#ffad70","#f4a9b7","#f1d7ff","#fff8e9"];
  const palettes = [
    ["#fff1b8","#ffc45f","#ff8a45","#f34b8a","#cf66ff"],
    ["#fff8d4","#ffd05d","#ff9a37","#f6e6ff","#b58bff"],
    ["#ffe6c3","#ff9d65","#ff5e83","#c86bff","#73caff"],
    ["#fff0b3","#ffcf6d","#f8a0cf","#f5e3a0","#a6d8ff"]
  ];
  let w = 0, h = 0, dpr = 1, raf = 0, started = 0;
  let trails = [[], []];
  const embers = [], trailDots = [], grand = [], small = [], rockets = [];

  const cubic = (a,b,c,d,t) => {
    const u = 1-t;
    return {
      x: u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],
      y: u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]
    };
  };
  function resize() {
    w = innerWidth; h = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(w*dpr));
    canvas.height = Math.max(1, Math.round(h*dpr));
    canvas.style.width = w+"px"; canvas.style.height = h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const mobile = matchMedia("(max-width:700px)").matches;
    const th = mobile ? Math.max(78,Math.min(h*.14,118)) : Math.max(155,Math.min(h*.24,225));
    const segs = [
      [[-35,25],[28,42],[45,100],[119,128]],
      [[119,128],[190,155],[255,183],[331,165]],
      [[331,165],[408,146],[460,151],[552,184]]
    ];
    trails = [0,1].map(side => {
      const pts = [];
      segs.forEach(s => { for(let j=0;j<=28;j++) {
        const p=cubic(s[0],s[1],s[2],s[3],j/28);
        pts.push({x:((side?1440-p.x:p.x)/1440)*w,y:h-th+(p.y/190)*th});
      }});
      let dist=0;
      pts.forEach((p,i)=>{if(i)dist+=Math.hypot(p.x-pts[i-1].x,p.y-pts[i-1].y);p.d=dist;});
      return {pts,len:dist};
    });
  }
  function pointAt(path,t) {
    const d=path.len*t, a=path.pts;
    let lo=0,hi=a.length-1;
    while(lo<hi){const m=(lo+hi)>>1;if(a[m].d<d)lo=m+1;else hi=m;}
    const p=a[lo],q=a[Math.max(0,lo-1)],f=(d-q.d)/(p.d-q.d||1);
    return {x:q.x+(p.x-q.x)*f,y:q.y+(p.y-q.y)*f};
  }
  function ease(t){return 1-Math.pow(1-Math.max(0,Math.min(1,t)),3);}

  function initParticles() {
    const emberColors=["#fff4c9","#ffd37d","#ffab52","#fff0b1"];
    ["left","right"].forEach(side=>{for(let i=0;i<48;i++){
      const left=side==="left";
      embers.push({
        x:(left?Math.random()*19:81+Math.random()*19)*w/100,
        y:h-Math.random()*105,
        dx:(left?1:-1)*(24+Math.random()*105),
        dy:-(12+Math.random()*74),
        dur:1.25+Math.random()*1.4,phase:Math.random()*2.6,
        color:emberColors[Math.floor(Math.random()*4)]
      });
    }});
    for(let i=0;i<92;i++) trailDots.push({
      side:i%2,r:i%9===0?3.4:i%3===0?2.2:1.35,
      dur:2.1+(i%13)*.34,offset:(i%19)*.43
    });
  }

  function grandBurst(x,y,paletteIndex) {
    const palette=palettes[paletteIndex%4], rays=[], sparks=[];
    for(let i=0;i<100;i++) rays.push({
      a:(i*3.6+Math.random()*3)*Math.PI/180,
      len:92+Math.random()*72,width:i%8===0?2.6:1.4,
      dur:1.35+Math.random()*.55,delay:Math.random()*.12,
      color:palette[Math.floor(Math.random()*palette.length)]
    });
    for(let i=0;i<22;i++){
      const a=Math.random()*Math.PI*2,d=75+Math.random()*130;
      sparks.push({dx:Math.cos(a)*d,dy:Math.sin(a)*d,
        color:palette[Math.floor(Math.random()*palette.length)],delay:Math.random()*.25});
    }
    grand.push({x:x*w/100,y:y*h/100,at:performance.now(),rays,sparks});
  }
  function smallBurst(x,y) {
    const ps=[],n=48+Math.floor(Math.random()*21);
    for(let i=0;i<n;i++)ps.push({
      a:Math.PI*2*i/n+Math.random()*.18,d:36+Math.random()*75,
      color:colors[Math.floor(Math.random()*colors.length)],delay:Math.random()*.13,
      glyph:i%13===0?(i%2===0?"✦":"♡"):""
    });
    small.push({x:x*w/100,y:y*h/100,at:performance.now(),
      ring:colors[Math.floor(Math.random()*colors.length)],ps});
  }
  function launch() {
    const x=12+Math.random()*76,y=13+Math.random()*35;
    const r={x:x*w/100,y0:h*.91,y1:y*h/100,dx:(Math.random()-.5)*42,at:performance.now()};
    rockets.push(r);
    setTimeout(()=>{
      const i=rockets.indexOf(r);if(i>=0)rockets.splice(i,1);
      smallBurst(x,y);
      if(Math.random()>.52) setTimeout(()=>smallBurst(x+(Math.random()-.5)*13,y+8),220);
    },720);
  }

  function draw(now) {
    ctx.clearRect(0,0,w,h);
    const sec=(now-started)/1000;
    ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.lineCap="round";
    for(let i=rockets.length-1;i>=0;i--){
      const p=rockets[i],t=Math.min(1,(now-p.at)/720),f=ease(t),x=p.x+p.dx*f,y=p.y0+(p.y1-p.y0)*f;
      ctx.globalAlpha=1-.15*t;ctx.fillStyle="#fff3c7";ctx.shadowColor="#ffca70";ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(x,y,2.1,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.62*(1-t);ctx.strokeStyle="#ffd98b";ctx.lineWidth=2;ctx.shadowBlur=5;
      ctx.beginPath();ctx.moveTo(x,y+3);ctx.lineTo(x,y+42);ctx.stroke();
    }
    for(let b=small.length-1;b>=0;b--){
      const p=small[b],age=(now-p.at)/1000;if(age>1.8){small.splice(b,1);continue;}
      if(age<.85){ctx.globalAlpha=.85*(1-age/.85);ctx.strokeStyle=p.ring;ctx.lineWidth=1;ctx.shadowColor=p.ring;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,54*age/.85,0,Math.PI*2);ctx.stroke();}
      p.ps.forEach(q=>{
        const t=(age-q.delay)/1.35;if(t<=0||t>=1)return;const f=ease(t);
        const x=p.x+Math.cos(q.a)*q.d*f,y=p.y+Math.sin(q.a)*q.d*f;
        ctx.globalAlpha=t<.12?t/.12:t<.75?.9:.9*(1-(t-.75)/.25);
        ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=7;
        ctx.beginPath();ctx.arc(x,y,q.glyph?3:1.7,0,Math.PI*2);ctx.fill();
        if(q.glyph){ctx.shadowBlur=0;ctx.font="12px serif";ctx.fillText(q.glyph,x+2,y-2);}
      });
    }
    for(let b=grand.length-1;b>=0;b--){
      const p=grand[b],age=(now-p.at)/1000;if(age>2.15){grand.splice(b,1);continue;}
      p.rays.forEach(q=>{
        const t=(age-q.delay)/q.dur;if(t<=0||t>=1)return;
        const scale=t<.12?.04+.44*ease(t/.12):.48+.52*ease(Math.min(1,(t-.12)/.60));
        const alpha=t<.12?t/.12:t<.72?1:(1-t)/.28,len=q.len*scale;
        const ex=p.x+Math.sin(q.a)*len,ey=p.y-Math.cos(q.a)*len;
        ctx.globalAlpha=alpha;ctx.strokeStyle=q.color;ctx.lineWidth=q.width;ctx.shadowColor=q.color;ctx.shadowBlur=4;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(ex,ey);ctx.stroke();
        ctx.shadowBlur=0;ctx.strokeStyle="rgba(255,249,220,.75)";ctx.lineWidth=Math.max(.45,q.width*.28);
        ctx.beginPath();ctx.moveTo(p.x+(ex-p.x)*.55,p.y+(ey-p.y)*.55);ctx.lineTo(ex,ey);ctx.stroke();
      });
      p.sparks.forEach(q=>{
        const t=(age-q.delay)/1.5;if(t<=0||t>=1)return;const f=ease(t);
        ctx.globalAlpha=1-t;ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(p.x+q.dx*f,p.y+q.dy*f,2.1*(1-.9*t),0,Math.PI*2);ctx.fill();
      });
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    raf=requestAnimationFrame(draw);
  }

  function scheduleGrand() {
    setTimeout(()=>{
      const spots=[[18,22],[82,22],[5,34],[95,36],[16,64],[84,63],[31,17],[69,17]];
      const p=spots[Math.floor(Math.random()*spots.length)];
      grandBurst(p[0],p[1],Math.floor(Math.random()*4));
      if(Math.random()>.32){const q=spots[Math.floor(Math.random()*spots.length)];
        setTimeout(()=>grandBurst(q[0],q[1],Math.floor(Math.random()*4)),360+Math.random()*420);}
      scheduleGrand();
    },2500+Math.random()*1700);
  }
  function scheduleRegular(){setTimeout(()=>{launch();scheduleRegular();},3400+Math.random()*2600);}

  resize();
  initParticles();
  addEventListener("resize",resize,{passive:true});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}
    else if(!raf)raf=requestAnimationFrame(draw);
  });
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    started=performance.now();
    [[18,22,0,500],[82,22,2,1100],[5,34,1,1900],[95,36,0,2650],
     [16,64,3,3500],[84,63,2,4200],[31,17,1,4850],[69,17,3,5400]]
      .forEach(p=>setTimeout(()=>grandBurst(p[0],p[1],p[2]),p[3]));
    scheduleGrand();setTimeout(launch,900);scheduleRegular();
    raf=requestAnimationFrame(draw);
  }));
})();