let pc;
let audio = document.createElement("audio");
audio.autoplay = true;

function setRole(role){
  document.getElementById("hostUI").classList.add("hidden");
  document.getElementById("clientUI").classList.add("hidden");

  if(role === "host") document.getElementById("hostUI").classList.remove("hidden");
  if(role === "client") document.getElementById("clientUI").classList.remove("hidden");
}

function createPC(){
  pc = new RTCPeerConnection({
    iceServers:[{urls:"stun:stun.l.google.com:19302"}]
  });

  pc.ontrack = e => audio.srcObject = e.streams[0];
}

async function startHost(){
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
  document.getElementById("offer").value = JSON.stringify(offer);
}

async function join(){
  createPC();

  const offer = JSON.parse(document.getElementById("remoteOffer").value);
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  document.getElementById("answer").value = JSON.stringify(answer);
}
