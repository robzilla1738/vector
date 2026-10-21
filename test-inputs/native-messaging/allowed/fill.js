if (location.origin === 'http://127.0.0.1:38765' && location.pathname === '/aux-dummy.html') {
 const button = document.createElement('button'); button.textContent = 'Fill dummy values from extension'; button.id='extension-fill';
 button.onclick = () => { for (const [id,value] of [['username','aux-dummy-user'],['password','NOT-A-REAL-PASSWORD']]) { const field=document.getElementById(id); field.value=value; field.dispatchEvent(new Event('input',{bubbles:true})); } document.getElementById('result').textContent='Dummy fields filled by extension'; }; document.body.append(button);
}
