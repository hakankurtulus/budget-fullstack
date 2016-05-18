'use strict';

angular.module('budgetApp', ['ui.router','ngResource','ngDialog'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'HomeController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })
        

            // route for the contactus page
            .state('app.contactus', {
                url:'contactus',
                views: {
                    'content@': {
                        templateUrl : 'views/contactus.html',
                        controller  : 'ContactController'                  
                    }
                }
            })


            // route for the menu page
            .state('app.budgets', {
                url: 'budgets',
                views: {
                    'content@': {
                        templateUrl : 'views/budgets.html',
                        controller  : 'BudgetController'
                    }
                }
            })

            // route for the menu page
            .state('app.budgetdetail', {
                url: 'budgets/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/budgetdetail.html',
                        controller  : 'BudgetDetailController'
                    }
                }
            })

            .state('app.categories', {
                url: 'categories/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/categories.html',
                        controller  : 'CategoryController'
                    }
                }
            })

    
        $urlRouterProvider.otherwise('/');
    })
;
