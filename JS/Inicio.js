const titulo = document.getElementById("titulo");

let escala = 1;
let crecer = true;

setInterval(() => {
    if (crecer) 
    {
        escala += 0.02;
        if (escala >= 1.2) crecer = false;
    } 
    
    else 
    {
        escala -= 0.02;
        if (escala <= 1) crecer = true;
    }

    titulo.style.transform = `scale(${escala})`;
}, 30);