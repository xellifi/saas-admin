fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@saas.com', password: 'SuperPass123!' })
})
    .then(res => res.json().then(data => console.log('Status', res.status, data)))
    .catch(console.error);
