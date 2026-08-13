document.addEventListener("DOMContentLoaded", () => {
  const footerText = document.querySelector(".site-footer p");
  if (footerText) {
    const year = new Date().getFullYear();
    footerText.textContent = `40 Boring Bots — a practical AI transformation proposal • ${year}`;
  }
});
