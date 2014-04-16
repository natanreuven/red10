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
	for(var i=1; i<=5; i++)
		$scope.fileNames.push({file : 'grilles/grille-'+i+'.sok', title : 'Level '+i});
	$scope.level = $scope.fileNames[0]['file'];	
	$scope.coups = [];
	$scope.win = false;
	
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
				var ligne = lignesText[i];
				var chars = ligne.split('');
				var uneLigne = [];
				for(var j=0; j<ligne.length-1; j++) {
					var char = ligne[j];
					var uneCase = $scope.createCase(char);
					uneLigne.push(uneCase);
				}
				uneGrille.push(uneLigne);
			}	
			$scope.casess = uneGrille;
			$scope.$apply($scope.win=false);
			$scope.coups = [];

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
	};
	
	$scope.isWin = function() {
		
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j=0; j<cases.length; j++) {
				var uneCase = cases[j];
				if(uneCase.socle) {
					
					if(!uneCase.bloc) {
						return false;
					}
					
					
				}
			}
		}
		return true;
	};
	
	$scope.reset = function() {
		
		$scope.createGrille($scope.level);
		
		
		
		
		
	}

	
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
		
		if($scope.isWin()) {
			$scope.$apply($scope.win=true);
		}

	};

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
			}
			
		});
		
	};
});