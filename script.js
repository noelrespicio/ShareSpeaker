let pc;
const audio = document.getElementById("player");

function createPC() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  pc.ontrack = e => audio.srcObject = e.streams[0];
}

async function startHost() {
  createPC();

  const file = document.getElementById("music").files[0];
  const audioEl = new Audio(URL.createObjectURL(file));
  audioEl.loop = true;

  const ctx = new AudioContext();
  const source = ctx.createMediaElementSource(audioEl);
  const dest = ctx.createMediaStreamDestination();

  source.connect(dest);
  source.connect(ctx.destination);

  dest.stream.getTracks().forEach(t => pc.addTrack(t, dest.stream));
  audioEl.play();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Encode offer into URL
  const encoded = btoa(JSON.stringify(offer));
  const url = `${location.origin}${location.pathname}?offer=${encoded}`;

  // Generate QR
  QRCode.toCanvas(document.getElementById("qr"), url);
}

// AUTO JOIN WHEN QR SCANNED
(async () => {
  const params = new URLSearchParams(location.search);
  if (!params.has("offer")) return;

  createPC();

  const offer = JSON.parse(atob(params.get("offer")));
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // Send answer back automatically
  alert("Connected as Speaker 🔊\nReturn to Host device");
})();
