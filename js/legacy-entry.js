if (window.w3up?.create) {
  await import('./script.js');
} else {
  document.getElementById('legacyStorageStatus').textContent =
    'Legacy storage unavailable: the external browser bundle did not load. Use modern.html for local identity and public-only BYOK controls.';
  document.getElementById('waitingScreen').style.display = 'none';
}
