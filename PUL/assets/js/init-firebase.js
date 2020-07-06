// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCEyIwmqaLuuIg3Dgjp6Epq65EYotzgQv0",
    authDomain: "pululima-8c7b2.firebaseapp.com",
    databaseURL: "https://pululima-8c7b2.firebaseio.com",
    projectId: "pululima-8c7b2",
    storageBucket: "pululima-8c7b2.appspot.com",
    messagingSenderId: "779663236724",
    appId: "1:779663236724:web:271003faecf25ac8cc7b21",
    measurementId: "G-TT9VVD2EBB"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
//db.settings({ timestampsInSnapshots: true });