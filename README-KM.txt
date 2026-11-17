BRAND 7 QR ORDERING - BUILD PACKAGE

មានក្នុងកញ្ចប់៖
- index.html, app.js, style.css: Web app
- firestore.rules: Firestore security rules សម្រាប់ Project brand7-qr-ordering
- manifest.webmanifest និង sw.js: PWA install support

អ្វីដែលមានក្នុងកូដ៖
- បង្ហាញម៉ឺនុយពី Firestore
- កន្ត្រក និងការបញ្ជូន Order ជាមួយលេខតុ និងកម្រិតហឹរ 1-7
- Admin sign-in និងពិនិត្យ UID + admins/{uid}.active == true
- Admin អាចបង្កើត/កែ/លុបមុខម្ហូប និងបង្ហោះរូបភាពពីទូរស័ព្ទ/កុំព្យូទ័រ
- Admin មើល Order និងប្ដូរស្ថានភាព
- បង្កើត QR ពី URL Website

ចំណាំសំខាន់៖
1. កូដមិនអាច Deploy ទៅ GitHub ឬ Firebase ជំនួសម្ចាស់គណនីបានទេ។
2. Firestore Rules ត្រូវបានរៀបចំក្នុង firestore.rules ប៉ុន្តែត្រូវ Publish ក្នុង Firebase Console មុនទទួលការកម្មង់ពិត។ កុំប្រើ Test mode ឬបើកសិទ្ធិទាំងអស់។
3. Admin UID ដែលបានកំណត់ក្នុងកូដ និង Rules៖ oTKEd5mIOcnCpwvcPHYnaET7TF2
4. រូបភាពត្រូវបានបង្រួម ហើយរក្សាទុកជា Base64 ក្នុង Firestore (អតិបរមាប្រហែល 470KB string)។ សម្រាប់ម៉ឺនុយធំ គួរប្ដូរទៅ Cloud Storage ដែលមាន billing/plan និង rules សមស្រប។
5. Telegram notification និង KHQR auto verification មិនទាន់ភ្ជាប់ក្នុង build នេះ។ ត្រូវការមុខងារ server-side/secret config និងព័ត៌មាន merchant ផ្លូវការ; កុំដាក់ Bot token ក្នុង app.js។
6. សូមរក្សាទុក logo.jpg ដើមនៅ root ជាមួយឯកសារទាំងនេះ។

ការដាក់ប្រើ៖ ជំនួស index.html, app.js, style.css ក្នុង GitHub root; បន្ថែម manifest.webmanifest និង sw.js; រក្សា logo.jpg។ បន្ទាប់មក Publish firestore.rules ក្នុង Firebase Console។
