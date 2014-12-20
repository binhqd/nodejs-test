pages
.directive('listings', function() {
    return {
        restrict: 'E',
        scope : false,
        //		scope: {
        //			scope: "="
        //		},
        
        controller: function($scope) {
        	$scope.$watch('listings.original.items', function() {
        		$scope.listings.transformed.items = $scope.transform($scope.listings.original.items);
        		
        		if ($scope.listings.transformed.items.length > 0) {
        			$scope.selectListing($scope.listings.transformed.items[0], 0);
                	//$scope.selectedListing.item = $scope.listings.transformed.items[0];
                }
        	});
        	
        },
        templateUrl: '/templates/dashboard/directives/listings.html'
    };
})
;