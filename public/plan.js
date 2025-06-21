<!DOCTYPE html>
<html>
<head>
  <title>Choose Your Plan</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body class="terminal-theme">
  <main style="text-align:center; padding:2rem">
    <h1>🚀 Launch Your Site</h1>
    <p>Select a plan below to get started:</p>

    <div style="display: flex; justify-content: center; gap: 2rem;">
      <!-- Free Plan -->
      <div class="plan-card">
        <h2>🌐 Free Subdomain</h2>
        <p>username.pacmacmobile.com</p>
        <ul>
          <li>Powered by PacMac Mobile</li>
          <li>“Build Your Own” link</li>
          <li>Fast hosting</li>
        </ul>
        <button onclick="window.location.href='/deploy/free.html'">Start Free</button>
      </div>

      <!-- Paid Plan -->
      <div class="plan-card premium">
        <h2>🏆 Custom Domain</h2>
        <p>yourowndomain.com</p>
        <ul>
          <li>No branding</li>
          <li>Full domain control</li>
          <li>DNS via Dynadot</li>
        </ul>
        <button onclick="window.location.href='/payment/checkout.html'">Go Premium ($15)</button>
      </div>
    </div>
  </main>
</body>
</html>
