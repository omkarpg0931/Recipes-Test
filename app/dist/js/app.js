'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives', 'ngFileUpload'])

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
      $routeProvider.
        when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'UserCtrl'
        }).
        when('/recipe/create', {
            templateUrl: 'partials/recipe.create.html',
            controller: 'RecipeCtrl',
            access: { requiredAuthentication: false }
        }).
        when('/login', {
            templateUrl: 'partials/signin.html',
            controller: 'UserCtrl'
        }).
        when('/list', {
            templateUrl: 'partials/recipe.list.html',
            controller: 'RecipeListCtrl'
        }).
        when('/recipe/:id', {
            templateUrl: 'partials/recipe.view.html',
            controller: 'RecipeViewCtrl'
        }).
        when('/logout', {
            templateUrl: 'partials/logout.html',
            controller: 'UserCtrl',
            access: { requiredAuthentication: false }
        }).
        otherwise({
            redirectTo: '/login'
        });
}]);


app.config(function ($httpProvider) {    
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
            
                $location.path("/login");
        } 
    });
});

appControllers.controller('mainCtrl', ['$scope', '$rootScope',
    function MainCtrl($scope, $rootScope) {

    }
]);

appControllers.controller('RecipeListCtrl', ['$scope', '$rootScope', '$sce', '$window', 'RecipeService',
    function RecipeListCtrl($scope, $rootScope, $sce, $window, RecipeService) {

        $scope.recipes = [];
        if ($window.sessionStorage.user_type && $window.sessionStorage.user_type== 'true'){
            $rootScope.showCreate = true
        }

        if ($window.sessionStorage.token){
            $rootScope.showLogout = true
        }
        RecipeService.findAll().success(function(data) {
            console.log(data);
            
            for (var key in data) {
                data[key].description = $sce.trustAsHtml(data[key].description);
            }

            $scope.recipes = data;
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
]);

appControllers.controller('RecipeViewCtrl', ['$scope', '$routeParams', '$rootScope', '$location', '$sce', '$window', 'RecipeService',
    function RecipeViewCtrl($scope, $routeParams, $rootScope, $location, $sce, $window, RecipeService) {

        $scope.recipe = {};
        $scope.comments = []

        var id = $routeParams.id;
        if ($window.sessionStorage.user_type){
            $rootScope.showCreate = true
        }

        if ($window.sessionStorage.token){
            $rootScope.showLogout = true
        }
        RecipeService.read(id).success(function(data) {
            data.description = $sce.trustAsHtml(data.description);
            data.ingredients = $sce.trustAsHtml(data.ingredients);
            console.log(data);
            $scope.comments = data.recipe_comments
            
            $scope.recipe = data;

        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
]);

appControllers.controller('CommentController', ['$scope', '$routeParams', '$rootScope', '$location', '$sce', '$window', 'RecipeService',
    function CommentController($scope, $routeParams, $rootScope, $location, $sce, $window, RecipeService)  {

        if ($window.sessionStorage.token) {
            $rootScope.showLogout = true
        }
        $scope.addComment = function addComment(id, comment) {
            if (comment.length > 10){
                RecipeService.comment(id, comment).success(function (data) {
                    $location.path("/list");
                    alert("Comment successfully added")
                }).error(function (data, status) {
                    alert("Server Error, Please Try again")
                });
            }
            
        }
    }
]);

appControllers.controller('RecipeCtrl', ['$scope', '$rootScope', '$location' , '$window', 'RecipeService',
    function RecipeCtrl($scope, $rootScope, $location , $window, RecipeService) {

        $rootScope.showCreate = false;

        if ($window.sessionStorage.token){
            $rootScope.showLogout = true;
        }
        if (!$window.sessionStorage.user_type) {
            $location.path("/list");
        } else{
            $scope.recipe = {}
            $scope.recipe.image_url = false
            $('#textareaContent').wysihtml5({"font-styles": false});
            $('#inputIngredients').wysihtml5({"font-styles": false});
            $scope.save = function save(recipe, file) {                
            
                if (recipe != undefined 
                    && recipe.title != undefined) {

                    var description = $('#textareaContent').val();
                    var ingredients = $('#inputIngredients').val();
                    if (description != undefined) {
                        recipe.description = description;

                        recipe.ingredients = ingredients

                        RecipeService.create(recipe, file).success(function(data) {
                            $location.path("/list");
                        }).error(function(status, data) {
                            console.log(status);
                            console.log(data);
                        });;
                    }
                }
            }
        }
    }
]);

appControllers.controller('UserCtrl', ['$scope', '$rootScope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function UserCtrl($scope, $rootScope, $location, $window, UserService, AuthenticationService) {
        $rootScope.showLogout = false;
        $rootScope.showCreate = false;
        // User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {

            if (username != null && password != null) {
                
                UserService.signIn(username, password).success(function(data) {

                    alert("Successfully logged in")
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $rootScope.showLogout = true;
                    $window.sessionStorage.setItem("user_type", data.user_type);
                    $location.path("/list");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) { 
                alert("Successfully logged out")               
                AuthenticationService.isAuthenticated = false;
                delete $window.sessionStorage.token;
                delete $window.sessionStorage.user_type;
                $rootScope.showLogout = false;
                $rootScope.showCreate = false;
                $location.path("/login");
            }
            else {
                $location.path("/login");
            }
        }

        $scope.register = function register(fullName, emailId, password, passwordConfirm) {
            if (AuthenticationService.isAuthenticated) {
                $location.path("/list");
            }
            else {
                UserService.register(fullName, emailId, password, passwordConfirm).success(function (data) {
                    alert("Successfully registered.")        
                    $location.path("/login");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
]);

appDirectives.directive('displayMessage', function() {
	return {
		restrict: 'E',
		scope: {
        	messageType: '=type',
        	message: '=data'
      	},
		template: '<div class="alert {{messageType}}">{{message}}</div>',
		link: function (scope, element, attributes) {
            scope.$watch(attributes, function (value) {
            	console.log(attributes);
            	console.log(value);
            	console.log(element[0]);
                element[0].children.hide(); 
            });
        }
	}
});

appServices.factory('AuthenticationService', function() {
    var auth = {
        isAuthenticated: false,
        isAdmin: false
    }

    return auth;
});

appServices.factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
    return {
        request: function (config) {
            
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                $location.path("/list");
            }

            return $q.reject(rejection);
        }
    };
});

appServices.factory('RecipeService', function($http) {
    return {
        read: function(id) {
            return $http.get('/api/recipe/?id=' + id);
        },

        comment: function (id, comment) {
            return $http.post('/api/recipe/comment', { "id": id, "comment": comment});
        },
        
        findAll: function() {
            return $http.get('/api/recipe/all');
        },

        create: function(recipe,file) {
            var fd = new FormData();
            fd.append('file', file);

            fd.append('data', angular.toJson(recipe));

            return $http.post('/api/recipe', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        }
    };
});

appServices.factory('UserService', function ($http) {
    return {
        signIn: function(username, password) {
            return $http.post('/api/user/login', {username: username, password: password});
        },

        logOut: function() {
            return $http.get('/api/user/logout');
        },

        register: function(fullName, emailId, password, passwordConfirmation) {
            return $http.post('/api/user/register', {name:fullName, email_id: emailId, password: password, password_confirmation: passwordConfirmation });
        }
    }
});