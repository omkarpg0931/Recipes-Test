'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives'])

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3000";


app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/recipe.list.html',
            controller: 'RecipeListCtrl'
        }).
        when('/recipe/:id', {
            templateUrl: 'partials/recipe.view.html',
            controller: 'RecipeViewCtrl'
        }).
        when('/recipe/create', {
            templateUrl: 'partials/recipe.create.html',
            controller: 'RecipeCreateCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'UserCtrl'
        }).
        when('/login', {
            templateUrl: 'partials/signin.html',
            controller: 'UserCtrl'
        }).
        when('/logout', {
            templateUrl: 'partials/logout.html',
            controller: 'UserCtrl',
            access: { requiredAuthentication: true }
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

appControllers.controller('RecipeListCtrl', ['$scope', '$sce', 'RecipeService',
    function RecipeListCtrl($scope, $sce, RecipeService) {

        $scope.recipes = [];

        RecipeService.findAll().success(function(data) {
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

appControllers.controller('RecipeViewCtrl', ['$scope', '$routeParams', '$location', '$sce', 'RecipeService',
    function RecipeViewCtrl($scope, $routeParams, $location, $sce, RecipeService) {

        $scope.recipe = {};
        var id = $routeParams.id;

        RecipeService.read(id).success(function(data) {
            data.description = $sce.trustAsHtml(data.description);
            data.ingredients = $sce.trustAsHtml(data.ingredients);
            $scope.recipe = data;
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
]);

appControllers.controller('RecipeCreateCtrl', ['$scope', '$location', 'RecipeService',
    function RecipeCreateCtrl($scope, $location, RecipeService) {
        $('#textareaContent').wysihtml5({"font-styles": false});
        $('#inputIngredients').wysihtml5({"font-styles": false});

        $scope.save = function save(recipe) {
            if (recipe != undefined 
                && recipe.title != undefined) {

                var description = $('#textareaContent').val();
                var ingredients = $('#inputIngredients').val();
                if (description != undefined) {
                    recipe.description = description;

                    recipe.ingredients = ingredients

                    RecipeService.create(recipe).success(function(data) {
                        $location.path("/");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('UserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function UserCtrl($scope, $location, $window, UserService, AuthenticationService) {

        //Admin User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {
            if (username != null && password != null) {

                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) {
                
                UserService.logOut().success(function(data) {
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    $location.path("/");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
            else {
                $location.path("/login");
            }
        }

        $scope.register = function register(name, emailId, password, passwordConfirm) {
            if (AuthenticationService.isAuthenticated) {
                $location.path("/");
            }
            else {
                UserService.register(name, emailId, password, passwordConfirm).success(function(data) {
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
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
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
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
                $location.path("/login");
            }

            return $q.reject(rejection);
        }
    };
});

appServices.factory('RecipeService', function($http) {
    return {
        read: function(id) {
            return $http.get(options.api.base_url + '/recipe/?id=' + id);
        },
        
        findAll: function() {
            return $http.get(options.api.base_url + '/recipe/all');
        },

        create: function(recipe) {
            return $http.recipe(options.api.base_url + '/recipe', {'recipe': recipe});
        }
    };
});

appServices.factory('UserService', function ($http) {
    return {
        signIn: function(username, password) {
            return $http.post(options.api.base_url + '/user/login', {username: username, password: password});
        },

        logOut: function() {
            return $http.get(options.api.base_url + '/user/logout');
        },

        register: function(name, emailId, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/user/register', {name:name, email_id: emailId, password: password, password_confirmation: passwordConfirmation });
        }
    }
});