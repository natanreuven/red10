var appSokoban = angular.module('appSokoban', []);



appSokoban.controller('ctrlSokoban', function($scope, $http) {
	
	$scope.casess = [[]];
	$scope.fileNames = [
		'grille-1.sok',
		'grille-2.sok',
		'grille-3.sok',
		'grille-4.sok',
		'grille-5.sok'
	];
	
	$scope.persoLocation = {
		x : 0,
		y : 0
	};
	
	$scope.findPersoLocation = function() {
		for(var i in $scope.casess) {
			var cases = $scope.casess[i];
			for(var j in cases) {
				var uneCase = cases[j];
				if(uneCase.perso) {
					$scope.persoLocation.x = j;
					$scope.persoLocation.y = i;
				}
			}
		}
	};
	
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
			$scope.findPersoLocation();
		});
	};	
	
	$scope.$watch('fileName', function() {
		if($scope.fileName != null) {
			var realFileName = 'grilles/' + $scope.fileName;
			$scope.createGrille(realFileName);
		}
	});
	
	
	$scope.doMove = function(direction) {
		
		
	};

});

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
					alert('undo');
				break;
				case 13 : // RESET
					alert('reset');
				break;
			}
		});
	};
});