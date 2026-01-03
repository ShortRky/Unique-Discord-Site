// Clock and silence timer
(function(){
  const clockEl = document.getElementById('clock');
  const silenceEl = document.getElementById('silence');
  const mochi = document.getElementById('mochi');
  const audio = document.getElementById('audio');
  const speaker = document.getElementById('speaker');
  const nowPlaying = document.getElementById('now-playing');

  let startTime = Date.now();

  function pad(n){return n<10? '0'+n:''+n}
  function updateClock(){
    const d = new Date();
    clockEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function updateSilence(){
    const s = Math.floor((Date.now() - startTime)/1000);
    const m = Math.floor(s/60); const ss = s%60;
    silenceEl.textContent = m + ':' + pad(ss);
  }
  updateClock(); updateSilence();
  setInterval(updateClock, 1000);
  setInterval(updateSilence, 1000);

  // Mochi breathe + toggle theme / speed / music rotation
  let theme = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('theme-light', theme === 'light');
  mochi.classList.add('breathe');

  const states = ['dark','light'];
  mochi.addEventListener('click', ()=>{
    theme = theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('theme', theme);
    // change text speed as playful side-effect
    const crawl = document.getElementById('crawl');
    if(crawl) {
      const size = theme === 'light' ? '18px' : '22px';
      crawl.style.fontSize = size;
    }
  });

  // Scrolling crawl: split letters, random misalign
  const crawl = document.getElementById('crawl');
  const lines = Array.from(crawl.querySelectorAll('.line'));
  lines.forEach(p => {
    const text = p.textContent.trim();
    p.innerHTML = '';
    for(const ch of text){
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch;
      p.appendChild(span);
    }
  });

  // Smooth vertical auto-scroll
  let scrollPos = 0;
  function autoScroll(){
    const rect = crawl.getBoundingClientRect();
    scrollPos += 0.3; // speed
    if(scrollPos > crawl.scrollHeight) scrollPos = 0;
    crawl.style.transform = `translateY(${ - (scrollPos % (rect.height + 200)) }px)`;
    requestAnimationFrame(autoScroll);
  }
  autoScroll();

  // chessboard: simple looped move set (using Unicode pieces) and smooth transitions
  const chessboard = document.getElementById('chessboard');
  const initialFEN = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
  const pieceMap = {K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};

  function buildBoard(){
    chessboard.innerHTML = '';
    for(let r=0;r<8;r++){
      for(let c=0;c<8;c++){
        const cell = document.createElement('div');
        cell.className = 'cell '+ (((r+c)%2===0)?'light':'dark');
        cell.dataset.r = r; cell.dataset.c = c;
        chessboard.appendChild(cell);
      }
    }
  }
  buildBoard();

  // place pieces by FEN-like array
  function placePieces(fen){
    // remove old
    chessboard.querySelectorAll('.piece').forEach(n=>n.remove());
    for(let r=0;r<8;r++){
      for(let c=0;c<8;c++){
        const v = fen[r][c];
        if(v){
          const cellIndex = r*8 + c;
          const cell = chessboard.children[cellIndex];
          const p = document.createElement('div');
          p.className = 'piece';
          p.textContent = pieceMap[v] || '?';
          // absolute position inside cell
          cell.appendChild(p);
        }
      }
    }
  }

  // small pre-baked move sequence (loop) — replaced with Scholar's Mate sequence for legal checkmate
  const moves = [
    {from:[6,4],to:[4,4]}, // e4
    {from:[1,4],to:[3,4]}, // e5
    {from:[7,3],to:[3,7]}, // Qh5
    {from:[0,1],to:[2,2]}, // Nc6
    {from:[7,5],to:[4,2]}, // Bc4
    {from:[0,6],to:[2,5]}, // Nf6
    {from:[3,7],to:[1,5]}  // Qxf7#
  ];

  // start from initial and apply moves in loop
  let board = JSON.parse(JSON.stringify(initialFEN));
  placePieces(board);
  let moveIndex = 0;

  function applyNextMove(){
    const mv = moves[moveIndex];
    if(!mv){ moveIndex = 0; return; }
    const fr = mv.from, to = mv.to;
    const piece = board[fr[0]][fr[1]];
    board[fr[0]][fr[1]] = '';
    board[to[0]][to[1]] = piece;
    placePieces(board);

    // if this was the final move (checkmate), reset board after a short pause
    if(moveIndex === moves.length - 1){
      // show final position briefly then reset
      setTimeout(()=>{
        board = JSON.parse(JSON.stringify(initialFEN));
        placePieces(board);
        moveIndex = 0;
      }, 2000);
    } else {
      moveIndex = (moveIndex+1) % moves.length;
    }
  }
  // slower interval so moves are visible
  setInterval(applyNextMove, 1400);

  // Socials
  const socials = [
    {name:'Twitch',url:'https://www.twitch.tv/hyuunle3i',icon:'📺'},
    {name:'Youtube (Vlogs)',url:'https://www.youtube.com/@HyunLee09',icon:'▶️'},
    {name:'YouTube (Video Editing)',url:'https://www.youtube.com/@KaisenFinalCuts',icon:'▶️'},
    {name:'YouTube (Music)',url:'https://www.youtube.com/@R3verence09',icon:'▶️'},
    {name:'AniList',url:'https://anilist.co/user/Hyuunle3i/',icon:'📚'}
  ];
  const socialsList = document.getElementById('socials');
  socials.forEach(s => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `${s.icon}<span>${s.name}</span>`;
    // ensure external open and avoid bubbling back
    a.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); try{ window.open(s.url, '_blank', 'noopener'); }catch(err){ location.href = s.url; } });
    li.appendChild(a); socialsList.appendChild(li);
  });
  const trigger = document.querySelector('.social-trigger');
  trigger.addEventListener('click', ()=> socialsList.classList.toggle('open'));

  // Audio & speaker control (cleaned: no file input, unmute on user click)
  speaker.addEventListener('click', ()=>{
    try{
      if(audio.src){
        if(audio.paused){ audio.play().then(()=>{ speaker.classList.remove('muted'); speaker.textContent = '🔊'; }).catch(()=>{}); }
        else { audio.pause(); speaker.classList.add('muted'); speaker.textContent = '🔈'; }
      } else {
        // no-op: playlist starter will set src when available
      }
    }catch(e){ console.debug('speaker click error', e); }
  });

  // If we have an audio element without source, show hint
  if(!audio.src) nowPlaying.innerHTML = 'Now Playing — <span class="now-hint">(click to load)</span>';

})();

