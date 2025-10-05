document.getElementById('add').addEventListener('click', ()=>{
  const input = document.getElementById('item');
  const val = input.value.trim();
  if(!val) return;
  const li = document.createElement('li');
  li.textContent = val;
  document.getElementById('list').appendChild(li);
  input.value = '';
});
