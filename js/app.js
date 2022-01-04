//Objeto mapa que contiene informacion relacionada con el tamaño y los obstaculos del planeta
const map = {
    rows: 15,
    columns: 15,
    aMap: [],
	totalObstacles: 30,
    obstaclesFound: 0,
	totalRocks: 8,
	totalArtifacts: 8,
	totalLogs: 8,
	totalCactus: 8,
}

//Objeto celda que contiene informacion relacionada con la celda
function Cell(posX, posY) {
	this.posX = posX;
	this.posY = posY;
	this.container = null;
	this.obstacle = 'ground';
	this.fog = null;
	this.obstacleImg = '../images/Ground_Tile_01_C.png';
	this.obstacleElement = null;
	this.explored = false;

	this.exploreCell = function(){
		this.fog.classList.add("d-none");
		this.explored = true;
		if(this.obstacleElement != null){
			this.obstacleElement.classList.add("obstacle");
			this.obstacleElement.classList.remove("d-none");
		}
	}	
}

//Objeto rover que contiene informacion relacionada con el rover
function Rover(posX, posY) {
	this.posX = posX;
	this.posY = posY;
	this.cell = null;
	this.imgElement = null;
	this.imgSrc = '../images/Rover.png'; 

	//Girar la orientacion del rover segun la direccion
	this.lookAt = function(directionX, directionY) {
		if(this.imgElement != null){

			if(directionX != 0){
				switch (directionX) {
					case -1:
						this.imgElement.className = "rover-left";
						break;
					case 1:
						this.imgElement.className = "rover-right";
						break;
					default:
						break;
				}
			}else{
				switch (directionY) {
					case -1:
						this.imgElement.className = "rover-up";
						break;
					case 1:
						this.imgElement.className = "rover-down";
						break;
					default:
						break;
				}
			}			
		}
	};
}

//Elementos html
let mapContainer;
let movSequence;
let obstacleCard;
let obstacleName;
let obstacleImg;

//Variables para el movimiento del rover
let rover;
let movementSeq = [];
let assumedPos = [];
let destinationCells = [];

//Inicio de la mision, preparando el escenario desde 0
launch();

//Funcion para iniciar y reiniciar la mision
function launch(){

	//Inicializacion de variables
	mapContainer = document.querySelector("#map");
	movSequence = document.getElementById('movement-sequence');
	obstacleCard = document.getElementById('obstacle').getElementsByClassName("card")[0];
	obstacleName = document.getElementById('obstacle').getElementsByClassName("obstacle-name")[0];
	obstacleImg = document.getElementById('obstacle-image');
	movementSeq = [];
	assumedPos = [];
	destinationCells = [];

	//Borrar mapa
	while (mapContainer.firstChild) {
        mapContainer.removeChild(mapContainer.firstChild);
    }

	//Borrar flechas movimiento
	let imagesMov = movSequence.getElementsByTagName("img");
	for (let i = 0; i < imagesMov.length; i++) {
		imagesMov[i].classList.add("d-none");	
	}

	//Reiniciar obstaculo encontrado
	obstacleCard.classList.remove("card-highlight");
	obstacleImg.src = "../images/Ground_Tile_01_C.png";
	obstacleName.innerHTML = "Move to find obstacles";

	//Instancia de un objeto rover en el centro del mapa del planeta
	rover = new Rover(Math.floor(map.rows / 2), Math.floor(map.columns / 2));

	createEmptyMap();
	placeObstacles();
	drawMap(map.rows, map.columns);

	destinationCells = [rover.cell];
}