// Remove settings UI; apply everything from config.js and make responsive
(function(){
  const cfg = window.PROFILE_CONFIG || {};
  const avatar = document.getElementById('avatar');
  const description = document.getElementById('description');
  const presence = cfg.presence || 'available';
  const statusDot = document.getElementById('statusDot');
  const sakuraCanvas = document.getElementById('sakura');

  // apply visual config (set avatar immediately to provided local file)
  // ensure a quick immediate assignment so a supplied profile.jpeg shows up
  avatar.src = './' + (cfg.avatarDefault || avatar.src || 'profile.jpeg');
  description.textContent = cfg.description || description.textContent;
  statusDot.className = 'status dot-' + (cfg.presence || 'available');
  avatar.style.opacity = (cfg.profileOpacity !== undefined) ? cfg.profileOpacity : 1;
  avatar.style.filter = `blur(${(cfg.profileBlur||0)}px)`;
  if(cfg.sakura === false) sakuraCanvas.style.display = 'none';
  document.documentElement.style.setProperty('--accent', cfg.accent || '#6aa84f');
  document.querySelectorAll('.socials a').forEach(a=>{ a.style.filter = cfg.monoIcons ? 'grayscale(1) brightness(.9)' : ''; });
  document.title = cfg.animatedTitle ? '• Unique • Discord • Profile •' : 'Unique Discord Profile';

  // custom cursor
  if(cfg.customCursor){
    document.body.classList.add('custom-cursor');
    const dot = document.createElement('div'); dot.className='custom-cursor-dot'; document.body.appendChild(dot);
    window.addEventListener('mousemove', e=>{ dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; });
  }

  // username glow
  document.getElementById('description').style.textShadow = cfg.usernameGlow ? '0 0 10px rgba(106,168,79,0.12)' : '';

  // remove settings elements if any (cleaner)
  const settingsEl = document.getElementById('settings'); if(settingsEl) settingsEl.remove();
  const settingsBtn = document.getElementById('settingsBtn'); if(settingsBtn) settingsBtn.remove();

  // responsive chessboard sizing
  const chessboard = document.getElementById('chessboard');
  function sizeChess(){
    const w = Math.min(160, Math.max(120, window.innerWidth * 0.14));
    chessboard.style.width = w + 'px'; chessboard.style.height = w + 'px';
  }
  window.addEventListener('resize', sizeChess); sizeChess();

})();

