const ws = new WebSocket("wss://your-public-signaling-server");
let pc;
let audio = new Audio();
audio.autoplay = true;

function join() {
  const room = document.getElementById("room").value;
  ws.onopen = () => {
    ws.send(JSON.stringify({ type:"join", room }));
    document.getElementById("status").innerText = "Joined room ✔";
  };
}

ws.onmessage = async msg => {
  const data = JSON.parse(msg.data);

  if (data.offer) {
    pc = createPC();
    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(JSON.stringify({ answer }));
  }

  if (data.stream) {
    audio.srcObject = data.stream;
  }
};

function createPC(){
  const pc = new RTCPeerConnection({
    iceServers:[{urls:"stun:stun.l.google.com:19302"}]
  });
  pc.ontrack = e => audio.srcObject = e.streams[0];
  return pc;
}

async function start(){
  pc = createPC();

  const file = document.getElementById("music").files[0];
  const el = new Audio(URL.createObjectURL(file));
  const ctx = new AudioContext();
  const src = ctx.createMediaElementSource(el);
  const dest = ctx.createMediaStreamDestination();

  src.connect(dest);
  src.connect(ctx.destination);
  dest.stream.getTracks().forEach(t => pc.addTrack(t, dest.stream));
  el.play();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ offer }));
}