/*************************************** MOVIMIENTO DEL ROVER *******************************************/
//Almacenar la secuencia de movimientos seleccionados
function addMovement(x, y){
	//El maximo de movimientos encadenados es de 6
	if(movementSeq.length > 5){
		return;
	}

	//Se asegura de obtener valores unitarios como direccion (-1, 0, 1) y se añaden al array de secuencias 
	const mov = [Math.sign(x), Math.sign(y)];

	//Calculo de nueva posicion
	const currentCell = destinationCells[destinationCells.length - 1];
	const newPosX = currentCell.posX + mov[0];
	const newPosY = currentCell.posY + mov[1];

	//Supuesta celda de destino
	const destinationCell = map.aMap[newPosY][newPosX];

	//Si se sale del mapa que no haga nada
	if(newPosX < 0 || newPosY < 0 || newPosX >= map.columns || newPosY >= map.rows){
		return;
	}

	//No se puede marcar la posicion actual como objetivo
	if(newPosX == rover.posX && newPosY == rover.posY){
		return;
	}

	//No se puede volver hacia una celda ya marcada
	if(destinationCell.container.classList.contains("highlight")){
		return;
	}

	//No se puede marcar un obstaculo descubierto para pasar por encima
	if(destinationCell.explored == true && destinationCell.obstacle != "ground"){
		return;
	}


	//Clase para mostrar las flechas en la secuencia de movimientos seleccionados
	let movClass = '';

	if(x != 0){
		switch (x) {
			case -1:
				movClass = 'arrow-left';
				break;
			case 1:
				movClass = 'arrow-right';
				break;
			default:
				break;
		}
	}else{
		switch (y) {
			case -1:
				movClass = 'arrow-up';
				break;
			case 1:
				movClass = 'arrow-down';
				break;
			default:
				break;
		}
	}

	//Se añade la clase de la flecha para mostrarla
	let imgArrow = movSequence.children.item(movementSeq.length).getElementsByTagName('img')
	imgArrow[0].className = movClass;

	//Se resaltan las celdas destino al movimiento propuesto
	destinationCell.container.classList.add("highlight");
	destinationCells.push(destinationCell);

	//Se añade el movimiento al array de secuencias
	movementSeq.push(mov);
}

//Borrar las secuencias de movimiento
function resetMovement(cell){
	//Se vacia el array de la secuencia de movimientos
	movementSeq = [];

	//Borrar indicaciones movimiento
	for (let i = 0; i < movSequence.children.length; i++) {
		movSequence.children.item(i).getElementsByTagName('img')[0].className = 'd-none';
	}

	//Borrar celdas resaltadas
	for (let i = 0; i < destinationCells.length; i++) {
		const element = destinationCells[i].container;	
		element.classList.remove("highlight");
	}

	//La celda actual es donde esta el rover
	destinationCells = [rover.cell];

	//Obstaculo encontrado
	if(cell != null){
		obstacleImg.src = cell.obstacleImg;
		obstacleName.innerHTML = cell.obstacle.toUpperCase();
		if(cell.obstacle != "ground"){
			obstacleCard.classList.add("card-highlight");
		}else{
			obstacleCard.classList.remove("card-highlight");
		}
	}
}

//Movimiento del rover
function moveRover(){

	let destination;
	//Se recorre el array de secuencia de movimientos para mover el rover
	for (let i = 0; i < movementSeq.length; i++) {
		//Se toman las coordenadas x,y del siguiente movimiento y se calcula la nueva posicion
		let x = movementSeq[i][0];
		let y = movementSeq[i][1];
		let newPosX = rover.posX + x;
		let newPosY = rover.posY + y;
		
		//Casilla de destino
		destination = map.aMap[newPosY][newPosX];
		destination.exploreCell();

		//El rover gira mirando a la casilla de destino
		rover.lookAt(newPosX - rover.posX, newPosY - rover.posY);

		//Si tiene un obstaculo
		if (destination.obstacle != "ground") {
			//Se reinicia el movimiento
			resetMovement(destination);
			return;
		}

		//Se definen las nuevas propiedades de posicion del rover 
		rover.posY = newPosY;
		rover.posX = newPosX;

		//La celda donde estaba el rover ya no tiene la clase "rover"
		rover.cell.container.classList.remove("rover");

		//Se define la nueva celda de destino, añadiendole la clase rover y moviendo la imagen
		rover.cell = map.aMap[rover.posY][rover.posX];
		rover.cell.container.classList.add("rover");
		rover.cell.container.appendChild(rover.imgElement);	
	}
	
	//Se reinicia el movimiento
	resetMovement(destination);
}

/*************************************** GENERACION DEL MAPA*******************************************/

