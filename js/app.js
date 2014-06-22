/*------------------------------------------------------------------------------*/
/* APP */
/*------------------------------------------------------------------------------*/
var appSokoban = angular.module('appSokoban', []);

/*------------------------------------------------------------------------------*/
/* CONTROLLER */
/*------------------------------------------------------------------------------*/
appSokoban.controller('ctrlSokoban', function($scope, $http) {
	
	// VARIABLES 
	
	$scope.casess = [[]];
	$scope.fileNames = [];
	for(var i=1; i<=7; i++)
		$scope.fileNames.push({file : 'grilles/grille-'+i+'.sok', title : 'Level '+i});
	$scope.level = $scope.fileNames[0]['file'];	
	$scope.coups = [];
	$scope.win = false;
	$scope.lost = false;
	
	// FONCTIONS

	// Crée et retourne une case à partir d'un caractère
	$scope.createCase = function(char) {		
		var uneCase = {
			terre : false,
			mur : false,
			bloc : false,
			socle : false,
			perso : false
		};		
		switch(char) {
			case '.' : 
				uneCase.terre = true;
			break;
			case '*' : 
				uneCase.mur = true;
			break;
			case '|' : 
				uneCase.terre = true;
				uneCase.bloc = true;
			break;
			case '_' : 
				uneCase.terre = true;
				uneCase.socle = true;
			break;
			case '§' : 
				uneCase.terre = true;
				uneCase.perso = true;
			break;
			case '#' : 
				uneCase.terre = true;
				uneCase.bloc = true;
				uneCase.socle = true;
			break;
			case '$' : 
				uneCase.terre = true;
				uneCase.bloc = true;
				uneCase.perso = true;
			break;
		}		
		return uneCase;
	};
	
	// Recrée la grille à partir d'un fichier
	$scope.createGrille = function(fileName) {
		$http.get(fileName).success(function(data) {
			var lignesText = data.split('\n');
			var uneGrille = [];
			for(var i=0; i<lignesText.length-1; i++) {
				 console.log("row	");
				var ligne = lignesText[i];
				var chars = ligne.split('');
				var uneLigne = [];
				for(var j=0; j<ligne.length-1; j++) {
					 console.log("column	");
					var char = ligne[j];
					var uneCase = $scope.createCase(char);
					uneLigne.push(uneCase);
				}
				uneGrille.push(uneLigne);
			}	
			$scope.casess = uneGrille;
			$scope.win=false;
			$scope.coups = [];
			$scope.win=false;
			$scope.lost=false;
		});
	};	
	
	// Retourne la position du personnage
	$scope.findPersoLocation = function() {
		var persoLocation = {
			x : 0,
			y : 0
		};
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				var uneCase = cases[j];
				if(uneCase.perso) {
					persoLocation = {
						x : j,
						y : i
					};
					return persoLocation;
				}
			}
		}
	};
	
	
	$scope.findNextCase = function(initialCase, direction) {
				
		var nextCase = {
			x : 0,
			y : 0
		};
		switch(direction) {
			case 'UP' :
				nextCase.x = initialCase.x;
				nextCase.y = Number(initialCase.y) - 1;
			break;
			case 'RIGHT' :
				nextCase.x = Number(initialCase.x) + 1;
				nextCase.y = initialCase.y;
			break;
			case 'DOWN' :
				nextCase.x = initialCase.x;
				nextCase.y = Number(initialCase.y) + 1;
			break;
			case 'LEFT' :
				nextCase.x = Number(initialCase.x) - 1;
				nextCase.y = initialCase.y;
			break;
		}
		
		return nextCase;
	};
	
	$scope.storeCoup = function(theCases) {
		if(theCases.length == 2) {				
			var coup = [
				{
					x : theCases[0].x,
					y : theCases[0].y
				},
				{
					x : theCases[1].x,
					y : theCases[1].y
				}
			];			
		} else {
			var coup = [
				{
					x : theCases[0].x,
					y : theCases[0].y
				},
				{
					x : theCases[1].x,
					y : theCases[1].y
				},
				{
					x : theCases[2].x,
					y : theCases[2].y
				}
			];			
		}		
		$scope.coups.push(coup);
	};
	
	$scope.undoMove = function() {		
		if($scope.coups.length==0)
			return;		
		var lastCoup = $scope.coups.pop();		
		if(lastCoup.length == 2) {			
			$scope.$apply($scope.casess[lastCoup[0].y][lastCoup[0].x]['perso']=true);
			$scope.$apply($scope.casess[lastCoup[1].y][lastCoup[1].x]['perso']=false);
		} else {
			$scope.$apply($scope.casess[lastCoup[0].y][lastCoup[0].x]['perso']=true);
			$scope.$apply($scope.casess[lastCoup[1].y][lastCoup[1].x]['perso']=false);				
			$scope.$apply($scope.casess[lastCoup[1].y][lastCoup[1].x]['bloc']=true);
			$scope.$apply($scope.casess[lastCoup[2].y][lastCoup[2].x]['bloc']=false);
		}
		$scope.displayWinOrLost();
	};
	
	$scope.isWin = function() {
		
		
		
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				var uneCase = cases[j];
				if(uneCase.socle) {
					if(!uneCase.bloc)
						return false;
				}
			}
		}
		return true;
	};
	
	
	$scope.isLost = function() {
	
		// Bloc dans un coin ?
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				var uneCase = cases[j];
				if(uneCase.bloc && !uneCase.socle) {
					var uneCaseGrille = {
						x : j,
						y : i
					};
					var nextCaseUpGrille = $scope.findNextCase(uneCaseGrille, 'UP');
					var nextCaseRightGrille = $scope.findNextCase(uneCaseGrille, 'RIGHT');
					var nextCaseDownGrille = $scope.findNextCase(uneCaseGrille, 'DOWN');
					var nextCaseLeftGrille = $scope.findNextCase(uneCaseGrille, 'LEFT');
					var nextCaseUp = $scope.casess[nextCaseUpGrille.y][nextCaseUpGrille.x];
					var nextCaseRight = $scope.casess[nextCaseRightGrille.y][nextCaseRightGrille.x];
					var nextCaseDown = $scope.casess[nextCaseDownGrille.y][nextCaseDownGrille.x];
					var nextCaseLeft = $scope.casess[nextCaseLeftGrille.y][nextCaseLeftGrille.x];
					if(
						nextCaseUp.mur && nextCaseRight.mur ||
						nextCaseRight.mur && nextCaseDown.mur ||
						nextCaseDown.mur && nextCaseLeft.mur ||
						nextCaseLeft.mur && nextCaseUp.mur
					)
						return true;
					
				}
			}
		}
		
		// Bloc contre un mur sans socle contre ce mur ?
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				var uneCase = cases[j];
				if(uneCase.bloc && !uneCase.socle) {
					var uneCaseGrille = {
						x : j,
						y : i
					};
					var nextCaseUpGrille = $scope.findNextCase(uneCaseGrille, 'UP');
					var nextCaseRightGrille = $scope.findNextCase(uneCaseGrille, 'RIGHT');
					var nextCaseDownGrille = $scope.findNextCase(uneCaseGrille, 'DOWN');
					var nextCaseLeftGrille = $scope.findNextCase(uneCaseGrille, 'LEFT');
					var nextCaseUp = $scope.casess[nextCaseUpGrille.y][nextCaseUpGrille.x];
					var nextCaseRight = $scope.casess[nextCaseRightGrille.y][nextCaseRightGrille.x];
					var nextCaseDown = $scope.casess[nextCaseDownGrille.y][nextCaseDownGrille.x];
					var nextCaseLeft = $scope.casess[nextCaseLeftGrille.y][nextCaseLeftGrille.x];
					
					if(nextCaseUp.mur || nextCaseDown.mur) {
						var yParcours = uneCaseGrille.y;
						var nbrSocles = 0;
						for(var xParcours=0; xParcours<$scope.casess[0].length; xParcours++) {
							
							var caseParcours = $scope.casess[yParcours][xParcours];
							if(caseParcours.socle)
								nbrSocles++;
						}						
						if(nbrSocles==0) {
							if(nextCaseUp.mur) {
								var yParcoursMur = uneCaseGrille.y - 1;
								var nbrTerre = 0;
								for(var xParcoursMur=0; xParcoursMur<$scope.casess[0].length; xParcoursMur++) {	
									var caseParcoursMur = $scope.casess[yParcoursMur][xParcoursMur];
									if(caseParcoursMur.terre)
										nbrTerre++;
								}
								if(nbrTerre==0)
									return true;
							} else {
								var yParcoursMur = Number(uneCaseGrille.y) + 1;
								var nbrTerre = 0;
								for(var xParcoursMur=0; xParcoursMur<$scope.casess[0].length; xParcoursMur++) {	
									var caseParcoursMur = $scope.casess[yParcoursMur][xParcoursMur];
									if(caseParcoursMur.terre)
										nbrTerre++;
								}
								if(nbrTerre==0)
									return true;	
							}
						}
					}
					
					if(nextCaseLeft.mur || nextCaseRight.mur) {
						
						var xParcours = uneCaseGrille.x;
						var nbrSocles = 0;
						for(var yParcours=0; yParcours<$scope.casess.length; yParcours++) {							
							var caseParcours = $scope.casess[yParcours][xParcours];
							if(caseParcours.socle)
								nbrSocles++;
						}						
						if(nbrSocles==0) {
							if(nextCaseLeft.mur) {
								var xParcoursMur = uneCaseGrille.x - 1;
								var nbrTerre = 0;
								for(var yParcoursMur=0; yParcoursMur<$scope.casess.length; yParcoursMur++) {	
									var caseParcoursMur = $scope.casess[yParcoursMur][xParcoursMur];
									if(caseParcoursMur.terre)
										nbrTerre++;
								}
								if(nbrTerre==0)
									return true;
							} else {
								
								var xParcoursMur = Number(uneCaseGrille.x) + 1;
								var nbrTerre = 0;
								for(var yParcoursMur=0; yParcoursMur<$scope.casess.length; yParcoursMur++) {	
									var caseParcoursMur = $scope.casess[yParcoursMur][xParcoursMur];
									if(caseParcoursMur.terre)
										nbrTerre++;
								}
								if(nbrTerre==0)
									return true;	
							}
						}
					}
				}
			}
		}
		return false;		
	};	
	
	$scope.displayWinOrLost = function() {
		if($scope.isWin())
			$scope.$apply(function() {$scope.win=true;});			
		else
			$scope.$apply(function() {$scope.win=false;});	
		
		
		if($scope.isLost())
			$scope.$apply(function() {$scope.lost=true;});	
		else
			$scope.$apply(function() {$scope.lost=false;});	
	};
	

	$scope.reset = function() {		
		$scope.createGrille($scope.level);
	};

	
	// Effectue un mouvement
	$scope.doMove = function(direction) {
		
		var persoCase = $scope.findPersoLocation();
		var nextCase = $scope.findNextCase(persoCase, direction);		
		var nextCaseInGrille = $scope.casess[nextCase.y][nextCase.x];
		
		if(nextCaseInGrille.mur)
			return false;
		
		if(!nextCaseInGrille.bloc) { // Déplacement du perso
			$scope.$apply($scope.casess[persoCase.y][persoCase.x]['perso']=false);
			$scope.$apply($scope.casess[nextCase.y][nextCase.x]['perso']=true);			
			$scope.storeCoup([persoCase, nextCase]);
		} else {			
			var nextNextCase = $scope.findNextCase(nextCase, direction);
			var nextNextCaseInGrille = $scope.casess[nextNextCase.y][nextNextCase.x];			
			if(nextNextCaseInGrille.mur || nextNextCaseInGrille.bloc)
				return false;			
			else { // Déplacement du perso et d'un bloc				
				$scope.$apply($scope.casess[persoCase.y][persoCase.x]['perso']=false);
				$scope.$apply($scope.casess[nextCase.y][nextCase.x]['perso']=true);				
				$scope.$apply($scope.casess[nextCase.y][nextCase.x]['bloc']=false);
				$scope.$apply($scope.casess[nextNextCase.y][nextNextCase.x]['bloc']=true);					
				$scope.storeCoup([persoCase, nextCase, nextNextCase]);	
				
			}			
		}		

		$scope.displayWinOrLost();
		return true;
	};
	
	
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	
	$scope.arbre = [];
	$scope.directions = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
	$scope.id_found = -1;
	$scope.id_cursor = 0;
	
	
	$scope.getConfig = function() {		
		var persoCase = $scope.findPersoLocation();
		var config = [persoCase];
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				var uneCase = cases[j];
				if(uneCase.bloc) {
					var blocCase = {
						x : j,
						y : i
					};			
					config.push(blocCase);
				}
			}
		}		
		return config;		
	};
	
	$scope.setConfig = function(config) {		
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				$scope.$apply($scope.casess[i][j]['perso']=false);
				$scope.$apply($scope.casess[i][j]['bloc']=false);
			}
		}
		var persoCase = config[0];
		$scope.$apply($scope.casess[persoCase.y][persoCase.x]['perso']=true);	
		for(var i = 1; i < config.length; i++) {			
			var blocCase = config[i];
			$scope.$apply($scope.casess[blocCase.y][blocCase.x]['bloc']=true);
		}
	};
	
	$scope.isSameConfigs = function(config1, config2) {		
		if(config1.length != config2.length)
			return false;		
		for(var i = 0; i < config1.length; i++) {				
			var obj1 = config1[i];
			var obj2 = config2[i];
			if(obj1.x != obj2.x)
				return false;
			if(obj1.y != obj2.y)
				return false;			
		}
		return true;
	};
	
	$scope.isConfigExist = function(config) {		
		for(var i = 0; i < $scope.arbre.length; i++) {
			var noeud = $scope.arbre[i];
			if($scope.isSameConfigs(config, noeud.config))
				return true;
		}
		return false;
	};
	
	$scope.createSubNodes = function(profondeur) {		
		for(var i = 0; i < $scope.arbre.length; i++) {		
			var noeud = $scope.arbre[i];
			if(noeud.profondeur == profondeur) {				
				$scope.setConfig(noeud.config);
				for(var j = 0; j < $scope.directions.length; j++) {
					var direction = $scope.directions[j];
					if($scope.doMove(direction)) {
						if(!$scope.isLost()) {						
							var newConfig = $scope.getConfig();
							if(!$scope.isConfigExist(newConfig)) {								
								var sousNoeud = {
									id : ++$scope.id_cursor,
									id_parent : noeud.id,
									profondeur : profondeur + 1,
									config : newConfig
								};
								$scope.arbre.push(sousNoeud);								
								if($scope.isWin()) {
									$scope.id_found = $scope.id_cursor;
									return;
								}
							}							
						}						
					} 		
					$scope.setConfig(noeud.config);
				}				
			}
		}
	};
	
	$scope.getNodeById = function(idNode) {
		for(var i = 0; i < $scope.arbre.length; i++) {
			var nodeInArbre = $scope.arbre[i];
			if(nodeInArbre.id == idNode)
				return nodeInArbre;			
		}
	};
	
	$scope.createPlayLine = function(playLine) {		
		var firstNode = playLine[0];
		var firstNodeIdParent = firstNode.id_parent;
		if(firstNodeIdParent == -1) {
			return playLine;
		} else {
			var parentNode = $scope.getNodeById(firstNodeIdParent);
			playLine.unshift(parentNode);
			return $scope.createPlayLine(playLine);
		}		
	};
	
	$scope.playSolution = function(playLine) {
		$scope.reset();		
		var playerCursor = 0;		
		var player = setInterval(function() {			
			var currentNode = playLine[playerCursor];
			var currentConfig = currentNode.config;			
			$scope.setConfig(currentConfig);			
			playerCursor++;			
			if(playerCursor >= playLine.length) {
				clearInterval(player);
				$scope.displayWinOrLost();
			}
		}, 500);
	};

	$scope.findSolution = function() {	
		
		
		
		$scope.arbre = [];
		$scope.id_found = -1;
		$scope.id_cursor = 0;
		var initialConfig = $scope.getConfig();
		var initialNoeud = {
			id : ++$scope.id_cursor,
			id_parent : -1,
			profondeur : 0,
			config : initialConfig
		};
		$scope.arbre.push(initialNoeud);

		for(var profondeur = 0; profondeur < 100; profondeur ++) {
			if($scope.id_found == -1) {
				$scope.createSubNodes(profondeur);
			}
			console.log('Nombre de coups : ' + profondeur);
			console.log('Nombre de configs trouvées : ' + $scope.arbre.length);
		}

		if($scope.id_found !== -1) {
			var playLine = [];
			var finalNode = $scope.getNodeById($scope.id_found);
			playLine.unshift(finalNode);
			playLine = $scope.createPlayLine(playLine);
			$scope.playSolution(playLine);
		}	
			
	};
	
	
	
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------------------*/

});

/*------------------------------------------------------------------------------*/
/* DIRECTIVES */
/*------------------------------------------------------------------------------*/

// Select grille
appSokoban.directive('ngChange', function() {
	return function(scope, elem, attrs) {		
		scope.$watch('level', function() {			
			if(scope.level != null) {
				var realFileName = scope.level;
				scope.createGrille(realFileName);				
				elem[0].blur();
			}
		});		
	};
});


// Events clavier
appSokoban.directive('onKeyup', function() {
	return function(scope, elem, attrs) {
		elem.bind('keydown', function(event) {
			switch(event.keyCode) {
				case 38 : // UP
					scope.doMove('UP');
				break;
				case 40 : // DOWN
					scope.doMove('DOWN');
				break;
				case 37 : // LEFT
					scope.doMove('LEFT');
				break;
				case 39 : // RIGHT
					scope.doMove('RIGHT');
				break;
				case 46 : // UNDO
					scope.undoMove();
				break;
				case 13 : // RESET
					scope.reset();
				break;
			}
			
		});
		
	};
});