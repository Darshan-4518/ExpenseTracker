window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 80) nav.classList.add('bg-opacity-90', 'backdrop-blur-sm', 'shadow-lg');
  else nav.classList.remove('bg-opacity-90', 'backdrop-blur-sm', 'shadow-lg');
});

// Parallax hero
const heroImg = document.querySelector('.parallax');
window.addEventListener('scroll', () => {
  const offset = window.pageYOffset;
  heroImg.style.transform = `translateY(${offset * 0.4}px)`;
});

// Reveal on scroll
const faders = document.querySelectorAll('.fade-in');
const appearOnScroll = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('appear');
  });
}, { threshold: 0.2 });
faders.forEach(el => appearOnScroll.observe(el));

// Counter animation
const counters = document.querySelectorAll('.counter');
counters.forEach(c => {
  const update = () => {
    const target = +c.dataset.target;
    const count = +c.innerText;
    const inc = target / 200;
    if (count < target) { c.innerText = Math.ceil(count + inc); setTimeout(update, 20); }
    else c.innerText = target.toLocaleString();
  };
  new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && update()), { once: true }).observe(c);
});

// Dark mode
const darkBtn = document.getElementById('darkToggle');
darkBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// FAQ accordion
const faqs = [
  {q:'Is my data safe?',a:'Yes. AES-256 encryption + zero knowledge.'},
  {q:'Can I export my data?',a:'One-click CSV / JSON export anytime.'},
  {q:'Is there a mobile app?',a:'Progressive Web App available now, native coming Q4 2025.'}
];
const faqContainer = document.getElementById('faq');
faqs.forEach(item=>{
  const div=document.createElement('div');
  div.className='border border-[--divider] rounded-lg overflow-hidden';
  div.innerHTML=`
    <button class="w-full text-left p-4 font-semibold text-[--navy]">${item.q}</button>
    <div class="answer max-h-0 overflow-hidden transition-all bg-white">
      <p class="p-4 text-sm">${item.a}</p>
    </div>
  `;
  div.querySelector('button').addEventListener('click',()=>{
    div.querySelector('.answer').classList.toggle('max-h-0');
    div.querySelector('.answer').classList.toggle('max-h-40');
  });
  faqContainer.appendChild(div);
});

// Newsletter form
document.getElementById('newsletter').addEventListener('submit', e => {
  e.preventDefault();
  alert('Thanks! Check your inbox to confirm.');
  e.target.reset();
});

const userId = localStorage.getItem("userId");

if(userId){
  document.getElementById('dashboard').style.display="block";
  document.getElementById('login_sec').style.display="none";
  document.getElementById('reg_sec').style.display="none";
}