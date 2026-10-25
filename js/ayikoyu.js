window.G = window.G || {};
// Ayı Köyü: ekiple yürüyen Gökçe, dost ayı ve saklanmayı gözeten uçuş.
G.ayikoyu = (function () {
  'use strict';
  var T = 48, s = null;
  function bilgi() { return G.bolumBilgi(); }
  function nokta(p) { return { x: (p[0]+0.5)*T, y: (p[1]+0.5)*T }; }
  function uzak(a,b) { return Math.hypot(a.x-b.x,a.y-b.y); }
  function aci(a) { return Math.atan2(Math.sin(a),Math.cos(a)); }
  function say(e,m) { e.konusma={metin:m,sure:2.8}; }
  function konus(dt,e) { if(e.konusma) {e.konusma.sure-=dt;if(e.konusma.sure<=0)e.konusma=null;} }
  function yeniYol() { return { yol: null, t: 0 }; }
  function gorusAcik(a,b) { return !G.harita.gorusEngeli(a.x,a.y,b.x,b.y); }
  function balNoktalari(d,b) {
    var h=G.harita, kaynak=[[8,13],[15,12],[22,16],[31,22],[12,35],[33,35]], cik=[];
    kaynak.forEach(function(p){
      var n=nokta(p),tx=p[0],ty=p[1];
      if(h.kati(tx,ty)||h.kapiAt(tx,ty)||!h.yolBul(d.gokce.x,d.gokce.y,n.x,n.y,true))return;
      if(cik.some(function(q){return uzak(q,n)<T*4;}))return;
      cik.push({x:n.x,y:n.y,yendi:false});
    });
    if(cik.length<3) h.devriye.forEach(function(p){
      if(cik.length>=3)return;var tx=Math.floor(p.x/T),ty=Math.floor(p.y/T),n={x:(tx+.5)*T,y:(ty+.5)*T};
      if(h.kati(tx,ty)||h.kapiAt(tx,ty)||!h.yolBul(d.gokce.x,d.gokce.y,n.x,n.y,true))return;
      if(!cik.some(function(q){return uzak(q,n)<T*4;}))cik.push({x:n.x,y:n.y,yendi:false});
    });
    return cik;
  }
  function koylulerKur() {
    var h=G.harita, noktalar=h.devriye||[], out=[];
    if(!noktalar.length)return out;
    for(var i=0;i<7;i++){
      var p=noktalar[(i*2+1)%noktalar.length], tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
      if(h.kati(tx,ty)||h.kapiAt(tx,ty))continue;
      var rota=[];
      for(var j=0;j<3;j++){
        var q=noktalar[(i*2+1+j*3)%noktalar.length],qx=Math.floor(q.x/T),qy=Math.floor(q.y/T);
        if(h.kati(qx,qy)||h.kapiAt(qx,qy))continue;
        var n={x:(qx+.5)*T,y:(qy+.5)*T};
        if(!rota.some(function(r){return uzak(r,n)<T*2;})&&h.yolBul((tx+.5)*T,(ty+.5)*T,n.x,n.y,true))rota.push(n);
      }
      if(!rota.length)continue;
      var bas=rota[0];out.push({kim:i<4?(i%2?'koyayisi_acik':'koyayisi'):'kaplumbaga',x:bas.x,y:bas.y,r:i<4?18:12,yon:0,hareket:false,adimFaz:0,olcek:i<4?1:.82,rota:rota,rotaNo:0,t:0});
    }
    return out;
  }
  function koylulerGuncelle(d,dt) {
    (d.koyluler||[]).forEach(function(e){
      if(!e.rota||!e.rota.length)return;
      if(!e.yolDurum)e.yolDurum={yol:null,t:0};
      if(!e.hedef)e.hedef=e.rota[(e.rotaNo+1)%e.rota.length];
      e.bekle=Math.max(0,(e.bekle||0)-dt);
      if(e.bekle>0){e.hareket=false;return;}
      if(yuruyus(e,e.yolDurum,e.hedef,dt,e.kim==='kaplumbaga'?32:48,9)){
        e.rotaNo=(e.rotaNo+1)%e.rota.length;e.hedef=e.rota[(e.rotaNo+1)%e.rota.length];e.yolDurum={yol:null,t:0};e.bekle=.8+Math.random();
      }
    });
  }
  function yuruyus(e,st,hedef,dt,hiz,mesafe) {
    var h=G.harita;e.hareket=false;st.t-=dt;
    if(uzak(e,hedef)<(mesafe||10)) {st.yol=null;return true;}
    if(st.t<=0) {st.yol=h.yolBul(e.x,e.y,hedef.x,hedef.y,true);st.t=.55;}
    var yol=st.yol;if(!yol||!yol.length)return false;
    while(yol.length>1&&uzak(e,yol[0])<7)yol.shift();
    var p=yol[0],dx=p.x-e.x,dy=p.y-e.y,L=Math.hypot(dx,dy);
    if(L<2){yol.shift();return false;}
    var ad=Math.min(L,hiz*dt),nx=dx/L,ny=dy/L;
    // Normal kapı açılır; kilidi açılmamış görev kapısından yardımcı geçmez.
    var kp=h.kapiAt(Math.floor((e.x+nx*(e.r+8))/T),Math.floor((e.y+ny*(e.r+8))/T));
    if(kp&&!kp.acik){if(kp.kilit){st.yol=null;return false;}kp.acik=true;G.olay('kapi_ac',{kapi:kp});}
    var ox=e.x,oy=e.y;h.hareketEt(e,nx*ad,ny*ad,false);
    e.hareket=Math.hypot(e.x-ox,e.y-oy)>.05;
    if(e.hareket){e.yon=Math.atan2(dy,dx);e.adimFaz+=dt*9;}
    return false;
  }
  function init(d) {
    d.superbear=null;d.beatrice=null;d.arilar=[];d.morBallar=[];d.koyluler=[];s=null;
    if(!bilgi().ayikoyu)return;
    var b=bilgi(), p=nokta(b.yardimci);
    d.superbear={kim:'superbear',x:p.x,y:p.y,yon:0,r:17,hareket:false,adimFaz:0,durum:'bekliyor'};
    b.ekip.forEach(function(p,i){var e=i<2?d.kardesler[i]:d.gokce;if(!e)return;var n=nokta(p);e.x=n.x;e.y=n.y;e.r=12;e.durum='takip';e.hareket=false;});
    d.morBallar=balNoktalari(d,b);d.koyluler=koylulerKur();
    var q=nokta(b.kraliceUcus[0]);
    d.beatrice={kim:'beatrice',x:q.x,y:q.y,yon:0,yukseklik:b.ucusYuksekligi,gizli:true,gorusMesafe:330,gorusAci:1.2,durum:'ucuyor',uyari:0};
    var al=b.kovanAlani;
    for(var i=0;i<5;i++)d.arilar.push({x:(al.tx+2+i*2.3)*T,y:(al.ty+2+i%2*3)*T,yukseklik:1.4+i%2*.5,yon:0,olcek:.72});
    s={ev:p,abla:yeniYol(),ayi:yeniYol(),hedef:null,asama:'bekliyor',kalan:0,korumaT:0,kraliceT:20+Math.random()*20,ucus:0,ucusT:0,gorduT:0,ihbarT:0,balHedef:null,balYemeT:0};
  }
  function uzakHedef(e,o) {
    var dp=G.harita.devriye.slice().sort(function(a,b){return uzak(b,o)-uzak(a,o);});
    for(var i=0;i<dp.length;i++){
      var p=dp[i],y=G.harita.yolBul(e.x,e.y,p.x,p.y,true);
      if(y&&y.length&&uzak(e,p)>T*3&&!y.some(function(n){var k=G.harita.kapiAt(Math.floor(n.x/T),Math.floor(n.y/T));return k&&k.kilit;}))return p;
    }
    return s.ev;
  }
  function cagir(d) {
    if(!s||!d||d.mod!=='oyun'||s.asama!=='bekliyor')return false;
    if(!(d.gokceHakki>0)){G.mesaj('Super Bear yardım haklarını kullandı. Yanına gidince yine korur!',3);return false;}
    // Uyuyan Mor Ayı'yı yardım için uyandırma; hakkı sakla.
    if(d.komsu.pasif&&!d.uyanan){G.mesaj('Mor Ayı dinleniyor. Yardım hakkını saklayalım!',2.5);return false;}
    d.gokceHakki--;s.asama='geliyor';s.kalan=35;s.ayi=yeniYol();d.superbear.bitti=false;
    say(d.gokce,'Super Bear, yardım eder misin?');say(d.superbear,'Geliyorum, dostlarım!');
    G.olay('gokce_cagrildi',{x:d.superbear.x,y:d.superbear.y,tur:'superbear'});
    G.mesaj('Super Bear geliyor! Mor Ayı’yı şenliğe götürecek.',3);
    return true;
  }
  function koru(d,dt) {
    var a=d.superbear,o=d.oyuncu,k=d.komsu;
    o.korunan=uzak(a,o)<120&&!G.harita.gorusEngeli(a.x,a.y,o.x,o.y);
    a.korur=o.korunan;s.korumaT-=dt;
    if(o.korunan&&s.korumaT<=0&&s.asama==='bekliyor'){
      s.korumaT=10;say(a,'Yanımdasın, güvendesin!');
      if(k&&!k.pasif&&uzak(k,a)<500)G.komsu.dikkatDagit(a.x,a.y,8,'superbear');
    }
  }
  function ayiGuncelle(d,dt) {
    var a=d.superbear,o=d.oyuncu;a.hareket=false;konus(dt,a);
    if(s.asama==='geliyor'){
      s.kalan-=dt;
      var yakin=uzak(a,o)<=90&&gorusAcik(a,o);
      if(yakin){
        s.asama='oyalama';s.kalan=14;s.hedef=uzakHedef(a,o);s.ayi=yeniYol();
        if(d.uyanan)G.uyanan.oyala(a,14);
        else if(!d.komsu.pasif)G.komsu.pesindenGit(a,14);
        else { d.gokceHakki++;s.asama='donuyor';a.bitti=true;G.mesaj('Mor Ayı uyudu. Yardım hakkın sende kaldı!',2.5);return; }
        say(a,'Mor Ayı! Bal şenliği bu tarafta!');G.olay('superbear_oyaladi',{});
      }else if(s.kalan<=0){
        d.gokceHakki++;s.asama='donuyor';s.ayi=yeniYol();a.bitti=true;
        say(a,'Yol kapalı, tekrar deneyelim!');G.mesaj('Super Bear ulaşamadı. Yardım hakkın sende kaldı!',2.5);
      }else{
        yuruyus(a,s.ayi,o,dt,225,90);
      }
    }else if(s.asama==='oyalama'){
      s.kalan-=dt;yuruyus(a,s.ayi,s.hedef,dt,190,18);
      if(s.kalan<=0){a.bitti=true;s.asama='donuyor';s.ayi=yeniYol();}
    }else if(s.asama==='donuyor'){
      if(yuruyus(a,s.ayi,s.ev,dt,180,12)){s.asama='bekliyor';a.bitti=false;}
    }
    a.durum=s.asama;koru(d,dt);
  }
  function gorur(q,o) {
    if(q.gizli||!o||o.saklandi||o.korunan||o.gorunmez>0)return false;
    var dx=o.x-q.x,dy=o.y-q.y;
    return Math.hypot(dx,dy)<q.gorusMesafe&&Math.abs(aci(Math.atan2(dy,dx)-q.yon))<q.gorusAci/2&&!G.harita.gorusEngeli(q.x,q.y,o.x,o.y);
  }
  function kraliceGuncelle(d,dt) {
    var q=d.beatrice,b=bilgi();konus(dt,q);s.ihbarT-=dt;
    if(q.gizli){s.kraliceT-=dt;if(s.kraliceT>0)return;q.gizli=false;s.ucus=Math.floor(Math.random()*b.kraliceUcus.length);var bas=nokta(b.kraliceUcus[s.ucus]);q.x=bas.x;q.y=bas.y;s.ucusT=30+Math.random()*16;s.gorduT=0;G.mesaj('Beatrice uçuyor! Görüş ışığından saklanabilirsin.',3);G.olay('beatrice_geldi',{});}
    s.ucusT-=dt;if(s.ucusT<=0){q.gizli=true;q.uyari=0;s.kraliceT=25+Math.random()*25;return;}
    var p=nokta(b.kraliceUcus[(s.ucus+1)%b.kraliceUcus.length]),dx=p.x-q.x,dy=p.y-q.y,L=Math.hypot(dx,dy),ad=Math.min(L,125*dt);
    if(L>0){q.x+=dx/L*ad;q.y+=dy/L*ad;q.yon=Math.atan2(dy,dx);}if(L<10)s.ucus=(s.ucus+1)%b.kraliceUcus.length;
    if(G.minikMi()){G.minikSelam(q,d.oyuncu);q.uyari=0;s.gorduT=0;return;}
    s.gorduT=gorur(q,d.oyuncu)?s.gorduT+dt:0;q.uyari=Math.min(1,s.gorduT/.9);q.durum=q.uyari>0?'ispiyon':'ucuyor';
    if(s.gorduT>=.9&&s.ihbarT<=0){
      var o=d.oyuncu,ok=d.uyanan?G.uyanan.ihbar(o.x,o.y):G.komsu.ispiyon(o.x,o.y);
      if(ok){say(q,'Mor Ayı, küçük dostumuz burada!');G.olay('beatrice_ihbar',{x:o.x,y:o.y});G.mesaj('Beatrice seni gördü! Bir saklanma yeri bul.',2.5);}
      s.ihbarT=8;s.gorduT=0;
    }
  }
  function guncelle(dt,d) {
    if(!s||!bilgi().ayikoyu||!d.superbear)return;
    var g=d.gokce,o=d.oyuncu;
    if(g){
      konus(dt,g);g.gizli=!!o.saklandi;g.hareket=false;
      if(!g.morBal&&d.zaman>=60&&!s.balHedef){
        var sec=(d.morBallar||[]).filter(function(p){return !p.yendi;}).sort(function(a,b){return uzak(g,a)-uzak(g,b);});
        if(sec.length){s.balHedef=sec[0];g.morBalAsama='bal_gidis';s.abla=yeniYol();}
      }
      if(g.morBalAsama==='bal_yiyor'){
        g.balYiyor=true;g.oyunPoz='bal';g.hareket=false;s.balYemeT-=dt;
        if(s.balYemeT<=0){s.balHedef.yendi=true;g.morBal=true;g.balYiyor=false;g.oyunPoz=null;g.morBalAsama='ayi_takip';say(g,'Bal çok tatlı! Mor Ayı’ya yetişelim!');}
      }else if(!g.gizli&&g.morBalAsama==='bal_gidis'&&s.balHedef){
        if(yuruyus(g,s.abla,s.balHedef,dt,115,14)){g.morBalAsama='bal_yiyor';s.balYemeT=2.5;g.balYiyor=true;g.oyunPoz='bal';s.abla=yeniYol();}
      }else if(!g.gizli&&g.morBal){
        var ayi=d.komsu||o;g.durum='takip';yuruyus(g,s.abla,ayi,dt,112,44);
      }else if(!g.gizli){g.morBalAsama='bekliyor';g.durum='takip';yuruyus(g,s.abla,o,dt,235,85);}
      else s.abla.yol=null;
    }
    ayiGuncelle(d,dt);kraliceGuncelle(d,dt);koylulerGuncelle(d,dt);
    var al=bilgi().kovanAlani;
    d.arilar.forEach(function(e,i){var t=d.zaman*.65+i*1.25;e.x=(al.tx+al.w/2+Math.cos(t)*(2+i*.55))*T;e.y=(al.ty+al.h/2+Math.sin(t)*(1.5+i*.5))*T;e.yon=t+Math.PI/2;});
  }
  return {init:init,guncelle:guncelle,cagir:cagir,aktif:function(){return !!s&&s.asama!=='bekliyor';}};
})();
