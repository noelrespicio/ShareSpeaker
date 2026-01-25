const status = document.getElementById("status");
const SERVER = "wss://YOUR-SERVER-URL"; // palitan

let ws;
let pc;
let room = "";
let isHost = false;

const audio = new Audio();
audio.autoplay = true;

// CONNECT ON LOAD
connectWS();

function connectWS(){
  ws = new WebSocket(SERVER);

  ws.onopen = () => {
    status.innerText = "Connected to server";
  };

  ws.onmessage = handleSignal;
}

function joinRoom(){
  room = document.getElementById("room").value.trim();
  if(!room) return alert("Enter room name");

  if(ws.readyState === WebSocket.OPEN){
    ws.send(JSON.stringify({ type:"join", room }));
    status.innerText = "Joined room: " + room;
  } else {
    ws.onopen = () => {
      ws.send(JSON.stringify({ type:"join", room }));
      status.innerText = "Joined room: " + room;
    };
  }
}

function createPC(){
  const pc = new RTCPeerConnection({
    iceServers:[{ urls:"stun:stun.l.google.com:19302" }]
  });

  pc.ontrack = e => audio.srcObject = e.streams[0];

  pc.onicecandidate = e => {
    if(e.candidate){
      ws.send(JSON.stringify({ candidate:e.candidate }));
    }
  };
  return pc;
}

// HOST
async function startHost(){
  if(!room) return alert("Join room first");

  isHost = true;
  pc = createPC();

  const file = document.getElementById("music").files[0];
  if(!file) return alert("Select music");

  const ctx = new AudioContext();
  const el = new Audio(URL.createObjectURL(file));
  const src = ctx.createMediaElementSource(el);
  const dest = ctx.createMediaStreamDestination();

  src.connect(dest);
  src.connect(ctx.destination);
  dest.stream.getTracks().forEach(t => pc.addTrack(t, dest.stream));
  el.play();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  ws.send(JSON.stringify({ offer }));
  status.innerText = "🎧 Hosting music…";
}

// SIGNALS
async function handleSignal(msg){
  const data = JSON.parse(msg.data);

  if(data.offer && !isHost){
    pc = createPC();
    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    ws.send(JSON.stringify({ answer }));
    status.innerText = "🔊 Speaker connected";
  }

  if(data.answer && isHost){
    await pc.setRemoteDescription(data.answer);
  }

  if(data.candidate && pc){
    await pc.addIceCandidate(data.candidate);
  }
    }
