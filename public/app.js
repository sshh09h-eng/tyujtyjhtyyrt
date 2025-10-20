const params = new URLSearchParams(window.location.search);
const userId = params.get('userId') || 'guest_' + Math.floor(Math.random()*100000);

async function fetchUser(){
  const res = await fetch(`/api/user/${encodeURIComponent(userId)}`);
  const data = await res.json();
  document.getElementById('balance').innerText = data.balance;
  document.getElementById('adsCount').innerText = data.watchedAds || 0;
  document.getElementById('userInfo').innerText = `User: ${data.id}`;
}

fetchUser();

document.getElementById('watchAdBtn').addEventListener('click', ()=>{
  showRewardAdEmulator(async (result)=>{
    if (result && result.success){
      const resp = await fetch('/api/ad-complete', {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ userId })
      });
      const body = await resp.json();
      if (body.ok){
        alert('You earned 5 টাকা!');
        fetchUser();
      }
    }
  });
});

document.getElementById('openChannel').addEventListener('click', ()=>{
  window.open('https://t.me/Red_Chilii_bot', '_blank');
});

document.getElementById('checkClaimChannel').addEventListener('click', async ()=>{
  alert('Demo: credited 10 টাকা for channel join.');
  await fetch('/api/fake-claim', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, amount: 10 }) });
  fetchUser();
});

document.getElementById('withdrawBtn').addEventListener('click', async ()=>{
  const amount = Number(document.getElementById('withdrawAmount').value||0);
  const account = document.getElementById('withdrawAccount').value;
  const method = document.getElementById('withdrawMethod').value;
  const resp = await fetch('/api/withdraw', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, amount, account, method }) });
  const body = await resp.json();
  if (body.ok) alert('Withdraw request created — admin will process.');
  else alert('Error: ' + (body.error||'unknown'));
  fetchUser();
});
