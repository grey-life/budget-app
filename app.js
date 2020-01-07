var budgetController = (function () {

    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calculatePercentage = function (totalInc) {
        if(totalInc > 0){
            this.percentage = Math.round((this.value / totalInc)*100);
        }else{
            this.percentage = -1;
        }
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItem[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };


    var data = {
        allItem: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    }

    return {
        addItem: function (type, des, value) {
            var newItem, ID, lastIndex;

            lastIndex = data.allItem[type].length - 1;

            if (lastIndex === -1) {
                ID = 0;
            } else {
                ID = data.allItem[type][lastIndex].id + 1;
            }

            if (type === 'inc') {
                newItem = new Income(ID, des, value);
            } else if (type === 'exp') {
                newItem = new Expenses(ID, des, value);
            }

            data.allItem[type].push(newItem);

            return newItem;
        },

        calculateBudget : function () {
            // Calculate income and expense total
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate percentage of expense to income
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }

        },

        getBudget : function () {
            return {
                budget : data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
            }
        },

        deleteItem : function (type, id) {
            data.allItem[type].forEach(function (cur, index, array) {
                if(cur.id === id){
                    data.allItem[type].splice(index, 1);
                }
            })
            
        },

        getPercentages: function () {
            var percentages =  data.allItem['exp'].map(function (curr){
                curr.calculatePercentage(data.totals.inc);
                return curr.percentage;
            })
            return percentages;
        },

        testing: function (params) {
            console.log(data);
        },

    }

})();

var uiController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    }


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },

        addListItem: function (obj, type, budget) {
            var html, newHTML, element;
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> \
                <div class="item__description">%description%</div> \
                    <div class="right clearfix">\
                        <div class="item__value">+ %value%</div>\
                            <div class="item__delete">\
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                            </div>\
                        </div>\
                </div>';
            } else if (type == 'exp') {
                element = DOMStrings.expenseContainer;

                html = '<div class="item clearfix" id="expense-%id%"> \
                <div class=\"item__description">%description%</div> \
                <div class="right clearfix"> \
                    <div class="item__value">- %value%</div> \
                    <div class="item__percentage">%percentage%</div> \
                    <div class="item__delete"> \
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> \
                    </div> \
                </div> \
            </div>';
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            // Insert into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
        },

        displayBudget: function (obj) {
            this.displayMonthYear();
            
            document.querySelector(DOMStrings.budgetLabel).textContent = '+ ' + obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = '+ ' + obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = '- ' + obj.totalExp;
            if(obj.percentage > 0 ){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        
        },

        displayPercentage: function (percentages) {
            var fields =  document.querySelectorAll(DOMStrings.expensePercLabel);
            
            for(var i = 0; i < fields.length; ++i){

                if(percentages[i] > 0){
                    fields[i].textContent = percentages[i] + '%';
                }else {
                    fields[i].textContent = '---';
                }
            }
        
        },

        displayMonthYear: function () {
            var now, year, month, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
             var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                 DOMStrings.inputValue
             );

             for(var i = 0; i < fields.length; ++i){
                 fields[i].classList.toggle('red-focus');
             }

             document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        },

    }

})();

var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventListeners, ctrlAddItem, updateBudget, ctrlDeleteItem, updatePercentage;

    setupEventListeners = function () {
        var DOM = uiCtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', uiController.changedType);
    }

    updatePercentage = function () {

        // Calculate percentage 
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);

        // Display Percentage
        uiController.displayPercentage(percentages);
    }

    updateBudget = function () {
        // Calculate the budget
        budgetCtrl.calculateBudget();        

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // Display the budget in the UI
        uiCtrl.displayBudget(budget);
    }

    ctrlAddItem = function () {
        var input, newItem;
        // Get the field input data
        input = uiCtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // Add item to the budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            budgetCtrl.testing();
            budgetCtrl.calculateBudget();

            // Add item to the UI Controller
            uiCtrl.addListItem(newItem, input.type, budgetCtrl.getBudget());

            // Clear the fields
            uiCtrl.clearFields();

            // Calculate and update Budget
            updateBudget();

            // Update percentage
            updatePercentage();
        }

    }

    ctrlDeleteItem = function (event) {
        var itemID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0].slice(0,3);
            ID = parseInt(splitID[1]);

            // Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete item from the UI
            uiCtrl.deleteListItem(itemID);

            // Rebuild the UI
            updateBudget();

            // Update the percentages
            updatePercentage();
        }
    }

    return {
        init: function () {
            console.log('Application has started!');
            uiCtrl.displayBudget({
                budget : 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0,
            })
            setupEventListeners();
        }
    }

})(budgetController, uiController);

controller.init();









