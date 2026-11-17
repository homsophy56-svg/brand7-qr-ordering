// Brand 7 QR Ordering — Firebase + direct photo upload (compressed into Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyCbVkQZStUy59gmyfpTlp0PZWeBn-3F_Ts",
  authDomain: "brand7-qr-ordering.firebaseapp.com",
  projectId: "brand7-qr-ordering",
  appId: "1:752334682764:web:c3d246e2202faddef6d9a9"
};
const configured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "PASTE_API_KEY";
let db=null, auth=null, products=[], cart=[], selectedImageData="";
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString("en-US")+"៛";
const ADMIN_UID = "oTFEkD5mIOcnCpwvcPHYnaET7TF2";

if(configured){
  if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  db=firebase.firestore(); auth=firebase.auth(); loadProducts();
}else{
  $("menu").innerHTML='<p class="muted">សូមភ្ជាប់ Firebase មុនពេលប្រើប្រាស់។</p>';
  products=demoProducts(); renderMenu();
}
function demoProducts(){return [
 {id:"demo1",name:"មីហឹរកម្រិត ១",price:10000,category:"មីហឹរ",image:"",desc:"គំរូម៉ឺនុយ",available:true},
 {id:"demo2",name:"មីហឹរកម្រិត ៧",price:15000,category:"មីហឹរ",image:"",desc:"ហឹរខ្លាំងបំផុត",available:true}
]}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function loadProducts(){
 try{const s=await db.collection("products").get();products=s.docs.map(d=>({id:d.id,...d.data()}));renderMenu();renderCategories();}
 catch(e){$("menu").innerHTML='<p>មិនអាចទាញយកម៉ឺនុយបានទេ៖ '+esc(e.message)+'</p>';}
}
function renderCategories(){let cats=[...new Set(products.map(p=>p.category).filter(Boolean))];$("category").innerHTML='<option value="">គ្រប់ប្រភេទ</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("")}
function renderMenu(){
 let q=$("search").value.toLowerCase(),cat=$("category").value;
 let list=products.filter(p=>p.available!==false&&(!cat||p.category===cat)&&(!q||String(p.name||"").toLowerCase().includes(q)));
 $("menu").innerHTML=list.length?list.map(p=>`<article class="food"><img src="${esc(p.image||"")}" onerror="this.src='https://placehold.co/600x400/171717/ffffff?text=Brand+7'"><div class="food-body"><h3>${esc(p.name)}</h3><p>${esc(p.desc||p.category||"")}</p><div class="food-foot"><span class="price">${money(p.price)}</span><button class="primary" onclick="addCart('${p.id}')">+ បន្ថែម</button></div></div></article>`).join(""):'<p class="muted">មិនទាន់មានមុខម្ហូបក្នុងប្រភេទនេះទេ។</p>';
}
window.addCart=id=>{let p=products.find(x=>x.id===id);if(!p)return;let x=cart.find(x=>x.id===id);x?x.qty++:cart.push({...p,qty:1});renderCart()};
function renderCart(){
 $("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
 $("cartItems").innerHTML=cart.map(x=>`<div class="cart-line"><span>${esc(x.name)}<br><small>${money(x.price)} × ${x.qty}</small></span><span><button onclick="qty('${x.id}',-1)">−</button> ${x.qty} <button onclick="qty('${x.id}',1)">+</button></span></div>`).join("");
 $("total").textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0));
}
window.qty=(id,n)=>{let x=cart.find(x=>x.id===id);if(x){x.qty+=n;if(x.qty<=0)cart=cart.filter(y=>y.id!==id);renderCart()}};
function show(id){$(id).classList.remove("hidden");$("shade").classList.remove("hidden")}
function hideAll(){$("cartPanel").classList.add("hidden");$("adminPanel").classList.add("hidden");$("productDialog").classList.add("hidden");$("shade").classList.add("hidden")}
$("cartFab").onclick=()=>show("cartPanel");$("adminOpen").onclick=()=>show("adminPanel");
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=hideAll);$("shade").onclick=hideAll;
$("search").oninput=renderMenu;$("category").onchange=renderMenu;

