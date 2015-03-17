var hypeApp = angular.module('hypeApp', []);

hypeApp.controller('ImageCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.loading = true;
  $scope.img = '';
  $scope.savebutton = 'Ladda upp på Facebook';

  $http.post('/image/create')
    .success(function(data) {
      $scope.img = data.image;
      $scope.loading = false;
    })
    .error(function(data) {
      console.log('error!', data);
    });

  $scope.saveImage = function() {
    $scope.upload_loading = true;
    $scope.savebutton = 'Laddar upp...';
    console.log('saving!');
    $http.post('/image/save')
      .success(function(data) {
        console.log(data);
        if (data.image && data.image.id) {
          // redirect!
          $scope.savebutton = 'Tar dig till Facebook...';
          $window.location.href = 'https://facebook.com/photo.php?fbid='+data.image.id+'&makeprofile=1';
        } else {
          $scope.upload_loading = false;
          $scope.savebutton = 'Försök igen!';
        }
      })
      .error(function(data) {
        console.log('an error occured', data);
      });
  };
}]);
