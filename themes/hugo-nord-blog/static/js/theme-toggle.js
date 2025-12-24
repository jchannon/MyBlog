/**
 * Theme Toggle - Dark/Light Mode
 * Persists user preference in localStorage
 */
(function() {
  const toggle = document.getElementById('theme-toggle');
  
  if (!toggle) return;
  
  // Get current theme
  function getTheme() {
    return document.documentElement.getAttribute('data-theme');
  }
  
  // Set theme and persist to localStorage
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }
  
  // Toggle between light and dark
  function toggleTheme() {
    const currentTheme = getTheme();
    if (currentTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }
  
  // Handle click
  toggle.addEventListener('click', toggleTheme);
  
  // Handle keyboard accessibility
  toggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });
})();