$("sendOrder").onclick=async()=>{
 if(!cart.length)return alert("សូមជ្រើសរើសម្ហូបជាមុន");
 if(!$("tableNo").value.trim())return alert("សូមបញ្ចូលលេខតុ");
 if(!db)return alert("សូមភ្ជាប់ Firebase មុនពេលទទួល Order ពិត");
 let order={table:$("tableNo").value.trim(),items:cart.map(x=>({productId:x.id,name:x.name,price:x.price,qty:x.qty,subtotal:x.price*x.qty})),total:cart.reduce((a,x)=>a+x.price*x.qty,0),note:$("note").value,status:"new",createdAt:firebase.firestore.FieldValue.serverTimestamp()};
 try{await db.collection("orders").add(order);cart=[];renderCart();$("orderMessage").textContent="បានទទួលការកម្មង់! សូមរង់ចាំបុគ្គលិកបញ្ជាក់។";}
 catch(e){alert("ផ្ញើ Order មិនបានទេ៖ "+e.message)}
};

$("loginBtn").onclick=async()=>{try{await auth.signInWithEmailAndPassword($("adminEmail").value,$("adminPassword").value)}catch(e){alert("ចូលមិនបាន៖ "+e.message)}};
if(auth)auth.onAuthStateChanged(async u=>{
 if(!u){$("loginBox").classList.remove("hidden");$("adminTools").classList.add("hidden");return;}
 $("loginBox").classList.add("hidden");
 try{
   // Confirm this signed-in account is the configured shop admin.
   if(ADMIN_UID && u.uid!==ADMIN_UID) throw new Error("គណនីនេះមិនមែនជា Admin ដែលបានកំណត់ទេ។");
   const a=await db.collection("admins").doc(u.uid).get();
   if(!a.exists || a.data().active!==true) throw new Error("មិនមានសិទ្ធិ Admin ឬ active មិនមែន true។");
   $("adminTools").classList.remove("hidden"); await loadAdmin();
 }catch(e){$("adminTools").classList.add("hidden");alert("មិនអាចបើក Admin បានទេ៖ "+e.message);}
});
$("logoutBtn").onclick=()=>auth.signOut();

async function loadAdmin(){
 try{
  const ps=await db.collection("products").get();
  products=ps.docs.map(d=>({id:d.id,...d.data()}));renderMenu();renderCategories();
  $("productsAdmin").innerHTML=products.map(p=>`<div class="admin-line"><span><b>${esc(p.name)}</b><br>${money(p.price)} · ${esc(p.category||"")}</span><span><button onclick="editProduct('${p.id}')">កែ</button> <button onclick="deleteProduct('${p.id}')">លុប</button></span></div>`).join("");
 }catch(e){$("productsAdmin").innerHTML='<p class="muted">អាន Products មិនបាន៖ '+esc(e.message)+'</p>';}
 try{
  const os=await db.collection("orders").orderBy("createdAt","desc").limit(30).get();
  $("orders").innerHTML=os.docs.map(d=>{let o=d.data();return `<div class="admin-line"><span><b>តុ ${esc(o.table)} · ${money(o.total)}</b><br>${(o.items||[]).map(i=>esc(i.name)+" × "+i.qty).join(", ")}<br><span class="status">ស្ថានភាព៖ ${esc(o.status)}</span></span><select onchange="setStatus('${d.id}',this.value)"><option value="new" ${o.status==="new"?"selected":""}>ថ្មី</option><option value="accepted">ទទួល Order</option><option value="cooking">កំពុងធ្វើ</option><option value="ready">រួចរាល់</option><option value="served">បានប្រគល់</option><option value="cancelled">បោះបង់</option></select></div>`}).join("");
 }catch(e){$("orders").innerHTML='<p class="muted">អាន Orders មិនបាន៖ '+esc(e.message)+'</p>';}
}
window.setStatus=async(id,status)=>{try{await db.collection("orders").doc(id).update({status});await loadAdmin()}catch(e){alert("ប្ដូរស្ថានភាពមិនបាន៖ "+e.message)}};

