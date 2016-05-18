'use strict';

angular.module('budgetApp')

.controller('BudgetController', ['$scope', 'budgetFactory', '$localStorage', function ($scope, budgetFactory, $localStorage) {

    $scope.budgets = [];
    $scope.filtText = '';
    $scope.message = "";

    budgetFactory.query(
        function (response) {
            $scope.budgets = response;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });


    $scope.addBudget = function(budget) {
        if (budget === undefined || budget.name == null || budget.currency == null) {
            return ;
        }

        var newBudget 		= new Object();
        newBudget.name 		= budget.name;
        newBudget.description 	= budget.description;
        newBudget.currency 	    = budget.currency;
        newBudget.username      = $localStorage.username;

        budgetFactory.save(newBudget);
        $scope.budgets.push(newBudget);
        $state.go($state.current, {}, {reload: true});
    };
    $scope.deleteBudget = function(budgetId) {
        budgetFactory.delete({id: budgetId});
        var budgets = $scope.budgets;
        for (var budgetKey in budgets) {
            if (budgets[budgetKey]._id == budgetId) {
                $scope.budgets.splice(budgetKey, 1);
                return ;
            }
        }
        $state.go($state.current, {}, {reload: true});
    };
}])

.controller('BudgetDetailController', ['$scope', '$state', '$stateParams', 'budgetFactory', 'recordFactory', 'categoryFactory', function ($scope, $state, $stateParams, budgetFactory, recordFactory, categoryFactory) {

    $scope.categories 	= [];
    $scope.budget 	= {};
    var budget_id   	= $stateParams.id;


    $scope.budget = budgetFactory.get({
                id: budget_id
            })
    .$promise.then(
        function (response) {
            $scope.budget = response;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    categoryFactory.query(
        function (response) {
            $scope.categories = response;

        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });


    $scope.addRecord = function (record) {

        if (record === undefined) {
            return ;
        }
        var amount = Number(record.amount);
        if (isNaN(amount) || amount <= 0) {
            return ;
        }

        //Create the new record with form input values
        var newRecord		= new Object();
        newRecord.category 		= record.category;
        newRecord.description 	= record.description;
        newRecord.amount 		= amount;
        newRecord.is_expense 	= record.type == 0 ? true : false;
        newRecord.budget_id     	= budget_id;


        recordFactory.save({id: budget_id}, newRecord);

        if (newRecord.is_expense) {
            $scope.budget.balance -= amount;
        }
        else {
            $scope.budget.balance += amount;
        }

        $scope.budget.records.push(newRecord);
        updateChart();

        //$state.go($state.current, {}, {reload: true});

        $scope.recordForm.$setPristine();
    };

    $scope.deleteRecord = function(record) {
        recordFactory.delete({id: budget_id, recordId: record._id});

        var records = $scope.budget.records;
        for (var recordKey in records) {
            if (records[recordKey]._id == record._id) {
                if (records[recordKey].is_expense) {
                    $scope.budget.balance += records[recordKey].amount;
                }
                else {
                    $scope.budget.balance -= records[recordKey].amount;
                }

                $scope.budget.records.splice(recordKey, 1);
                updateChart();
            }
        }
    };

    function updateChart() {
        var records = $scope.budget.records;
        var totalExpense = 0;
        var totalIncome = 0;

        for (var recordKey in records) {
            if (records[recordKey].is_expense) {
                totalExpense += records[recordKey].amount;
            }
            else {
                totalIncome += records[recordKey].amount;
            }
        }

        var pieData = [{value: totalExpense,color:"#f2dede"},
            {value : totalIncome,color : "#dff0d8"}];


        //Display the data
        new Chart(document.getElementById("canvas").getContext("2d")).Pie(pieData);
    };
}])

.controller('CategoryController', ['$scope', '$state', '$stateParams', 'categoryFactory', function ($scope, $state, $stateParams, categoryFactory) {

        categoryFactory.query(
            function (response) {
                $scope.categories = response;

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });

        $scope.addCategory = function (category) {

            if (category === undefined || category.name == null) {
                return ;
            }

            var newCategory = new Object();
            newCategory.name      = category.name;
            newCategory.description  = category.description;

            categoryFactory.save(newCategory);

            $scope.categories.push(newCategory);

            $state.go($state.current, {}, {reload: true});

            $scope.categoryForm.$setPristine();
        };

        $scope.deleteCategory = function(categoryId) {
            categoryFactory.delete({id: categoryId});

            var categories = $scope.categories;
            for (var categoryKey in categories) {
                if (categories[categoryKey]._id == categoryId) {
                    $scope.categories.splice(categoryKey, 1);
                    return ;
                }
            }
            $state.go($state.current, {}, {reload: true});
        };
    }])

.controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    $scope.sendFeedback = function () {


        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
        }
    };
}])

.controller('HomeController', ['$scope', function ($scope) {
    
}])

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {

        AuthFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])
;