// Part 5: apply additional config behaviors
(function(){
  const cfg = window.PROFILE_CONFIG || {};
  const loading = document.getElementById('loading');
  const crawl = document.getElementById('crawl');

  // Ensure loading overlay hides even if load event fails
  window.addEventListener('load', ()=>{ setTimeout(()=>{ if(loading) loading.style.display='none'; },400); });
  setTimeout(()=>{ if(loading) loading.style.display='none'; },5000); // fail-safe

  // misalign frequency
  const misalignFreq = parseInt(cfg.misalignFrequency || 1800, 10);
  // clear previous intervals if any
  if(window._misalignInterval) clearInterval(window._misalignInterval);
  window._misalignInterval = setInterval(()=>{
    const letters = crawl.querySelectorAll('.letter');
    if(!letters.length) return;
    const i = Math.floor(Math.random()*letters.length);
    const el = letters[i]; if(!el) return;
    el.classList.add('misaligned');
    setTimeout(()=> el.classList.remove('misaligned'), 800 + Math.random()*1200);
  }, misalignFreq);

  // scroll speed
  const baseSpeed = parseFloat(cfg.scrollSpeed || 0.28);
  // override existing autoScroll speed by storing a global var
  window._autoScrollSpeed = baseSpeed;
  // modify autoScroll function to use _autoScrollSpeed (exists earlier)
  // We'll replace the autoScroll loop with one using the new global speed
  if(window._autoScrollRAF) cancelAnimationFrame(window._autoScrollRAF);
  let scrollPos = 0;
  function autoScroll(){
    const rect = crawl.getBoundingClientRect();
    scrollPos += (window._autoScrollSpeed || baseSpeed);
    if(scrollPos > crawl.scrollHeight) scrollPos = 0;
    crawl.style.transform = `translateY(${ - (scrollPos % (rect.height + 200)) }px)`;
    window._autoScrollRAF = requestAnimationFrame(autoScroll);
  }
  autoScroll();

  // move below-fold sections into sidebar if enabled
  if(cfg.sidebarEnabled){
    const sections = document.querySelectorAll('.below-fold');
    sidebarNav.innerHTML = '';
    sections.forEach(sec=>{
      const a = document.createElement('a'); a.href = '#'+sec.id; a.textContent = sec.querySelector('h2')?.textContent || sec.id;
      sidebarNav.appendChild(a);
    });
    // collapse state
    if(cfg.sidebarCollapsed) sidebar.classList.add('collapsed');
  } else {
    sidebar.remove();
  }

  // sidebar toggle
  sidebarToggle && sidebarToggle.addEventListener('click', ()=>{
    sidebar.classList.toggle('collapsed');
  });

  // apply minimal, hide volume/views/chess
  if(cfg.minimalMode) document.body.classList.add('minimal-mode'); else document.body.classList.remove('minimal-mode');
  if(!cfg.showVolume) document.body.classList.add('hide-volume'); else document.body.classList.remove('hide-volume');
  if(!cfg.showViews) document.body.classList.add('hide-views'); else document.body.classList.remove('hide-views');
  if(!cfg.showChess) document.body.classList.add('hide-chess'); else document.body.classList.remove('hide-chess');
  if(!cfg.sidebarEnabled) document.body.classList.add('hide-sidebar'); else document.body.classList.remove('hide-sidebar');

})();

// Final adjustments for Part 6: center boxes + video, clean sidebar removal
(function(){
  const cfg = window.PROFILE_CONFIG || {};
  const loading = document.getElementById('loading');
  const crawl = document.getElementById('crawl');
  const videoBox = document.getElementById('videoBox');
  const boxes = document.querySelectorAll('.box');

  // hide loading reliably
  function hideLoading(){ if(loading) loading.style.display = 'none'; }
  window.addEventListener('load', ()=> setTimeout(hideLoading, 300));
  setTimeout(hideLoading, 4000);

  // ensure single misalign interval
  if(window._misalignInterval) clearInterval(window._misalignInterval);
  const misalignFreq = parseInt(cfg.misalignFrequency || 1800, 10);
  window._misalignInterval = setInterval(()=>{
    const letters = crawl.querySelectorAll('.letter'); if(!letters.length) return;
    const i = Math.floor(Math.random()*letters.length); const el = letters[i]; if(!el) return;
    el.classList.add('misaligned'); setTimeout(()=> el.classList.remove('misaligned'), 800 + Math.random()*1200);
  }, misalignFreq);

  // ensure single autoScroll loop
  if(window._autoScrollRAF) cancelAnimationFrame(window._autoScrollRAF);
  let scrollPos = 0; const baseSpeed = parseFloat(cfg.scrollSpeed || 0.28);
  function autoScroll(){
    const rect = crawl.getBoundingClientRect();
    scrollPos += (window._autoScrollSpeed || baseSpeed);
    if(scrollPos > crawl.scrollHeight) scrollPos = 0;
    crawl.style.transform = `translateY(${ - (scrollPos % (rect.height + 200)) }px)`;
    window._autoScrollRAF = requestAnimationFrame(autoScroll);
  }
  autoScroll();

  // IntersectionObserver for boxes and video
  const fadeItems = Array.from(boxes).concat(videoBox);
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  },{threshold:0.15});
  fadeItems.forEach(el=> el && io.observe(el));

  // remove any leftover sidebar elements
  const sidebar = document.getElementById('sidebar'); if(sidebar) sidebar.remove();

})();

