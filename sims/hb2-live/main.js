/* HB-2 robotic squat laboratory — original demo for the teardown fork.
 * Geometry is illustrative; dimensional assumptions are explicitly labelled.
 * MIT license. Requires three.js 0.186.1 (bundled by sims/build.mjs for offline use).
 */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const app = document.querySelector('#app');
app.innerHTML = `
<div class="stage" id="stage"><div class="loader" id="loader">ĐANG KHỞI TẠO PHÒNG THÍ NGHIỆM 3D<small id="loadnote">Three.js · Robot HB-2 · động học hai khâu</small></div></div>
<header class="topbar"><div class="brand"><div class="mark">⌘</div><div>HB-2 <span><span>ROBOT LAB</span></span></div></div><div class="heading"><div class="eyebrow">MÔ PHỎNG CƠ KHÍ 3D TƯƠNG TÁC · ĐƠN VỊ MILLIMÉT (MM)</div><h1>Robot Hai Chân Nhân Dạng <span>/ Squat Đối Xứng</span></h1><div class="micro">MÔ HÌNH ĐƠN GIẢN model(u) · ĐÙI 350 MM · CẲNG CHÂN 350 MM · HÀNH TRÌNH 100 MM</div></div><div class="topmeta"><strong>H(u) = 600 − 100u MM</strong>ĐỘNG HỌC NGƯỢC · HAI KHÂU · HAI CHÂN ĐỐI XỨNG<br>QUỸ ĐẠO THAM SỐ · GIẢ ĐỊNH THIẾT KẾ</div></header>
<div class="hint">Kéo để xoay · Cuộn để phóng to · Nhấp robot để xem bộ phận</div>
<div class="panels left">
<section class="panel"><div class="panelhead"><strong>ĐỘNG HỌC NGƯỢC &amp; TỌA ĐỘ GỐI</strong><small>01</small></div><div class="status"><i></i><span id="statusText">TƯ THẾ CHUẨN BỊ</span></div><p class="formula">H=600−100u · KNEE=√(350²−(H/2)²)</p><div class="kv"><span>THAM SỐ SQUAT u</span><b id="uValue">0.000</b></div><div class="kv"><span>ĐỘ CAO H</span><b id="hValue">600.00 mm</b></div><div class="kv"><span>NHÔ GỐI (Z)</span><b id="kneeValue">180.28 mm</b></div><div class="kv"><span>ĐỘ DÀI ĐÙI / CẲNG</span><b>350 / 350 mm</b></div><div class="chartbox"><svg viewBox="0 0 210 75" role="img" aria-label="Sơ đồ động học gối"><line x1="23" y1="5" x2="23" y2="73" stroke="#a0adb7" stroke-dasharray="3 3"/><line x1="23" y1="73" x2="190" y2="73" stroke="#a0adb7"/><path id="legSvg" d="M24 7 L66 39 L24 72" fill="none" stroke="#2f3b46" stroke-width="3" stroke-linecap="round"/><circle id="kneeSvg" cx="66" cy="39" r="4" fill="#404d59"/><circle cx="24" cy="7" r="4" fill="#98a6b2"/><rect x="10" y="69" width="28" height="5" rx="2" fill="#687987"/></svg></div></section>
<section class="panel"><div class="panelhead"><strong>GÓC KHỚP TRÁI [L] &amp; PHẢI [R]</strong><small>02</small></div><div class="angles" id="angles"></div><div class="smallnote">GÓC HÌNH HỌC ĐƯỢC TÍNH TỪ H(u), KHÔNG ĐO TỪ CẢM BIẾN.</div></section>
<section class="panel"><div class="panelhead"><strong>TIẾP ĐẤT &amp; TRỌNG TÂM COM</strong><small>03</small></div><div class="contact"><span class="ok">● CHÂN TRÁI [L]:</span> CỐ ĐỊNH · ĐẾ 0.00 MM<br><span class="ok">● CHÂN PHẢI [R]:</span> CỐ ĐỊNH · ĐẾ 0.00 MM</div><div class="comchart"><span id="comDot" class="comdot"></span></div><div class="kv"><span>CoM Z (ƯỚC LƯỢNG)</span><b id="comValue">50.48 mm</b></div><div class="kv"><span>TRẠNG THÁI</span><b id="contactValue">TIẾP ĐẤT</b></div><div class="smallnote">CoM minh họa theo phân bố khối lượng giả định; không phải kiểm chứng ổn định động.</div></section>
</div>
<div class="panels right">
<section class="panel"><div class="panelhead"><strong>THÔNG SỐ &amp; GIẢ ĐỊNH THIẾT KẾ</strong><small>04</small></div><div class="spec"><b>THÔNG SỐ ĐỀ BÀI (SPECIFIED)</b><br>• Khoảng hông: 200 mm<br>• Đùi / cẳng chân: 350 / 350 mm<br>• H ban đầu: 600 mm; giảm tối đa 100 mm<br>• Bàn chân tiếp đất; thân đối xứng<br><hr><span class="assumption">GIẢ ĐỊNH THIẾT KẾ (DEMO)</span><br>• Khớp dạng khối vỏ, không phải CAD chế tạo<br>• Tốc độ/CoM/khối lượng chỉ để trực quan<br>• Không giải bài toán mô-men, lực hay cân bằng</div></section>
<section class="panel"><div class="panelhead"><strong>CHU TRÌNH VẬN HÀNH</strong><small>05</small></div><div class="group"><button data-action="squat">HẠ SQUAT</button><button data-action="stand" class="active">ĐỨNG THẲNG</button></div></section>
<section class="panel"><div class="panelhead"><strong>GÓC NHÌN &amp; CẬN CẢNH KHỚP</strong><small>06</small></div><div class="group"><button data-view="perspective" class="active">TOÀN THÂN</button><button data-view="side">MẶT BÊN</button><button data-view="front">MẶT TRƯỚC</button><button data-view="hip">KHỚP HÔNG</button><button data-view="knee">KHỚP GỐI</button><button data-view="feet">CỔ CHÂN</button></div></section>
<section class="panel"><div class="panelhead"><strong>CHẾ ĐỘ GIẢI PHẪU &amp; HIỂN THỊ</strong><small>07</small></div><div class="group"><button data-mode="solid" class="active">VỎ NGUYÊN KHỐI</button><button data-mode="wire">LƯỚI DÂY</button><button data-mode="xray">VỎ KÍNH X-RAY</button><button data-mode="explode">TÁCH CỤM</button><button data-action="com">TRỌNG TÂM: BẬT</button><button data-action="orbit">XOAY TỰ ĐỘNG</button></div></section>
</div>
<div id="selection" class="sel" role="status"></div>
<div class="bottom"><section class="transport"><div class="panelhead"><strong>BỘ ĐIỀU KHIỂN HÀNH TRÌNH SQUAT TỔNG — model(u)</strong><small>08</small></div><div class="timeline"><button class="play" id="play" aria-label="Tạm dừng mô phỏng">❚❚</button><div class="track"><div class="trackrow"><strong>THANH TRƯỢT SQUAT u</strong><span id="readout">u=0.000 · h=600mm · knee=180.28mm</span></div><input id="squat" type="range" min="0" max="1" value="0" step="0.001" aria-label="Mức squat"></div><div class="speedctrl"><span class="micro">TỐC ĐỘ</span><input id="speed" type="range" min="0.25" max="2" step="0.25" value="1" aria-label="Tốc độ mô phỏng"><span id="speedValue" class="micro">1.00×</span></div></div><div class="transportline"><span id="phaseLabel">ĐANG CHẠY · CHU TRÌNH 6.5 GIÂY</span><span>PHÍM CÁCH: CHẠY / DỪNG · R: ĐẶT LẠI</span></div><div class="playstat">✓ Hai chân cố định · Tham số động học đồng bộ với mô hình 3D</div></section></div>
<footer class="footer"><span>HB-2 · MÔ PHỎNG KỸ THUẬT 3D · THREE.JS · GIAO DIỆN BẠC / TRẮNG / ĐEN</span><span>BAO GỒM GIẢ ĐỊNH CƠ KHÍ · KHÔNG PHẢI DIGITAL TWIN ĐÃ KIỂM CHỨNG</span></footer>`;
const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const fmt = (v, n=2) => Number(v).toFixed(n);
const state = {u:0,target:0,playing:true,speed:1,time:0,mode:'solid',view:'perspective',orbit:false,com:true,selected:'',drag:false};
const L = 350;
function solve(u){
  const h = 600-100*u;
  const knee = Math.sqrt(Math.max(0,L*L-(h/2)**2));
  const hipAngle = Math.acos(h/(2*L))*180/Math.PI;
  return {u,h,knee,hipAngle,kneeAngle:hipAngle*2,ankleAngle:hipAngle,comZ:0.28*knee+25*u};
}
for (const [name,fn] of [['HÔNG PITCH',m=>m.hipAngle],['GỐI FLEXION',m=>m.kneeAngle],['CỔ CHÂN',m=>m.ankleAngle],['HÔNG ROLL',()=>0],['VAI PITCH',m=>18+10*m.u]]){
  const line=document.createElement('div');line.className='angle';line.innerHTML=`<span>${name}</span><div class="meter"><i></i></div><b>0°</b>`;line.dataset.label=name;$('angles').append(line);
}
let scene,camera,renderer,robot,torso,head,bodyPlate,hips,footL,footR,comMarker,comLine;
const armorMeshes=[],allMeshes=[],subparts=[];
const cameraNow={theta:.53,phi:1.14,radius:17,targetY:5.1};
const cameraGoal={...cameraNow};
const mat=(color,metalness=.25,roughness=.5,transparent=false)=>new THREE.MeshStandardMaterial({color,metalness,roughness,transparent});
const white=mat('#f7f9fa',.38,.43),silver=mat('#aeb8c2',.83,.35),lightSilver=mat('#dbe2e8',.67,.31),dark=mat('#263039',.45,.55),rubber=mat('#131a21',.08,.83),inner=mat('#53616e',.68,.43),glass=mat('#6b7e8e',.47,.28,true);
glass.opacity=.87;glass.depthWrite=false;
const yAxis=new THREE.Vector3(0,1,0);
function addMesh(parent,geometry,material,label,armor=false){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;m.userData.label=label;m.userData.originalMaterial=material;parent.add(m);allMeshes.push(m);if(armor)armorMeshes.push(m);return m;}
function box(parent,w,h,d,material,label,r=.09,armor=false){return addMesh(parent,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),material,label,armor);}
function sphere(parent,r,material,label){return addMesh(parent,new THREE.SphereGeometry(r,16,12),material,label);}
function axisJoint(parent,r,label){
  const joint=new THREE.Group();parent.add(joint);
  const core=addMesh(joint,new THREE.CylinderGeometry(r*.88,r*.88,.24,24),dark,label);core.rotation.z=Math.PI/2;
  for(const s of [-1,1]){
    const rim=addMesh(joint,new THREE.TorusGeometry(r*.87,.043,8,25),lightSilver,label);rim.rotation.y=Math.PI/2;rim.position.x=s*.135;
    const bolt=addMesh(joint,new THREE.CylinderGeometry(r*.18,r*.18,.037,12),rubber,label);bolt.rotation.z=Math.PI/2;bolt.position.x=s*.15;
  }
  return joint;
}
function link(parent,width,depth,material,label){
  const g=new THREE.Group();parent.add(g);
  const shell=box(g,width,1,depth,material,label,.09,true);
  const rail=box(g,.07,.80,depth+.025,dark,label,.02);rail.position.x=width*.35;
  return {g,shell,rail};
}
function positionLink(obj,a,b,sideOffset=0){
  const A=a.clone(),B=b.clone();A.x+=sideOffset;B.x+=sideOffset;
  obj.g.position.copy(A).add(B).multiplyScalar(.5);
  const dir=B.sub(A),length=dir.length();obj.g.quaternion.setFromUnitVectors(yAxis,dir.normalize());
  obj.shell.scale.y=length*.88;obj.rail.scale.y=length*.95;
}
function init3d(){
  const stage=$('stage');
  scene=new THREE.Scene();scene.background=new THREE.Color('#e8edf1');scene.fog=new THREE.Fog('#e8edf1',23,58);
  camera=new THREE.PerspectiveCamera(36,1,.1,120);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.43;
  stage.insertBefore(renderer.domElement,stage.firstChild);
  const hemi=new THREE.HemisphereLight('#ffffff','#8693a0',2.45);scene.add(hemi);
  const key=new THREE.DirectionalLight('#ffffff',3.1);key.position.set(-8,17,12);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-12;key.shadow.camera.right=12;key.shadow.camera.top=14;key.shadow.camera.bottom=-14;key.shadow.bias=-.00025;scene.add(key);
  const fill=new THREE.DirectionalLight('#bbd1de',2.05);fill.position.set(7,9,-7);scene.add(fill);
  const rim=new THREE.DirectionalLight('#ffffff',1.1);rim.position.set(2,8,8);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshStandardMaterial({color:'#dfe5e9',roughness:.94,metalness:.03}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.07;scene.add(floor);
  const grid=new THREE.GridHelper(90,90,'#b3bec6','#c9d2d8');grid.position.y=-.061;grid.material.transparent=true;grid.material.opacity=.61;scene.add(grid);
  const major=new THREE.GridHelper(90,18,'#96a3ad','#b3bec6');major.position.y=-.055;major.material.transparent=true;major.material.opacity=.36;scene.add(major);
  robot=new THREE.Group();scene.add(robot);
  // Torso and visible chassis are independently controlled for exploded / x-ray modes.
  torso=new THREE.Group();robot.add(torso);
  const chest=box(torso,2.42,2.72,1.0,white,'Vỏ thân trước',.18,true);chest.position.y=0;
  const spine=box(torso,1.8,2.34,.63,inner,'Khung thân',.09);spine.position.z=-.28;
  bodyPlate=box(torso,1.86,1.92,.085,lightSilver,'Tấm giáp ngực',.12,true);bodyPlate.position.set(0,.12,.55);
  const screen=box(torso,.70,.18,.12,dark,'Bộ điều khiển trên thân',.05);screen.position.set(0,.86,.63);
  const belt=box(torso,1.7,.38,.85,dark,'Khung eo',.1);belt.position.y=-1.55;
  const pelvis=box(torso,1.82,.65,.92,lightSilver,'Cụm hông',.13);pelvis.position.set(0,-1.76,.08);
  head=new THREE.Group();robot.add(head);
  const neck=box(head,.42,.51,.43,dark,'Cổ robot',.09);neck.position.y=-.39;
  const visor=box(head,1.18,.42,.68,white,'Cụm cảm biến đầu',.18,true);visor.position.y=.12;
  const face=box(head,.77,.25,.12,rubber,'Cảm biến thị giác',.055);face.position.set(0,.11,.355);
  for(let i=-1;i<=1;i+=2){const lens=sphere(head,.06,lightSilver,'Ống kính');lens.position.set(i*.24,.11,.435);}
  const cap=box(head,1.0,.14,.60,lightSilver,'Nắp đầu',.07,true);cap.position.y=.36;
  hips=[-1,1].map(side=>{
    const g=new THREE.Group();robot.add(g);
    const hip=axisJoint(g,.38,`Khớp hông ${side<0?'trái':'phải'}`);
    const upper=link(g,.53,.55,white,`Vỏ đùi ${side<0?'trái':'phải'}`);
    const knee=axisJoint(g,.43,`Khớp gối ${side<0?'trái':'phải'}`);
    const lower=link(g,.48,.52,white,`Vỏ cẳng chân ${side<0?'trái':'phải'}`);
    const ankle=axisJoint(g,.29,`Khớp cổ chân ${side<0?'trái':'phải'}`);
    const foot=box(g,.87,.26,1.48,lightSilver,`Bàn chân ${side<0?'trái':'phải'}`,.10,true);
    const sole=box(g,.93,.11,1.58,dark,`Đế chân ${side<0?'trái':'phải'}`,.035);
    const toe=box(g,.66,.05,.37,silver,'Mũi bàn chân',.025);
    const armG=new THREE.Group();robot.add(armG);
    const shoulder=axisJoint(armG,.31,`Khớp vai ${side<0?'trái':'phải'}`);
    const upperArm=link(armG,.42,.44,white,'Cánh tay trên');
    const elbow=axisJoint(armG,.26,'Khớp khuỷu tay');
    const forearm=link(armG,.34,.35,lightSilver,'Cẳng tay');
    const wrist=sphere(armG,.27,silver,'Bàn tay');
    return {side,g,hip,upper,knee,lower,ankle,foot,sole,toe,armG,shoulder,upperArm,elbow,forearm,wrist};
  });
  comMarker=new THREE.Group();scene.add(comMarker);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.16,.22,40),new THREE.MeshBasicMaterial({color:'#41515f',side:THREE.DoubleSide,transparent:true,opacity:.75}));ring.rotation.x=-Math.PI/2;ring.position.y=.004;comMarker.add(ring);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.08,12,10),new THREE.MeshBasicMaterial({color:'#354453'}));dot.position.y=.095;comMarker.add(dot);
  const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,6,0)]);
  comLine=new THREE.Line(lineGeo,new THREE.LineDashedMaterial({color:'#566b7b',dashSize:.18,gapSize:.15,transparent:true,opacity:.55}));comLine.computeLineDistances();scene.add(comLine);
  pose(solve(0));setMode('solid');
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let moved=false,pointer=null;
  renderer.domElement.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,theta:cameraGoal.theta,phi:cameraGoal.phi};moved=false;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;cameraGoal.theta=pointer.theta-dx*.007;cameraGoal.phi=clamp(pointer.phi+dy*.006,.16,2.25);state.orbit=false;setActive('[data-action="orbit"]',null)});
  renderer.domElement.addEventListener('pointerup',e=>{if(!moved){const rect=renderer.domElement.getBoundingClientRect();mouse.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(robot.children,true).filter(h=>h.object.userData.label);if(hits.length){state.selected=hits[0].object.userData.label;$('selection').textContent=`◉ ${state.selected} · NHẤP MỘT BỘ PHẬN ĐỂ XEM`;$('selection').classList.add('show')}else $('selection').classList.remove('show');}pointer=null});
  renderer.domElement.addEventListener('pointercancel',()=>pointer=null);
  renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();cameraGoal.radius=clamp(cameraGoal.radius*Math.exp(e.deltaY*.001),5.8,26);state.orbit=false},{passive:false});
  renderer.domElement.addEventListener('dblclick',()=>setView('perspective'));
  window.addEventListener('resize',resize);resize();$('loader').remove();
}
function pose(m){
  // mm / 100 => scene units; both ankle and hip are on z=0, knee moves in +z.
  const hipY=m.h/100+.35;
  torso.position.set(0,hipY+1.66,0);torso.rotation.x=-.045*m.u;
  bodyPlate.position.z=.55+(state.mode==='explode'?.88:0);
  head.position.set(0,hipY+3.74,-.03);head.rotation.x=-.025*m.u;
  for(const p of hips){
    const x=p.side*1.0;
    const s=state.mode==='explode'?p.side*.50:0;
    const a=new THREE.Vector3(x,hipY,0),b=new THREE.Vector3(x,.35+m.h/200,m.knee/100),c=new THREE.Vector3(x,.35,0);
    p.hip.position.copy(a);p.hip.position.x+=s;
    p.knee.position.copy(b);p.knee.position.x+=s;
    p.ankle.position.copy(c);p.ankle.position.x+=s;
    positionLink(p.upper,a,b,s);positionLink(p.lower,b,c,s);
    p.foot.position.set(x+s,.26,.37);p.sole.position.set(x+s,.065,.37);p.toe.position.set(x+s,.17,.96);
    const sx=p.side*1.54, sy=hipY+2.80;
    const shoulder=new THREE.Vector3(sx,sy,-.02),elbow=new THREE.Vector3(sx+p.side*.22,hipY+1.47,.29+.32*m.u),wrist=new THREE.Vector3(sx+p.side*.35,hipY+.48,.73+.53*m.u);
    p.shoulder.position.copy(shoulder);p.shoulder.position.x+=s;
    p.elbow.position.copy(elbow);p.elbow.position.x+=s;
    p.wrist.position.copy(wrist);p.wrist.position.x+=s;
    positionLink(p.upperArm,shoulder,elbow,s);positionLink(p.forearm,elbow,wrist,s);
  }
  comMarker.position.set(0,0,m.comZ/100);comMarker.visible=state.com;
  const start=new THREE.Vector3(0,.02,m.comZ/100),end=new THREE.Vector3(0,hipY+1.35,m.comZ/100);
  comLine.geometry.setFromPoints([start,end]);comLine.computeLineDistances();comLine.visible=state.com;
}
function setMode(mode){
  state.mode=mode;
  for(const m of allMeshes){m.material=m.userData.originalMaterial;}
  if(mode==='xray'||mode==='wire')for(const m of armorMeshes){
    const copy=m.userData.originalMaterial.clone();
    if(mode==='xray'){copy.transparent=true;copy.opacity=.19;copy.depthWrite=false;}
    else {copy.wireframe=true;copy.roughness=.75;}
    m.material=copy;
  }
  setActive('[data-mode]',mode);pose(solve(state.u));
}
function setActive(selector,value){document.querySelectorAll(selector).forEach(b=>b.classList.toggle('active',b.dataset.mode===value||b.dataset.view===value||(value&&b.dataset.action===value)));}
function setView(view){state.view=view;const angles={perspective:[.53,1.14,17,5.1],front:[0,1.25,18,5.1],side:[Math.PI/2,1.20,17,5.1],hip:[.64,1.34,8.4,6.4],knee:[1.20,1.2,8.8,3.5],feet:[.48,1.16,7.8,.9]};const a=angles[view];[cameraGoal.theta,cameraGoal.phi,cameraGoal.radius,cameraGoal.targetY]=a;state.orbit=false;setActive('[data-view]',view);setActive('[data-action="orbit"]',null);}
function updateUI(m){
  $('uValue').textContent=fmt(m.u,3)+` (${fmt(m.u*100,0)}%)`;
  $('hValue').textContent=fmt(m.h)+' mm';$('kneeValue').textContent=fmt(m.knee)+' mm';
  $('readout').textContent=`u=${fmt(m.u,3)} · h=${fmt(m.h,0)}mm · knee=${fmt(m.knee,2)}mm`;
  $('statusText').textContent=m.u<.03?'TƯ THẾ CHUẨN BỊ':m.u>.97?'SQUAT TỐI ĐA':'ĐANG CHUYỂN TƯ THẾ';
  const angs=[m.hipAngle,m.kneeAngle,m.ankleAngle,0,18+10*m.u];
  document.querySelectorAll('.angle').forEach((el,i)=>{el.querySelector('i').style.width=clamp(angs[i]/95*100,1,100)+'%';el.querySelector('b').textContent=fmt(angs[i],1)+'°'});
  const ky=7+(1-m.h/600)*18;const kx=24+(m.knee/350)*66;
  $('legSvg').setAttribute('d',`M24 ${ky} L${kx} 39 L24 72`);$('kneeSvg').setAttribute('cx',kx);
  $('comValue').textContent=fmt(m.comZ)+' mm';$('comDot').style.left=(50+m.comZ*.25)+'%';
  $('contactValue').textContent=m.comZ<170?'TRONG VÙNG ĐỠ (TĨNH)':'CẦN ĐÁNH GIÁ';
  if(document.activeElement!==$('squat'))$('squat').value=fmt(m.u,3);
}
function resize(){if(!renderer)return;const r=$('stage').getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
function updateButtons(){const p=$('play');p.textContent=state.playing?'❚❚':'▶';p.setAttribute('aria-label',state.playing?'Tạm dừng mô phỏng':'Tiếp tục mô phỏng');$('phaseLabel').textContent=state.playing?'ĐANG CHẠY · CHU TRÌNH 6.5 GIÂY':'TẠM DỪNG · ĐIỀU KHIỂN THỦ CÔNG';}
$('play').addEventListener('click',()=>{state.playing=!state.playing;state.time=Math.acos(1-2*state.u)*6.5/(2*Math.PI);updateButtons()});
$('squat').addEventListener('input',e=>{state.playing=false;state.target=Number(e.target.value);state.u=state.target;updateButtons();updateUI(solve(state.u));});
$('speed').addEventListener('input',e=>{state.speed=Number(e.target.value);$('speedValue').textContent=fmt(state.speed)+'×'});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
  const a=b.dataset.action;
  if(a==='squat'||a==='stand'){state.playing=false;state.target=a==='squat'?1:0;updateButtons();setActive('[data-action="squat"],[data-action="stand"]',a);}
  if(a==='com'){state.com=!state.com;b.textContent=state.com?'TRỌNG TÂM: BẬT':'TRỌNG TÂM: TẮT';b.classList.toggle('active',state.com)}
  if(a==='orbit'){state.orbit=!state.orbit;b.classList.toggle('active',state.orbit)}
}));
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Space'){e.preventDefault();$('play').click()}if(e.key.toLowerCase()==='r'){state.playing=false;state.target=0;setView('perspective');setMode('solid');updateButtons()}});
try {init3d();}catch(e){console.error(e);$('loader').classList.add('err');$('loader').innerHTML='KHÔNG THỂ KHỞI TẠO WEBGL<small>Kiểm tra hỗ trợ WebGL 2 và trình duyệt. Mở trang qua HTTPS hoặc sử dụng bản HTML được bundle.</small>';}
let last=performance.now(),uiElapsed=0;
function animate(now){requestAnimationFrame(animate);if(!renderer)return;const dt=Math.min(.06,(now-last)/1000);last=now;
  if(state.playing){state.time+=dt*state.speed;state.u=(1-Math.cos(2*Math.PI*state.time/6.5))/2;}else state.u=THREE.MathUtils.damp(state.u,state.target,7,dt);
  if(state.orbit)cameraGoal.theta+=dt*.22;
  for(const key of ['theta','phi','radius','targetY'])cameraNow[key]=THREE.MathUtils.damp(cameraNow[key],cameraGoal[key],4.7,dt);
  const theta=cameraNow.theta,phi=cameraNow.phi,r=cameraNow.radius;
  const target=new THREE.Vector3(0,cameraNow.targetY,0);
  camera.position.set(Math.sin(theta)*Math.sin(phi)*r+target.x,Math.cos(phi)*r+target.y,Math.cos(theta)*Math.sin(phi)*r+target.z);
  camera.lookAt(target);
  const m=solve(state.u);pose(m);uiElapsed+=dt;if(uiElapsed>.07){updateUI(m);uiElapsed=0;}
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);