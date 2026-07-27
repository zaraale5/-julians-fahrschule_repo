// Navigation mobile toggle
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
navToggle && navToggle.addEventListener('click', function () {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !expanded);
  mainNav.classList.toggle('open');
});
// Close menu on link click (mobile)
document.querySelectorAll('.nav-list a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e){
    const targetId = this.getAttribute('href').substring(1);
    const el = document.getElementById(targetId);
    if(el) {
      e.preventDefault();
      el.scrollIntoView({behavior: 'smooth', block:'start'});
      el.focus && el.focus({preventScroll:true});
    }
  });
});
// IntersectionObserver for fade-in on scroll
const fadeEls = document.querySelectorAll('.fadein-section');
if('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  fadeEls.forEach(el => io.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}
// FAQ accordion
const faqBtns = document.querySelectorAll('.faq-item dt button');
faqBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const item = btn.closest('.faq-item');
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    item.classList.toggle('open');
    // only one open?
    faqBtns.forEach(b => { if(b!==btn) {b.setAttribute('aria-expanded','false'); b.closest('.faq-item').classList.remove('open') }});
  });
  btn.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      btn.setAttribute('aria-expanded','false');
      btn.closest('.faq-item').classList.remove('open');
      btn.blur();
    }
  });
});
// Contact form validation (client-side only)
document.querySelector('.contact-form') && document.querySelector('.contact-form').addEventListener('submit', function(e){
  e.preventDefault();
  const form = e.target;
  const feedback = form.querySelector('.form-feedback');
  let valid = true;
  form.querySelectorAll('input, textarea').forEach(input => {
    if(!input.checkValidity()) valid = false;
  });
  if(valid){
    feedback.textContent = 'Vielen Dank für deine Anfrage! Wir melden uns schnellstmöglich.';
    feedback.style.color = 'var(--color-cta)';
    form.reset();
  } else {
    feedback.textContent = 'Bitte fülle alle Pflichtfelder korrekt aus.';
    feedback.style.color = 'var(--color-error)';
  }
});
// Keyboard accessibility for nav toggle
document.querySelectorAll('.nav-toggle').forEach(btn =>{
  btn.addEventListener('keydown', function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();btn.click();}
  });
});
// Chatbot widget open/close
const chatbotWidget = document.getElementById('chatbot-widget');
const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotPanel = document.querySelector('.chatbot-panel');
chatbotToggle && chatbotToggle.addEventListener('click', function(){
  chatbotWidget.classList.toggle('open');
  if(chatbotWidget.classList.contains('open')){
    setTimeout(()=>{
      document.getElementById('chatbot-message-input').focus();
    },180);
  }
});
chatbotToggle && chatbotToggle.addEventListener('keydown', function(e){
  if(e.key==="Enter"||e.key===" "){
    e.preventDefault();chatbotToggle.click();
  }
});
// Close chatbot on Escape
document.addEventListener('keydown', function(e){
  if(e.key==='Escape'&&chatbotWidget.classList.contains('open')){
    chatbotWidget.classList.remove('open');
    chatbotToggle.focus();
  }
});
// Chatbot logic
const chatbotForm = document.getElementById('chatbot-form');
const chatbotMsgs = document.getElementById('chatbot-messages');
let chatbotLock = false;
chatbotForm && chatbotForm.addEventListener('submit', function(e){
  e.preventDefault();
  if (chatbotLock) return;
  const input = document.getElementById('chatbot-message-input');
  const text = input.value.trim();
  if(!text) return;
  // Display user's message
  const userMsg = document.createElement('div');
  userMsg.className = 'chatbot-message chatbot-user';
  userMsg.textContent = text;
  chatbotMsgs.appendChild(userMsg);
  chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
  input.value = '';
  chatbotLock = true;
  // Loading message
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'chatbot-message chatbot-agent';
  loadingMsg.textContent = '...';
  chatbotMsgs.appendChild(loadingMsg);
  chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
  // POST to endpoint
  fetch('https://overstay-choosy-succulent.ngrok-free.dev/webhook/chat', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ message: text, companyId: "julians-fahrschule-repo" })
  })
  .then(res => res.json())
  .then(json => {
    loadingMsg.remove();
    const replyMsg = document.createElement('div');
    replyMsg.className = 'chatbot-message chatbot-agent';
    replyMsg.textContent = json.reply || 'Leider gab es ein Problem. Bitte versuche es erneut.';
    chatbotMsgs.appendChild(replyMsg);
    chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
    chatbotLock = false;
  })
  .catch(() => {
    loadingMsg.remove();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'chatbot-message chatbot-agent';
    errorMsg.textContent = 'Leider keine Antwort erhalten. Bitte später erneut versuchen.';
    chatbotMsgs.appendChild(errorMsg);
    chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
    chatbotLock = false;
  });
});
// Keyboard submit for chatbot input
document.getElementById('chatbot-message-input') && document.getElementById('chatbot-message-input').addEventListener('keydown', function(e){
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault(); chatbotForm.requestSubmit();
  }
});
// Accessibility: focus trap inside chatbot-panel
chatbotPanel && chatbotPanel.addEventListener('keydown', function(e){
  if(!chatbotWidget.classList.contains('open')) return;
  if (e.key !== 'Tab') return;
  const focusEls = chatbotPanel.querySelectorAll('input,button,[tabindex]:not([tabindex="-1"])');
  if (focusEls.length===0) return;
  const first = focusEls[0];
  const last = focusEls[focusEls.length-1];
  if (e.shiftKey) { if(document.activeElement===first){e.preventDefault();last.focus();} }
  else { if(document.activeElement===last){e.preventDefault();first.focus();} }
});
// Polite ARIA labeling for new messages
let msgObs;
if (typeof window.MutationObserver !== 'undefined') {
  msgObs = new MutationObserver(function() {
    chatbotMsgs.setAttribute('aria-live','polite');
  });
  msgObs.observe(chatbotMsgs, { childList: true });
}