// Playlist from config.js — shuffle-safe
(function(){
  const cfg = window.PROFILE_CONFIG || {};
  const audio = document.getElementById('audio');
  const speaker = document.getElementById('speaker');
  // nowPlaying removed intentionally

  // helper: try several candidate paths (HEAD) and pick the first that responds OK
  function resolveCandidateSrc(src){
    const candidates = [src, 'tracks/' + src, './' + src, './tracks/' + src];
    let i = 0;
    return new Promise((resolve)=>{
      function tryNext(){
        if(i >= candidates.length) { resolve(encodeURI(src)); return; }
        const url = candidates[i++];
        fetch(url, {method:'HEAD'}).then(resp=>{
          if(resp.ok) resolve(url);
          else tryNext();
        }).catch(()=> tryNext());
      }
      tryNext();
    });
  }

  // prepare playlist (array of {src,title})
  let playlist = Array.isArray(cfg.musicList) ? cfg.musicList.slice() : [];
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
  if(cfg.shuffleOnLoad) shuffle(playlist);

  let trackIndex = 0;

  async function playTrack(i){
    if(!playlist[i]) return;
    const item = playlist[i];
    try{
      const chosen = await resolveCandidateSrc(item.src);
      audio.src = encodeURI(chosen);
      audio.load();
      await audio.play();
      speaker.classList.remove('muted'); speaker.textContent = '🔊';
      // do not display title
    }catch(err){
      console.debug('Play failed for', item, err);
    }
  }

  audio.addEventListener('ended', ()=>{
    trackIndex = (trackIndex + 1) % playlist.length; playTrack(trackIndex);
  });

  // start playing if playlist exists
  if(playlist.length) playTrack(trackIndex);

  // speaker toggles playback (keeps mute state controlled elsewhere)
  speaker.addEventListener('click', ()=>{
    if(!audio.src && playlist.length) { playTrack(trackIndex); return; }
    if(audio.paused){ audio.play().then(()=>{ speaker.classList.remove('muted'); speaker.textContent='🔊'; }).catch(()=>{}); }
    else{ audio.pause(); speaker.classList.add('muted'); speaker.textContent='🔈'; }
  });

})();

