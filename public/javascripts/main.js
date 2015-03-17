var hypeApp = angular.module('hypeApp', []);

hypeApp.controller('ImageCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.loading = true;
  $scope.img = '';

  $http.post('/image/create')
    .success(function(data) {
      console.log(data);
      $scope.img = data.image;
      $scope.loading = false;
    })
    .error(function(data) {
      console.log('error!', data);
    });

  $scope.saveImage = function() {
    console.log('saving!');
    $http.post('/image/save')
      .success(function(data) {
        console.log(data);

        $window.location.href = 'https://facebook.com/photo.php?fbid='+data.image.id+'&makeprofile=1';
      })
      .error(function(data) {
        console.log('an error occured', data);
      });
  };

}]);
