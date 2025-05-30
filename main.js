"use strict"
const vida = document.getElementById("vida");
const startBtn = document.getElementById("start-button");
const playBtn = document.getElementById("play-btn");
const restartBtn = document.querySelectorAll(".restart-btn");
const lobbyBtn = document.querySelectorAll(".lobby-btn");
const difficulty = document.getElementById("diff");
const scoreDiv = document.getElementById('score');
const timeDiv = document.getElementById('limit-time');

let timeoutEnemiesId;
let timeoutBonusId;
let intervalTime;
let tiempoTotal = 3 ;
let animations = [];
let warrior = new Warrior();
let isStarted = false;
let isPaused = false;
let isJumping = false;
let isBlinking = false; // Variable para controlar el parpadeo del personaje al recibir daño
let colisionaron = false;
let bonusList = [];
let score = 0;
let enemigos = [];
let settings = [
	{
		'difficult' : 'easy',
		'lives' : 6,
		'timeSpawnEnemiesMin': 3,
		'timeSpawnEnemiesMax': 5,
		'timeSpawnBonus': 8,
		'timeSpawnLive': 12
	},
	{
		'difficult' : 'medium',
		'lives' : 4,
		'timeSpawnEnemiesMin': 2,
		'timeSpawnEnemiesMax': 4,
		'timeSpawnBonus': 14,
		'timeSpawnLive': 17
	},
	{
		'difficult' : 'hard',
		'lives' : 2,
		'timeSpawnEnemiesMin': 1,
		'timeSpawnEnemiesMax': 2,
		'timeSpawnBonus': 18,
		'timeSpawnLive': 25
	}
]

// Default settings para el juego
let timeSpawnEnemiesMin = settings[0].timeSpawnEnemiesMin;
let timeSpawnEnemiesMax = settings[0].timeSpawnEnemiesMax;
let timeSpawnBonus = settings[0].timeSpawnBonus;
let timeSpawnLive = settings[0].timeSpawnLive;
let live = settings[0].lives;
scoreDiv.innerHTML = `Score: ${score}`;
timeDiv.innerHTML = `Tiempo Restante: 3min 00s`;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// EVENTOS 
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

document.addEventListener('keydown', (e) => {
	if(e.key.toUpperCase() === 'ESCAPE') {
		if(!isJumping && !isBlinking) {
			e.preventDefault(); // Evita el comportamiento por defecto del ESC
			pauseGame(); // Pausa el juego si no está saltando ni recibiendo daño. Evita errores en la animacion.
		}				 // Hasta que sepa la solucion al problema
	}
	
	if(isPaused) return; //Mientras el juego esté pausado, no se ejecuta ningun evento keydown
	

	if(e.key.toUpperCase() === 'W' || e.key === ' '){
		if(!isStarted) {
			startGame(); // Inicia el juego si no ha comenzado
			return; // Evita que se ejecute el salto inmediatamente después de iniciar
		}
		if(!isJumping) {
			isJumping = true; // variable para evitar que se pause el juego mientras se salta. Evita errores de animación
			warrior.saltar();
			setTimeout(() => {
				isJumping = false;
				warrior.correr(); //Luego de que termine de saltar, vuelve a correr
			}, 800);
		}
	}
});

startBtn.addEventListener('click', startGame); // Iniciar el juego mediante el boton de inicio principal o el de pausa
playBtn.addEventListener('click', reanudarGame);

for (const lobbBtn of lobbyBtn)
	lobbBtn.addEventListener('click', goToLobby);

for (const restBtn of restartBtn) {
	restBtn.addEventListener('click', restartGame); // Reiniciar el juego desde el menu de pausa o cuando se muere 
													// el personaje
}

