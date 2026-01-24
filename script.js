const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});

let audio = document.createElement("audio");
audio.autoplay = true;

pc.ontrack = e => audio.srcObject = e.streams[0];

// HOST
async function start() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: false
  });

  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  alert("COPY THIS OFFER:\n" + JSON.stringify(offer));
}

// CLIENT
async function join(offer) {
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  alert("COPY THIS ANSWER:\n" + JSON.stringify(answer));
}
