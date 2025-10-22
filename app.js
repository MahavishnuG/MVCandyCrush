// CandyPop — simple match-3
const COLS = 8, ROWS = 8;
const TYPES = 5; // number of candy types
let board = [];
let score = 0, moves = 0;
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const overlay = document.getElementById('overlay');
const popupTitle = document.getElementById('popup-title');
const popupMsg = document.getElementById('popup-msg');
const popupOk = document.getElementById('popup-ok');
const restartBtn = document.getElementById('restart');
const bgMusic = document.getElementById('bg-music');
const sounds = [];
for(let i=0;i<TYPES;i++) sounds.push(document.getElementById('sound-'+i));

// load audio sources
bgMusic.src = 'assets/sounds/bg_loop.wav';
for(let i=0;i<TYPES;i++) sounds[i].src = `assets/sounds/snd_${i}.wav`;

// background drawing
const bgc = document.getElementById('bgcanvas');
bgc.width = 900; bgc.height = 420;
const ctx = bgc.getContext('2d');
function drawBackground(){
  ctx.clearRect(0,0,bgc.width,bgc.height);
  for(let i=0;i<40;i++){
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = ['#ffd7e8','#ffe6b3','#e6f0ff','#efe6ff','#e6ffe9'][i%5];
    const x = Math.random()*bgc.width, y=Math.random()*bgc.height, r=10+Math.random()*80;
    ctx.beginPath(); ctx.ellipse(x,y,r,r/2,0,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
drawBackground();
setInterval(drawBackground,6000);

// utilities
function randType(){ return Math.floor(Math.random()*TYPES); }
function id(r,c){ return `cell-${r}-${c}`; }

// init board
function initBoard(){
  board = [];
  for(let r=0;r<ROWS;r++){
    const row = [];
    for(let c=0;c<COLS;c++){
      row.push({type: randType(), special: null});
    }
    board.push(row);
  }
  // ensure no immediate matches
  removeInitialMatches();
  renderBoard();
  score = 0; moves = 0; updateHUD();
  bgMusic.play().catch(()=>{});
}

function removeInitialMatches(){
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      while(checkThreeAt(r,c)){
        board[r][c].type = randType();
      }
    }
  }
}
function checkThreeAt(r,c){
  const t = board[r][c].type;
  // horizontal
  if(c>=2 && board[r][c-1].type===t && board[r][c-2].type===t) return true;
  // vertical
  if(r>=2 && board[r-1][c].type===t && board[r-2][c].type===t) return true;
  return false;
}

let selected = null;
function renderBoard(){
  boardEl.innerHTML = '';
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = id(r,c);
      const img = document.createElement('img');
      img.src = `assets/candies/candy_${board[r][c].type}.svg`;
      cell.appendChild(img);
      cell.onclick = ()=> onCellClick(r,c);
      boardEl.appendChild(cell);
    }
  }
}

function onCellClick(r,c){
  const el = document.getElementById(id(r,c));
  if(selected==null){
    selected = {r,c};
    el.classList.add('selected');
  } else {
    // if same cell, deselect
    if(selected.r===r && selected.c===c){
      el.classList.remove('selected'); selected=null; return;
    }
    // check adjacency
    const dr = Math.abs(selected.r - r), dc = Math.abs(selected.c - c);
    if((dr+dc)===1){
      swapAndResolve(selected.r, selected.c, r, c);
      document.getElementById(id(selected.r,selected.c)).classList.remove('selected');
      selected = null;
    } else {
      // not adjacent: change selected to new
      document.getElementById(id(selected.r,selected.c)).classList.remove('selected');
      selected = {r,c};
      el.classList.add('selected');
    }
  }
}

function swapAndResolve(r1,c1,r2,c2){
  moves++; updateHUD();
  // swap
  const tmp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = tmp;
  renderBoard();
  // play sound for swapped candies (distinct per type)
  sounds[ board[r2][c2].type ].currentTime = 0; sounds[ board[r2][c2].type ].play().catch(()=>{});

  const matches = findMatches();
  if(matches.length===0){
    // revert swap (invalid)
    setTimeout(()=>{ 
      const t = board[r1][c1]; board[r1][c1]=board[r2][c2]; board[r2][c2]=t; renderBoard();
    },220);
    return;
  }
  // resolve chain
  resolveMatches();
}

function findMatches(){
  const hits = [];
  // horizontal
  for(let r=0;r<ROWS;r++){
    let runType = null, runStart=0, runLen=0;
    for(let c=0;c<=COLS;c++){
      const t = (c<COLS)?board[r][c].type:null;
      if(t===runType){ runLen++; } else {
        if(runLen>=3){ hits.push({type:runType, coords: Array.from({length:runLen}, (_,i)=>[r, runStart+i])}); }
        runType = t; runStart = c; runLen=1;
      }
    }
  }
  // vertical
  for(let c=0;c<COLS;c++){
    let runType=null, runStart=0, runLen=0;
    for(let r=0;r<=ROWS;r++){
      const t = (r<ROWS)?board[r][c].type:null;
      if(t===runType){ runLen++; } else {
        if(runLen>=3){ hits.push({type:runType, coords: Array.from({length:runLen}, (_,i)=>[runStart+i, c])}); }
        runType = t; runStart = r; runLen=1;
      }
    }
  }
  return hits;
}

function resolveMatches(){
  const matches = findMatches();
  if(matches.length===0){ renderBoard(); return; }
  // calculate score and remove candies
  let removed = 0;
  matches.forEach(m=>{
    removed += m.coords.length;
    // show popup for any 3+ match (alert pop-up requirement)
    popupTitle.textContent = "Sweet!";
    popupMsg.textContent = `You matched ${m.coords.length} candies.`;
    showPopup();
    // play sound specific to that candy
    const t = m.type;
    sounds[t].currentTime = 0; sounds[t].play().catch(()=>{});
    m.coords.forEach(([r,c])=>{
      board[r][c] = null;
    });
  });
  score += removed * 10;
  updateHUD();
  // drop candies and fill
  setTimeout(()=>{
    gravityAndRefill();
    // chain resolve
    setTimeout(()=> resolveMatches(), 260);
  }, 260);
}

function gravityAndRefill(){
  for(let c=0;c<COLS;c++){
    let write = ROWS-1;
    for(let r=ROWS-1;r>=0;r--){
      if(board[r][c]!==null){
        board[write][c] = board[r][c]; write--;
      }
    }
    for(let r=write;r>=0;r--){
      board[r][c] = {type: randType(), special:null};
    }
  }
  renderBoard();
}

function updateHUD(){ scoreEl.textContent = score; movesEl.textContent = moves; }

function showPopup(){ overlay.classList.remove('hidden'); }
function hidePopup(){ overlay.classList.add('hidden'); }

popupOk.onclick = ()=> hidePopup();
restartBtn.onclick = ()=> initBoard();

// simple helpers
function randType(){ return Math.floor(Math.random()*TYPES); }

// init on load
window.addEventListener('load', ()=> initBoard());
// close overlay if clicked outside popup
overlay.addEventListener('click', (e)=>{ if(e.target===overlay) hidePopup(); });