difficulty.addEventListener("change", () => {
	switch(difficulty.value) {
		case 'easy': {
			live = settings[0].lives;
			vida.style.width = (42 * settings[0].lives) + 'px';
			timeSpawnEnemiesMin = settings[0].timeSpawnEnemiesMin;
			timeSpawnEnemiesMax = settings[0].timeSpawnEnemiesMax;
			timeSpawnBonus = settings[0].timeSpawnBonus;
			timeSpawnLive = settings[0].timeSpawnLive;
			
		};break;
		case 'medium': {
			live = settings[1].lives;
			vida.style.width = (42 * settings[1].lives) + 'px';
			timeSpawnEnemiesMin = settings[1].timeSpawnEnemiesMin;
			timeSpawnEnemiesMax = settings[1].timeSpawnEnemiesMax;
			timeSpawnBonus = settings[1].timeSpawnBonus;
			timeSpawnLive = settings[1].timeSpawnLive;
		};break;
		case 'hard': {
			live = settings[2].lives;
			vida.style.width = (42 * settings[2].lives) + 'px';
			timeSpawnEnemiesMin = settings[2].timeSpawnEnemiesMin;
			timeSpawnEnemiesMax = settings[2].timeSpawnEnemiesMax;
			timeSpawnBonus = settings[2].timeSpawnBonus;
			timeSpawnLive = settings[2].timeSpawnLive;
		};break;
	}
})
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Funciones de inicio del juego
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Funcion para iniciar el juego
function startGame() {
	document.getElementById('music-bg').play();
	document.getElementById('music-bg').volume = 0.3;
	isPaused = false;
	isStarted = true;
	generarEnemigo(timeSpawnEnemiesMin, timeSpawnEnemiesMax);
	spawnBonus(timeSpawnBonus);
	restarTiempo();
	document.getElementById('menu').style.display = "none";
	gameLoop();
}

// Funcion para reanudar el juego
function reanudarGame() {
	isPaused = false;
	isStarted = true;
	document.getElementById('music-bg').play();
	reanudarAnimaciones();
	timeoutEnemiesId = setTimeout(() => {
		generarEnemigo(timeSpawnEnemiesMin, timeSpawnEnemiesMax);
	}, 1000);
	timeoutBonusId = setTimeout(() => {
		spawnBonus(timeSpawnBonus);
	}, 3000);
	restarTiempo();
	gameLoop();
	document.getElementById('pausa').style.display = "none";
}

// Funcion para pausar el juego
function pauseGame() {
	if(!isStarted) 
		return; // Si el juego no ha comenzado, no hacer nada
	document.getElementById('music-bg').pause();
	document.getElementById("pausa").style.display = "block";
	pausarAnimaciones();
	clearTimeout(timeoutEnemiesId);
	clearTimeout(timeoutBonusId);
	clearInterval(intervalTime);
	intervalTime = null;
	
	isPaused = true;
	isStarted= false;
}

// Funcion para reiniciar el juego
function restartGame() {
	reestablecerConfiguracion();
	// Iniciar el juego nuevamente
	startGame();
}

// Funcion para volver al menu principal
function goToLobby() {
	reestablecerConfiguracion();
	// Mostrar menu principal
	timeDiv.innerHTML = `Tiempo Restante: 3min 00s`;
	document.getElementById("menu").style.display = 'block';
}

