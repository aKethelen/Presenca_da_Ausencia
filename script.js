// Configuração do Firebase fornecida
const firebaseConfig = {
  apiKey: "AIzaSyDf9SFf0tD9I9E_AfHQjUUWOV7UzhQ3SRM",
  authDomain: "presencadaausencia-6f62a.firebaseapp.com",
  databaseURL: "https://presencadaausencia-6f62a-default-rtdb.firebaseio.com",
  projectId: "presencadaausencia-6f62a",
  storageBucket: "presencadaausencia-6f62a.firebasestorage.app",
  messagingSenderId: "7198133314",
  appId: "1:7198133314:web:60a4c98e2e2cdcf7bdf1db",
  measurementId: "G-RCLPMZKBZC"
};

// Importando funções necessárias do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const estrelasRef = ref(db, 'estrelas');

let palavras = [];
let offsetX = 0;
let offsetY = 0;

// Navegação Imersiva (Mantida conforme seu código original)
document.addEventListener('mousemove', (e) => {
    if (!document.querySelector('.universe-body')) return;
    offsetX = (e.clientX / window.innerWidth - 0.5) * 30;
    offsetY = (e.clientY / window.innerHeight - 0.5) * 30;
    
    document.getElementById('universo-container').style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    document.querySelector('.universe-body').style.backgroundPosition = `${50 + offsetX/5}% ${50 + offsetY/5}%`;
});

// Função Enviar (Agora salva no Firebase em vez do localStorage)
window.enviar = function() {
    let input = document.getElementById("palavra");
    let palavra = input.value.trim().toUpperCase();
    
    if (palavra === "") return;

    let novaEstrela = {
        texto: palavra,
        x: (Math.random() * 0.8 + 0.1).toFixed(4), 
        y: (Math.random() * 0.8 + 0.1).toFixed(4),
        timestamp: Date.now() // Útil para ordem das linhas
    };

    push(estrelasRef, novaEstrela); // Envia para o banco coletivo
    document.getElementById("msg").innerText = "Sua estrela subiu ao céu! ✨";
    input.value = "";
};

// Carregar Universo em tempo real (Escuta mudanças no Firebase)
window.carregarUniverso = function() {
    const container = document.getElementById("universo-container");
    const canvas = document.getElementById("linhas");
    if(!container || !canvas) return;

    onValue(estrelasRef, (snapshot) => {
        const data = snapshot.val();
        container.innerHTML = "";
        let pontos = [];

        if (data) {
            // Converte o objeto do Firebase em array e ordena por tempo
            palavras = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);

            palavras.forEach(p => {
                const xPos = p.x * window.innerWidth;
                const yPos = p.y * window.innerHeight;
                
                const wrapper = document.createElement("div");
                wrapper.className = "star-container";
                wrapper.style.left = xPos + "px";
                wrapper.style.top = yPos + "px";

                wrapper.innerHTML = `
                    <div class="star-shape"></div>
                    <div class="star-text">${p.texto}</div>
                `;
                
                container.appendChild(wrapper);
                pontos.push({x: xPos, y: yPos});
            });
            desenharLinhas(pontos, canvas);
        }
    });
};

// Desenho das Linhas Interligadas
function desenharLinhas(pontos, canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (pontos.length > 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pontos[0].x, pontos[0].y);
        for(let i = 1; i < pontos.length; i++) {
            ctx.lineTo(pontos[i].x, pontos[i].y);
        }
        ctx.stroke();
    }
}

// Instruções do Console adaptadas para Firebase
window.zerarCeu = function() {
    if (confirm("Tem certeza que deseja apagar o céu coletivo?")) {
        remove(estrelasRef);
        location.reload();
    }
};

// Inicialização automática se estiver na página do universo
if (document.getElementById("universo-container")) {
    window.carregarUniverso();
}

window.addEventListener('resize', () => {
    if (document.getElementById("universo-container")) carregarUniverso();
});