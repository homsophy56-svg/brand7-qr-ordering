// 1) បំពេញ Firebase config ក្នុង firebaseConfig ខាងក្រោម
const firebaseConfig = {
  apiKey: "AIzaSyCbVkQZStUy59gmyfpTlp0PZWeBn-3F_Ts",
  authDomain: "brand7-qr-ordering.firebaseapp.com",
  projectId: "brand7-qr-ordering",
  appId: "1:752334682764:web:c3d246e2202faddef6d9a9"
};
const configured = firebaseConfig.apiKey !== "PASTE_API_KEY";
let db=null, auth=null, products=[], cart=[];
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString("en-US")+"៛";
if(configured){firebase.initializeApp(firebaseConfig);db=firebase.firestore();auth=firebase.auth();loadProducts();}
else {$("menu").innerHTML='<p class="muted">សូមភ្ជាប់ Firebase តាមសេចក្ដីណែនាំក្នុង README មុនពេលប្រើប្រាស់។</p>';products=demoProducts();renderMenu();}
function demoProducts(){return [
{id:"demo1",name:"មីហឹរកម្រិត ១",price:10000,category:"មីហឹរ",image:"",desc:"គំរូម៉ឺនុយ សូម Admin ប្ដូរទិន្នន័យ",available:true},
{id:"demo2",name:"មីហឹរកម្រិត ៧",price:15000,category:"មីហឹរ",image:"",desc:"ហឹរខ្លាំងបំផុត",available:true}
]}
async function loadProducts(){try{const s=await db.collection("products").get();products=s.docs.map(d=>({id:d.id,...d.data()}));renderMenu();renderCategories();}catch(e){$("menu").innerHTML='<p>មិនអាចទាញយកម៉ឺនុយបានទេ។ សូមពិនិត្យ Firebase Rules។</p>';}}
function renderCategories(){let cats=[...new Set(products.map(p=>p.category).filter(Boolean))];$("category").innerHTML='<option value="">គ្រប់ប្រភេទ</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("")}
function renderMenu(){let q=$("search").value.toLowerCase(),cat=$("category").value;let list=products.filter(p=>p.available!==false&&(!cat||p.category===cat)&&(!q||p.name.toLowerCase().includes(q)));$("menu").innerHTML=list.length?list.map(p=>`<article class="food"><img src="${esc(p.image||"")}" onerror="this.src='https://placehold.co/600x400/171717/ffffff?text=Brand+7'"><div class="food-body"><h3>${esc(p.name)}</h3><p>${esc(p.desc||p.category||"")}</p><div class="food-foot"><span class="price">${money(p.price)}</span><button class="primary" onclick="addCart('${p.id}')">+ បន្ថែម</button></div></div></article>`).join(""):'<p class="muted">មិនទាន់មានមុខម្ហូបក្នុងប្រភេទនេះទេ។</p>'}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
window.addCart=id=>{let p=products.find(x=>x.id===id);if(!p)return;let x=cart.find(x=>x.id===id);x?x.qty++:cart.push({...p,qty:1});renderCart()}
function renderCart(){$("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);$("cartItems").innerHTML=cart.map(x=>`<div class="cart-line"><span>${esc(x.name)}<br><small>${money(x.price)} × ${x.qty}</small></span><span><button onclick="qty('${x.id}',-1)">−</button> ${x.qty} <button onclick="qty('${x.id}',1)">+</button></span></div>`).join("");$("total").textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0))}
window.qty=(id,n)=>{let x=cart.find(x=>x.id===id);if(x){x.qty+=n;if(x.qty<=0)cart=cart.filter(y=>y.id!==id);renderCart()}}
function show(id){$(id).classList.remove("hidden");$("shade").classList.remove("hidden")}
function hideAll(){$("cartPanel").classList.add("hidden");$("adminPanel").classList.add("hidden");$("productDialog").classList.add("hidden");$("shade").classList.add("hidden")}
$("cartFab").onclick=()=>show("cartPanel");$("adminOpen").onclick=()=>show("adminPanel");document.querySelectorAll("[data-close]").forEach(b=>b.onclick=hideAll);$("shade").onclick=hideAll;
$("search").oninput=renderMenu;$("category").onchange=renderMenu;
$("sendOrder").onclick=async()=>{if(!cart.length)return alert("សូមជ្រើសរើសម្ហូបជាមុន");if(!$("tableNo").value.trim())return alert("សូមបញ្ចូលលេខតុ");if(!db)return alert("សូមភ្ជាប់ Firebase មុនពេលទទួល Order ពិត");let order={table:$("tableNo").value.trim(),items:cart.map(x=>({productId:x.id,name:x.name,price:x.price,qty:x.qty,subtotal:x.price*x.qty})),total:cart.reduce((a,x)=>a+x.price*x.qty,0),note:$("note").value,status:"new",createdAt:firebase.firestore.FieldValue.serverTimestamp()};try{await db.collection("orders").add(order);cart=[];renderCart();$("orderMessage").textContent="បានទទួលការកម្មង់! សូមរង់ចាំបុគ្គលិកបញ្ជាក់។";}catch(e){alert("ផ្ញើ Order មិនបានទេ៖ "+e.message)}};
$("loginBtn").onclick=async()=>{try{await auth.signInWithEmailAndPassword($("adminEmail").value,$("adminPassword").value)}catch(e){alert("ចូលមិនបាន៖ "+e.message)}};
if(auth)auth.onAuthStateChanged(u=>{if(u){$("loginBox").classList.add("hidden");$("adminTools").classList.remove("hidden");loadAdmin()}else{$("loginBox").classList.remove("hidden");$("adminTools").classList.add("hidden")}});
$("logoutBtn").onclick=()=>auth.signOut();
async function loadAdmin(){let [ps,os]=await Promise.all([db.collection("products").get(),db.collection("orders").orderBy("createdAt","desc").limit(30).get()]);products=ps.docs.map(d=>({id:d.id,...d.data()}));renderMenu();renderCategories();$("productsAdmin").innerHTML=products.map(p=>`<div class="admin-line"><span><b>${esc(p.name)}</b><br>${money(p.price)} · ${esc(p.category||"")}</span><span><button onclick="editProduct('${p.id}')">កែ</button> <button onclick="deleteProduct('${p.id}')">លុប</button></span></div>`).join("");$("orders").innerHTML=os.docs.map(d=>{let o=d.data();return `<div class="admin-line"><span><b>តុ ${esc(o.table)} · ${money(o.total)}</b><br>${o.items.map(i=>esc(i.name)+" × "+i.qty).join(", ")}<br><span class="status">ស្ថានភាព៖ ${esc(o.status)}</span></span><select onchange="setStatus('${d.id}',this.value)"><option value="new" ${o.status==="new"?"selected":""}>ថ្មី</option><option value="accepted">ទទួល Order</option><option value="cooking">កំពុងធ្វើ</option><option value="ready">រួចរាល់</option><option value="served">បានប្រគល់</option><option value="cancelled">បោះបង់</option></select></div>`}).join("")}
window.setStatus=async(id,status)=>{await db.collection("orders").doc(id).update({status});loadAdmin()};
$("newProduct").onclick=()=>openProduct();function openProduct(p={}){$("formTitle").textContent=p.id?"កែម្ហូប":"បន្ថែមមុខម្ហូប";$("pId").value=p.id||"";$("pName").value=p.name||"";$("pPrice").value=p.price||"";$("pCategory").value=p.category||"";$("pImage").value=p.image||"";$("pDesc").value=p.desc||"";$("pAvailable").checked=p.available!==false;show("productDialog")}
window.editProduct=id=>openProduct(products.find(p=>p.id===id));
$("saveProduct").onclick=async()=>{let p={name:$("pName").value.trim(),price:Number($("pPrice").value),category:$("pCategory").value.trim(),image:$("pImage").value.trim(),desc:$("pDesc").value.trim(),available:$("pAvailable").checked};if(!p.name||!p.price||!p.category)return alert("សូមបំពេញឈ្មោះ តម្លៃ និងប្រភេទ");try{let id=$("pId").value;if(id)await db.collection("products").doc(id).update(p);else await db.collection("products").add(p);hideAll();await loadAdmin()}catch(e){alert(e.message)}};
window.deleteProduct=async id=>{if(confirm("តើចង់លុបមុខម្ហូបនេះមែនទេ?")){await db.collection("products").doc(id).delete();loadAdmin()}};
$("makeQr").onclick=()=>{let url=$("siteUrl").value.trim();if(!url)return alert("សូមបញ្ចូល Website URL");$("qrResult").innerHTML=`<img class="qr" alt="QR Code" src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}"><p class="muted">បោះពុម្ព QR នេះដាក់លើតុ។</p>`};