$("newProduct").onclick=()=>openProduct();
function resetImagePicker(){
 selectedImageData="";
 $("pImageFile").value="";
 $("pImagePreview").src="";
 $("pImagePreviewWrap").classList.add("hidden");
 $("removeImageBtn").classList.add("hidden");
}
function openProduct(p={}){
 $("formTitle").textContent=p.id?"កែម្ហូប":"បន្ថែមមុខម្ហូប";
 $("pId").value=p.id||"";$("pName").value=p.name||"";$("pPrice").value=p.price||"";
 $("pCategory").value=p.category||"";$("pDesc").value=p.desc||"";$("pAvailable").checked=p.available!==false;
 selectedImageData=p.image||"";
 $("pImageFile").value="";
 if(selectedImageData){$("pImagePreview").src=selectedImageData;$("pImagePreviewWrap").classList.remove("hidden");$("removeImageBtn").classList.remove("hidden");}
 else resetImagePicker();
 show("productDialog");
}
window.editProduct=id=>openProduct(products.find(p=>p.id===id));

$("pImageFile").onchange=async()=>{
 const file=$("pImageFile").files && $("pImageFile").files[0]; if(!file)return;
 if(!file.type.startsWith("image/")){alert("សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ។");$("pImageFile").value="";return;}
 try{
  selectedImageData=await compressImage(file);
  $("pImagePreview").src=selectedImageData;
  $("pImagePreviewWrap").classList.remove("hidden");
  $("removeImageBtn").classList.remove("hidden");
 }catch(e){selectedImageData="";alert("មិនអាចអានរូបភាពបានទេ៖ "+e.message);}
};
$("removeImageBtn").onclick=()=>{selectedImageData="";$("pImageFile").value="";$("pImagePreview").src="";$("pImagePreviewWrap").classList.add("hidden");$("removeImageBtn").classList.add("hidden");};
function compressImage(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("អានឯកសារមិនបាន"));
  reader.onload=()=>{
   const img=new Image();img.onerror=()=>reject(new Error("ឯកសាររូបភាពមិនត្រឹមត្រូវ"));
   img.onload=()=>{
    const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));
    const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    const ctx=canvas.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    let quality=.78,data=canvas.toDataURL("image/jpeg",quality);
    while(data.length>720000 && quality>.42){quality-=.08;data=canvas.toDataURL("image/jpeg",quality);}
    if(data.length>720000)return reject(new Error("រូបភាពនៅធំពេក។ សូមជ្រើសរូបតូចជាងនេះ។"));
    resolve(data);
   };
   img.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}

$("saveProduct").onclick=async()=>{
 const p={name:$("pName").value.trim(),price:Number($("pPrice").value),category:$("pCategory").value.trim(),image:selectedImageData,desc:$("pDesc").value.trim(),available:$("pAvailable").checked};
 if(!p.name||!p.price||!p.category)return alert("សូមបំពេញឈ្មោះ តម្លៃ និងប្រភេទ");
 const id=$("pId").value;
 try{
  $("saveProduct").disabled=true;$("saveProduct").textContent="កំពុងរក្សាទុក...";
  if(id) await db.collection("products").doc(id).update(p); else await db.collection("products").add(p);
  hideAll();await loadAdmin();alert("រក្សាទុកមុខម្ហូបបានជោគជ័យ។");
 }catch(e){alert("រក្សាទុកមិនបាន៖ "+e.message+"\nសូមពិនិត្យ Firestore Rules និងទំហំរូបភាព។");}
 finally{$("saveProduct").disabled=false;$("saveProduct").textContent="រក្សាទុក";}
};
window.deleteProduct=async id=>{
 if(confirm("តើចង់លុបមុខម្ហូបនេះមែនទេ?")){
  try{await db.collection("products").doc(id).delete();await loadAdmin();}
  catch(e){alert("លុបមិនបាន៖ "+e.message)}
 }
};
$("makeQr").onclick=()=>{
 let url=$("siteUrl").value.trim();if(!url)return alert("សូមបញ្ចូល Website URL");
 $("qrResult").innerHTML=`<img class="qr" alt="QR Code" src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}"><p class="muted">បោះពុម្ព QR នេះដាក់លើតុ។</p>`;
};
