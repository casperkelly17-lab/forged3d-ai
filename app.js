import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
const host=document.querySelector('#canvas'),status=document.querySelector('#status'),exportBtn=document.querySelector('#stl');
const scene=new THREE.Scene();scene.background=new THREE.Color('#12161c');
const camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.set(4,3.5,5);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
scene.add(new THREE.HemisphereLight(0xffffff,0x343b48,2));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(4,8,5);scene.add(light);
const grid=new THREE.GridHelper(8,24,0x39414c,0x242a33);scene.add(grid);
let model=null;
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();
function material(){return new THREE.MeshStandardMaterial({color:0xff713c,metalness:.25,roughness:.38})}
function addMesh(geo,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material());m.position.set(x,y,z);scene.add(m);return m}
function create(shape){
 if(model){scene.remove(model);model=null}
 const group=new THREE.Group();scene.add(group);
 const mat=material();
 const mesh=(g,x=0,y=0,z=0)=>{let m=new THREE.Mesh(g,mat);m.position.set(x,y,z);group.add(m);return m};
 if(shape==='hat'){
   mesh(new THREE.CylinderGeometry(1.7,1.7,.12,64),0,0,0);
   mesh(new CylinderGeometrySafe(0.72,0.9,.65,48),0,.35,0);
   mesh(new THREE.SphereGeometry(.76,32,16,0,Math.PI*2,0,Math.PI/2),0,.68,0).scale.y=.24;
 }else if(shape==='cup'){
   mesh(new THREE.CylinderGeometry(.8,.65,1.8,48,1,true),0,.9,0);
   mesh(new THREE.TorusGeometry(.8,.06,12,48),0,1.8,0).rotation.x=Math.PI/2;
   mesh(new THREE.TorusGeometry(.48,.12,12,32),1,1,0).rotation.y=Math.PI/2;
 }else if(shape==='gear'){
   mesh(new THREE.CylinderGeometry(1,.9,.35,12),0,.2,0);
   mesh(new THREE.CylinderGeometry(.35,.35,.5,32),0,.2,0);
   for(let i=0;i<12;i++){let a=i*Math.PI/6;mesh(new THREE.BoxGeometry(.35,.35,.35),Math.cos(a)*1.05,.2,Math.sin(a)*1.05)}
 }else mesh(new THREE.BoxGeometry(1.6,1.6,1.6));
 model=group;exportBtn.disabled=false;status.textContent='PREVIEW READY';fitModel();
}
function CylinderGeometrySafe(a,b,h,n){return new THREE.CylinderGeometry(a,b,h,n)}
function fitModel(){const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());model.position.sub(center);camera.position.set(3,2.5,4);controls.target.set(0,0,0);controls.update()}
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();
document.querySelector('#generate').onclick=()=>{let p=document.querySelector('#prompt').value.toLowerCase();let s=p.includes('hat')?'hat':p.includes('cup')?'cup':p.includes('gear')?'gear':'cube';create(s);status.textContent='DEMO SHAPE · '+s.toUpperCase()};
document.querySelectorAll('[data-shape]').forEach(b=>b.onclick=()=>{document.querySelector('#prompt').value=b.dataset.shape==='hat'?'Cowboy hat':b.dataset.shape;create(b.dataset.shape)});
document.querySelector('#clear').onclick=()=>{if(model)scene.remove(model);model=null;exportBtn.disabled=true;document.querySelector('#prompt').value='';status.textContent='READY'};
exportBtn.onclick=()=>{if(!model)return;const exporter=new STLExporter();const data=exporter.parse(model,{binary:true});const blob=new Blob([data],{type:'application/octet-stream'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='forge3d-model.stl';a.click();URL.revokeObjectURL(a.href)};
create('hat');