// Funcion que reestablece la configuracion del juego (vidas, animaciones, bonus, enemigos, puntaje)
function reestablecerConfiguracion() {
	reanudarAnimaciones();
	tiempoTotal = 3 * 60;
	intervalTime = null;

	// Eliminar TODOS los enemigos de la pantalla
	eliminarTodosLosEnemigos();
	eliminarTodosLosBonus();

	// Resetear el array de enemigos
	enemigos = [];
	bonusList = [];

	// Resetear la vida del personaje y el puntaje
	vida.style.width = 42 * live + 'px';
	scoreDiv.innerHTML = 'Score: 0';
	score = 0;

	// Ocultar pantalla de muerte y pausa
	document.getElementById("muerte").style.display = "none";
	document.getElementById("pausa").style.display = "none";
	document.getElementById("gano").style.display = "none";
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Funciones de administracion del juego
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Funcion para verificar si dos objetos estan chocando
function verificarColision(warrior, enemigo) {
  return !(warrior.right < enemigo.left ||
		   warrior.left > enemigo.right || 
		   warrior.bottom < enemigo.top || 
		   warrior.top > enemigo.bottom ) // No hay colisión
}

function restarTiempo() {
	if(intervalTime) return;
	intervalTime = setInterval(() => {
      const minutos = Math.floor(tiempoTotal / 60);
      const segundos = tiempoTotal % 60;

      // Mostrar formato: Xmin YYs
      timeDiv.innerHTML = `Tiempo Restante: ${minutos}min ${segundos.toString().padStart(2, '0')}s`;

      tiempoTotal--;

      if (tiempoTotal < 0) {
        clearInterval(intervalTime);
        document.getElementById('gano').style.display = 'block';
		document.getElementById('player-scored').innerHTML += ` <strong>${score} puntos</strong>!`
		isStarted = false;
		pausarAnimaciones();
		clearTimeout(timeoutEnemiesId);
		clearTimeout(timeoutBonusId);
      }
    }, 1000);
}

// Funcion principal del juego, va verificando el estado del juego (si el personaje choco con un enemigo, agarro una vida,
																// obtuvo un bonus, murio, gano, perdio, etc)
function gameLoop() {
	if(!isStarted || isPaused) {
		return; // Si el juego no ha comenzado, no hacer nada
	}
	actualizarEstadoJuego();
	
	limpiarEnemigosFueraDePantalla();
	limpiarBonusFueraDePantalla();
	requestAnimationFrame(gameLoop);
}

// Funcion que actualiza las configuraciones y el estado del juego (restarle una vida al personaje, sumarle puntaje,etc)
function actualizarEstadoJuego() {
	if(enemigos.length > 0) {
		if(verificarColision(warrior.status(), enemigos[0].status()) && vida.getBoundingClientRect().width > 42) {
			if(!colisionaron && !isBlinking) {
				restarVida();
			}
		}
		else if(verificarColision(warrior.status(), enemigos[0].status()) && vida.getBoundingClientRect().width <= 42) {
			if(!colisionaron && !isBlinking) {
				muerteWarrior();
			}
		} else {
			colisionaron = false;
		}
	}
	if(bonusList.length > 0) {
		if(verificarColision(warrior.status(), bonusList[0].status())) {
			
			if(!colisionaron) {
				incrementarPuntuacion();
				if(score == 10) {
					isStarted = false;
					clearInterval(intervalTime);
					clearTimeout(timeoutEnemiesId);
					clearTimeout(timeoutBonusId);
					document.getElementById('gano').style.display = 'block';
					document.getElementById('player-scored').innerHTML += ` ${score} puntos!.`
				}
			}
		}
	} else {
		colisionaron = false;
	}
}

// Funcion para restarle una vida al personaje
function restarVida() {
	warrior.perderVida();
	document.getElementById('sound-hit').play();
	if(score > 0) {
		score -= 10;
		scoreDiv.innerHTML = `Score: ${score}`;
	}
	vida.style.width = vida.getBoundingClientRect().width - 42 + "px";
	isBlinking = true;
	setTimeout(() => {
		isBlinking = false; 
	}, 1500);
	colisionaron = true;
}

// Funcion para cuando muere el personaje
function muerteWarrior() {
	warrior.morir();
	isStarted = false;
	pausarEscenario();

	document.getAnimations()[5].onfinish = () => {
		document.getElementById("muerte").style.display = "block";
		document.getAnimations()[5].pause();
	};
	clearTimeout(timeoutEnemiesId);
	clearTimeout(timeoutBonusId);
	clearInterval(intervalTime);
	vida.style.width = vida.getBoundingClientRect().width - 42 + "px";
}

// Funcion para incrementar los puntos
function incrementarPuntuacion() {
	document.getElementById('contenedor').removeChild(document.querySelector('.bonus'));
	bonusList.shift();
	score+= 10;
	document.getElementById('music-bonus').play();
	scoreDiv.innerHTML = `Score: ${score}`;
	colisionaron = true;
}
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Funciones complementarias
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Funcion para generar los bonus de puntaje. El intervalo de tiempo que tardan, lo decide la dificultad.
function spawnBonus(timeSpawnBonus) {
	if(isPaused) return;

	let bonus = new Bonus();
	
	let bottom = Math.random() * (30 - 20 + 1) + 20;
	bonusList.push(bonus);
	let bonusdiv = document.querySelector('.bonus');
	bonusdiv.setAttribute('style', `bottom:${bottom}%`);
	
	timeoutBonusId = setTimeout(() => {
		spawnBonus(timeSpawnBonus);
	}, timeSpawnBonus*1000);
}

// Funcion para generar enemigos aleatoriamente en la pantalla
function generarEnemigo(timeSpawnEnemiesMin, timeSpawnEnemiesMax) {
	if(isPaused) return;

	let enemigo = new Worm();
	// El tiempo de generacion de enemigos lo decide la dificultad
	let time = Math.floor(Math.random() * (timeSpawnEnemiesMax - timeSpawnEnemiesMin + 1)) + timeSpawnEnemiesMin; 
	enemigos.push(enemigo);					
	timeoutEnemiesId = setTimeout(() => {
		generarEnemigo(timeSpawnEnemiesMin, timeSpawnEnemiesMax);
	}, 1000*time);
	
}

// Funcion que pausa el escenario, utilizada cuando muere el personaje
function pausarEscenario() { 
	for(let animation of document.getAnimations()) {
		if(animation.animationName == 'sky' || animation.animationName == 'floor') {
			animation.pause();
		}
	}
}

// Funcion para pausar todas las animaciones, utilizada cuando se pone en pausa el juego 
function pausarAnimaciones() { 
	for(let animation of document.getAnimations()) {
		animation.pause();
	}
}
// Funcion que reanuda todas las animaciones, se usa cuando se da inicio, se saca la pausa o se reinicia el juego
function reanudarAnimaciones() { 
	for(let anim of document.getAnimations()) { 
		anim.play();
	}
} 

// Función que solo elimina enemigos fuera de pantalla
function limpiarEnemigosFueraDePantalla() {
	for (let i = 0; i < enemigos.length; i++) {
		let enemigo = enemigos[0];
		if (enemigo.status().x < 0) {
			// Elimino el enemigo del DOM
			document.getElementById("contenedor").removeChild(document.querySelector(".enemigo"));
			// También lo remuevo del array de enemigos
			enemigos.shift();
		}
	}
}

//Funcion para eliminar los bonus que esten fuera de la pantalla
function limpiarBonusFueraDePantalla() {
	for (let i = 0; i < bonusList.length; i++) {
		
		let bonus = bonusList[0];
		if (bonus.status().x < 0) {
			// Elimino el bonus del DOM
			document.getElementById("contenedor").removeChild(document.querySelector('.bonus'));
			// También lo remuevo del array de bonus
			bonusList.shift();
		}
	}
}

// Funcion que elimina todos los enemigos del DOM y del array. Se utiliza cuando se reinicia el juego
function eliminarTodosLosEnemigos() {
	const enemigosElements = document.getElementsByClassName("enemigo");
	// Usar un bucle hacia atrás para evitar problemas al eliminar elementos
	for (let i = enemigosElements.length - 1; i >= 0; i--) {
		const enemigo = enemigosElements[i];
		if (enemigo.parentNode) {
			enemigo.parentNode.removeChild(enemigo);
		}
	}
}

// Funcion para eliminar todos los bonus, usada cuando se reinicia el juego.
function eliminarTodosLosBonus() {
	for (let i = 0; i < bonusList.length; i++) {
		if (document.body.contains(document.querySelector('.bonus'))) {
			document.getElementById('contenedor').removeChild(document.querySelector('.bonus'));
		}
	}
}
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
