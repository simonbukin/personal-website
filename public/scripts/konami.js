// Konami Code - lazy loaded module
// Activated when user enters: Up Up Down Down Left Right Left Right B A

export function initKonami() {
  if (window.__konamiActive) return;
  window.__konamiActive = true;

  var chaosActive = true;
  window.dispatchEvent(new CustomEvent("konamiCode"));

  var KONAMI_SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ];

  var inputBuffer = [];

  function checkKonamiSequence() {
    if (inputBuffer.length < KONAMI_SEQUENCE.length) return false;
    var recentInput = inputBuffer.slice(-KONAMI_SEQUENCE.length);
    return recentInput.every(function (key, i) {
      return key === KONAMI_SEQUENCE[i];
    });
  }

  document.addEventListener("keydown", function (e) {
    // Escape exits chaos mode
    if (e.code === "Escape" && chaosActive) {
      chaosActive = false;
      window.dispatchEvent(new CustomEvent("konamiCodeExit"));
      inputBuffer = [];
      return;
    }

    // Don't capture if user is typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    inputBuffer.push(e.code);

    // Keep buffer from growing too large
    if (inputBuffer.length > KONAMI_SEQUENCE.length * 2) {
      inputBuffer = inputBuffer.slice(-KONAMI_SEQUENCE.length);
    }

    if (checkKonamiSequence()) {
      if (!chaosActive) {
        chaosActive = true;
        window.dispatchEvent(new CustomEvent("konamiCode"));
        inputBuffer = [];
      }
    }
  });

  // Debug helpers (dev mode)
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
  ) {
    window.triggerKonami = function () {
      chaosActive = true;
      window.dispatchEvent(new CustomEvent("konamiCode"));
    };
    window.exitKonami = function () {
      chaosActive = false;
      window.dispatchEvent(new CustomEvent("konamiCodeExit"));
    };
  }
}
