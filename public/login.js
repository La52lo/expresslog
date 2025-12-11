document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
	  localStorage.setItem('userName', username);
      document.getElementById('message').textContent = 'Login successful';
      window.location.href = '/'; // redirect to home
    } else {
      document.getElementById('message').textContent = data.error || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    document.getElementById('message').textContent = 'Network error';
  }
});
