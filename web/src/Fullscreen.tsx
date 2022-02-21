export async function requestFullscreen() {
  if (
    document &&
    !document.fullscreenElement &&
    document.body &&
    document.body.requestFullscreen &&
    typeof document.body.requestFullscreen === "function"
  ) {
    try {
      await document.body.requestFullscreen();
      return true;
    } catch {}
  }
}

export async function exitFullscreen() {
  if (
    document &&
    document.fullscreenElement &&
    document.exitFullscreen &&
    typeof document.exitFullscreen === "function"
  ) {
    try {
      await document.exitFullscreen();
      return true;
    } catch {}
  }
}
