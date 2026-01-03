// Sakura particle animation

const canvas = document.getElementById('sakura');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
let particles = [];
let width = 0, height = 0;

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function rand(min, max){ return Math.random() * (max - min) + min }

function createParticle(){
  const size = rand(6, 14);
  return {
    x: rand(0, width),
    y: -size - rand(0, height * 0.2),
    vx: rand(-0.3, 0.6),
    vy: rand(0.3, 1.2),
    size,
    rot: rand(0, Math.PI * 2),
    vrot: rand(-0.02, 0.02),
    alpha: rand(0.6, 1),
    hue: null
  }
}

function initParticles(){
  particles = [];
  for(let i=0;i<60;i++) particles.push(createParticle());
}

function drawPetal(p, color){
  ctx.save();
  ctx.globalAlpha = p.alpha * 0.95;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function loop(){
  if(!ctx) return;
  ctx.clearRect(0,0,width,height);
  const color = getComputedStyle(document.body).getPropertyValue('--petal') || '#f3c6cf';
  for(let i=0;i<particles.length;i++){
    const p = particles[i];
    p.x += p.vx + Math.sin((p.y + i) * 0.01) * 0.4;
    p.y += p.vy;
    p.rot += p.vrot;
    if(p.y - p.size > height || p.x < -50 || p.x > width + 50){
      particles[i] = createParticle();
    }
    drawPetal(p, color);
  }
  requestAnimationFrame(loop);
}

window.addEventListener('resize', ()=>{ resize(); initParticles(); });
resize(); initParticles(); requestAnimationFrame(loop);