(function () {
  "use strict";

  var deferredPrompt = null;
  var banner = null;

  // Capture the install prompt
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  function showBanner() {
    // Don't show if already dismissed this session
    try {
      if (sessionStorage.getItem("pwa-install-dismissed")) return;
    } catch (e) {}

    banner = document.createElement("div");
    banner.className = "pwa-banner";
    banner.innerHTML =
      '<span class="pwa-banner__text">Install Math Direct for offline access</span>' +
      '<button class="pwa-banner__install" id="pwa-install-btn">Install</button>' +
      '<button class="pwa-banner__close" id="pwa-close-btn" aria-label="Dismiss">&times;</button>';

    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add("pwa-banner--visible");
      });
    });

    document.getElementById("pwa-install-btn").addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        removeBanner();
      });
    });

    document.getElementById("pwa-close-btn").addEventListener("click", function () {
      try { sessionStorage.setItem("pwa-install-dismissed", "1"); } catch (e) {}
      removeBanner();
    });
  }

  function removeBanner() {
    if (!banner) return;
    banner.classList.remove("pwa-banner--visible");
    setTimeout(function () {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      banner = null;
    }, 300);
  }

  // Hide if app is installed
  window.addEventListener("appinstalled", function () {
    removeBanner();
    deferredPrompt = null;
  });
})();