//Se genera el contenido del mapa vacio (aMap) en el objeto mapa
function createEmptyMap(){
	//Se genera una matriz
    map.aMap = new Array(map.rows);
    for (let i = 0; i < map.rows; i++){
        map.aMap[i] = [];
		for (var j = 0; j < map.columns; j++) {
			//Se añade un objeto de celda para cada valor de la matriz, el cual incluye informacion sobre dicha celda
			let cell = new Cell(j, i);	
			map.aMap[i][j] = cell;
		}								
    }
}

//Se generan obstaculos aleatoriamente
function placeObstacles(){
	loopObstacle(map.totalRocks, "rock");
	loopObstacle(map.totalArtifacts, "artifact");
	loopObstacle(map.totalLogs, "log");
	loopObstacle(map.totalCactus, "cactus");
}

function loopObstacle(numObstacles, nameObstacle){
	let obstaclesPlaced = 0;
	while (obstaclesPlaced < numObstacles){
        //Numero aleatorio en el intervalo [0,rows - 1]
        let row = Math.floor(Math.random() * map.rows);
 
        //Numero aleatorio en el intervalo [0,columns - 1]
        let column = Math.floor(Math.random() * map.columns);
		
		//El centro del mapa no tiene obstaculo, ya que es donde empieza el rover
		if(row == rover.posY && column == rover.posX){
			continue;
		}

        //Si no hay un obstaculo en esa posicion, se añade uno
        if (map.aMap[row][column].obstacle == "ground"){
            map.aMap[row][column].obstacle = nameObstacle;
 
            //Se incrementa en uno los obstaculos generados
            obstaclesPlaced++;
        }
    }
}

//Se pinta el mapa con las dimensiones definidas, creando un div para cada casilla
function drawMap(numberOfRows, numberOfColumns){
    for(let x = 0; x < numberOfRows; x++){
        for(let y = 0; y < numberOfColumns; y++){
			//Se crea un div con los atributos informando de su coordenada en el mapa
            let newDiv = document.createElement("div");
			newDiv.setAttribute("class", "cell");
			newDiv.setAttribute("data-x", x);
			newDiv.setAttribute("data-y", y);

			//Se añade el nuevo div como hijo del elemento mapa
            mapContainer.appendChild(newDiv);

			//En la celda especifica se indica su elemento div
			let cell = map.aMap[x][y];
			cell.container = newDiv;

			//Se situa la niebla en la celda
			let fog = document.createElement("div");
			fog.classList.add("fog");
			cell.fog = fog; 
			newDiv.appendChild(fog);

			//El rover se situa en el centro al incio
			if(x == rover.posX && y == rover.posY){
				newDiv.classList.add("rover");
				let img = document.createElement("img");
				img.setAttribute("height", "100%");
    			img.src = rover.imgSrc; 
				newDiv.appendChild(img);

				rover.cell = cell;
				rover.imgElement = img;
				rover.lookAt(0,-1);

				//Se quita la niebla
				cell.fog.classList.add("d-none");
			}

			//Si la casilla está indicada como obstaculo se le añade la clase
			if((map.aMap[x][y].obstacle != 'ground')){
				let cellObs = map.aMap[x][y];
				switch (cellObs.obstacle) {
					case "rock":
						cellObs.obstacleImg = '../images/obstacles/rock.png';
						break;
					case "artifact":
						cellObs.obstacleImg = '../images/obstacles/artifact.png';
						break;
					case "log":
						cellObs.obstacleImg = '../images/obstacles/log.png';
						break;
					case "cactus":
						cellObs.obstacleImg = '../images/obstacles/cactus.png';
						break;
					default:
						break;
				}

				//Si hay imagen, se añade a la celda del obstaculo
				if(cellObs.obstacleImg != ''){
					let imgObs = document.createElement("img");
					imgObs.setAttribute("height", "100%");
					imgObs.classList.add("d-none");
					imgObs.src = cellObs.obstacleImg; 
					cellObs.obstacleElement = imgObs;
					newDiv.appendChild(imgObs);
				}
			}			
        }
    }
}