// Apply initial content from config and fix audio/profile issues
(function(){
  const cfg = window.PROFILE_CONFIG || {};

  // Populate crawl lines from config
  const crawl = document.getElementById('crawl');
  if(crawl){
    crawl.innerHTML = '';
    (cfg.crawlLines || []).forEach(line => {
      const p = document.createElement('p'); p.className = 'line'; p.textContent = line; crawl.appendChild(p);
    });
  }

  // split letters for misalign effect (existing logic expects .letter spans)
  const lines = Array.from(crawl.querySelectorAll('.line'));
  lines.forEach(p => {
    const text = p.textContent.trim();
    p.innerHTML = '';
    for(const ch of text){
      const span = document.createElement('span'); span.className = 'letter'; span.textContent = ch; p.appendChild(span);
    }
  });

  // Populate socials from config
  const socialsList = document.getElementById('socials');
  if(socialsList){
    socialsList.innerHTML = '';
    (cfg.socials || []).forEach(s => {
      const li = document.createElement('li');
      const a = document.createElement('a'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = `${s.icon}<span>${s.name}</span>`;
      // ensure external open and avoid bubbling back
      a.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); try{ window.open(s.url, '_blank', 'noopener'); }catch(err){ location.href = s.url; } });
      li.appendChild(a); socialsList.appendChild(li);
    });
    const trigger = document.querySelector('.social-trigger');
    trigger && trigger.addEventListener('click', ()=> socialsList.classList.toggle('open'));
  }

  // apply avatar and fallback — robust loader: try multiple common filenames/extensions
  const avatar = document.getElementById('avatar');
  if(avatar){
    (async ()=>{
      const cfg = window.PROFILE_CONFIG || {};
      const requested = (cfg.avatarDefault || '').trim();
      const baseNames = [];
      if(requested) baseNames.push(requested);
      // common fallback names
      baseNames.push('profile'); baseNames.push('avatar');
      // common extensions to try
      const exts = ['.jpeg','.jpg','.png',''];

      const candidates = [];
      for(const b of baseNames){
        for(const e of exts){
          const name = b + e;
          candidates.push('./' + name);
          candidates.push(name);
          candidates.push('./images/' + name);
          candidates.push('images/' + name);
        }
      }

      // helper to try loading via Image (works with file:// and HTTP)
      function tryLoadImage(url){
        return new Promise((resolve)=>{
          if(!url){ resolve(false); return; }
          const img = new Image();
          img.onload = ()=> resolve(url);
          img.onerror = ()=> resolve(false);
          img.src = url;
        });
      }

      let chosen = null;
      for(const c of candidates){
        try{
          const ok = await tryLoadImage(c);
          if(ok){ chosen = c; break; }
        }catch(e){ /* ignore */ }
      }

      if(!chosen){
        // last resort: try requested raw value
        if(requested){ const ok = await tryLoadImage(requested); if(ok) chosen = requested; }
      }
      if(!chosen) chosen = 'https://via.placeholder.com/80';
      avatar.src = chosen;
      avatar.addEventListener('error', ()=>{ avatar.src = 'https://via.placeholder.com/80'; });
    })();
  }

  // ensure audio respects startMuted from config
  const audio = document.getElementById('audio');
  if(audio){ audio.muted = !!cfg.startMuted; }

  // remove any references to a now-removed file input (clean up if present)
  const audioFileEl = document.getElementById('audioFile'); if(audioFileEl) audioFileEl.remove();
  const nowPlaying = document.getElementById('now-playing'); if(nowPlaying) nowPlaying.title = '';

})();

// Robust feature video loader: try multiple candidate paths (handles spaces/encoding and file vs server)
(async function(){
  const video = document.getElementById('featureVideo');
  if(!video) return;
  const base = 'tracks/Sao Paulo Edit - KaisenCuts.mp4';
  const candidates = [
    base,
    './' + base,
    encodeURI(base),
    encodeURI('./' + base),
    'tracks/' + encodeURIComponent('Sao Paulo Edit - KaisenCuts.mp4')
  ];

  let loaded = false;
  for(const url of candidates){
    try{
      video.src = url;
      // try to load metadata to confirm file is reachable
      loaded = await new Promise(resolve => {
        const onLoad = () => { cleanup(); resolve(true); };
        const onErr = () => { cleanup(); resolve(false); };
        function cleanup(){ video.removeEventListener('loadedmetadata', onLoad); video.removeEventListener('error', onErr); }
        video.addEventListener('loadedmetadata', onLoad);
        video.addEventListener('error', onErr);
        // set a short timeout in case neither fires
        setTimeout(()=>{ cleanup(); resolve(false); }, 1600);
      });
      if(loaded) break;
    }catch(e){ /* try next */ }
  }

  if(!loaded){
    console.debug('Feature video failed to load. Tried:', candidates);
    const vb = document.getElementById('videoBox');
    if(vb){
      const hint = document.createElement('div');
      hint.className = 'video-hint';
      hint.textContent = 'Video not found — put file in /tracks and refresh.';
      vb.appendChild(hint);
    }
  } else {
    // ensure controls show and allow user to start playback
    video.controls = true;
    video.preload = 'metadata';
    // enforce muted autoplay loop to satisfy browser policies
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    // try to play after a short delay
    setTimeout(()=>{ video.play().catch(()=>{/* autoplay blocked until interaction */}); }, 120);
    // allow speaker button or video click to toggle mute
    const speaker = document.getElementById('speaker');
    function toggleAudio(){
      if(video.muted){ video.muted = false; speaker.classList.remove('muted'); speaker.textContent = '🔊'; }
      else { video.muted = true; speaker.classList.add('muted'); speaker.textContent = '🔈'; }
    }
    speaker && speaker.addEventListener('click', ()=> toggleAudio());
    video && video.addEventListener('click', ()=> toggleAudio());
  }
})();