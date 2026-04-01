import { setActiveTab,getActiveTab } from "../../UTILS/navigation.js"
import { debounceFunction } from "../../UTILS/performace.js"
import { budgets,saveBudgets } from "../../DATA/budgets.js"
import { transactions,saveTransactions } from "../../DATA/transactions.js"
import { formatDate,sortByDate,filterByDate } from "../../UTILS/time.js"
import { dataIcons } from "../../DATA/icons.js"

const navigationPanel = document.querySelector('.navigation-panel')
navigationPanel.addEventListener('click',(e)=>{
    const clickedItem =  e.target.closest('.nav-item-container')
    if(!clickedItem){
        return
    }
    const tabName = clickedItem.dataset.section
    setActiveTab(tabName)
})
setActiveTab(getActiveTab()) /*uses session storage to return the last active tab when a user refreshes(persistence) or returns 'dashboard' on page load*/

const filterCalendar = flatpickr('#date-range-input',{
    mode:'range',
    dateFormat: "d-m-Y",
    maxDate:'today',
    altInput:true,
    altFormat:'M-d',
    onClose(){
        const calendarElem = document.querySelector('#date-range-input')
        const filterDate = calendarElem.value
        const sortTransactionsElem = document.querySelector('#sort-transactions')
        if(!filterDate){
            return
        }
        if(sortTransactionsElem.value === 'newest-first'){
            const spreadedArray = spreadSplittedArray(splittedTransactionsArray)
            let filteredArray = filterByDate(spreadedArray,filterDate)
            splitTransactionArray(sortByDate(filteredArray).reverse())
            renderTransactions()
        }
        else{
            const spreadedArray = spreadSplittedArray(splittedTransactionsArray)
            let filteredArray = filterByDate(spreadedArray,filterDate)
            splitTransactionArray(sortByDate(filteredArray))
            renderTransactions()
        }
    }
})

const clearCalendarBtn = document.querySelector('.clear-calendar-btn')
const calendarContainer = document.getElementById('date-range-container')
calendarContainer.addEventListener('click',()=>{
    filterCalendar.open()
})
clearCalendarBtn.addEventListener('click',()=>{
    filterCalendar.clear()
    splitTransactionArray(sortByDate(transactions).reverse())
    renderTransactions()
    notify('success','Date filter removed')
})

/*Add new transaction flatpickr instance*/
const addNewTransactionDateInput = flatpickr('.add-new-transaction-date-input',{
    dateFormat: "d-m-Y",
    maxDate:'today',
    altInput:true,
    altFormat:'M d Y',
    defaultDate:'today',
})

/*edit transaction flatpickr instance*/
const editTransactionDateInput =  flatpickr('.edit-transaction-date-input',{
    dateFormat: "d-m-Y",
    maxDate:'today',
    altInput:true,
    altFormat:'M d Y',
})


/*Dashboard Script*/
const viewAllTransactionsBtn = document.querySelector('.view-all-link')
viewAllTransactionsBtn.addEventListener('click',()=>{
    setActiveTab('transactions')
})


/*BUDGETS SECTION SCRIPT*/
const budgetsContainer = document.querySelector('.budget-section-bottom')
function renderBudgets(){
    if(budgets.length === 0){
        budgetsContainer.innerHTML = 'You currently have no set budgets'
        return
    }
    budgetsContainer.innerHTML = ''
    budgets.forEach(budget=>{
        let budgetTransactions = transactions.filter(t=>t.category === budget.category)
        let totalSpent = 0
        budgetTransactions.forEach(transaction=>{
            totalSpent+=transaction.amount
        })
        let percentageSpent = (totalSpent/budget.amount) * 100
        if(percentageSpent>100){
            percentageSpent = 100
        }
        const budgetIconObject = dataIcons.find(i=>i.category === budget.category)
        const budgetIcon = budgetIconObject.class
        
        let budgetHTML = `
        <div class="budget-section-card bottom-cards" data-category = "${budget.category}">
            <i class="edit-icon fas fa-pencil open-form-btns edit-budget-btns" data-modal = "edit-budget-modal"></i>
            <i class="edit-icon fas fa-trash" id="delete-budget-icon"></i>
            
            <div class="bottom-card-icon"><i class="fas ${budgetIcon}"></i></div>
            <p class="bottom-card-category">${budget.category}</p>
            <div class="amount-spent-container">
                <p>$${totalSpent} of $${budget.amount} spent</p>
                <span class="budget-percentage-number-${budget.category}">${Math.round(percentageSpent)}%</span>
            </div>
            <div class="percentage-container">
                <div class="budget-percentage budget-percentage-${budget.category}" id="food-budget"></div>
            </div>
            <p class="amount-remaining">$${budget.amount - totalSpent} remaining for ${budget.category}</p>
        </div>        
        `
        budgetsContainer.innerHTML += budgetHTML
        const budgetPercentageNumber = document.querySelector(`.budget-percentage-number-${budget.category}`)
        const budgetPercentageBar = document.querySelector(`.budget-percentage-${budget.category}`)
        budgetPercentageBar.style.width = budgetPercentageNumber.textContent
    })
}
renderBudgets()

function setEditBudgetModalValues(btn){
    const budgetCategory = btn.closest('.bottom-cards').dataset.category
    const activeBudget = budgets.find(budget=>budget.category === budgetCategory)
    const editBudgetModal = document.querySelector('#edit-budget-modal')
    const amountFieldInput = editBudgetModal.querySelector('#budget-amount')
    const categoryFieldSelect = editBudgetModal.querySelector('#budget-category')
    const categoryOptions = categoryFieldSelect.querySelectorAll('option')
    categoryOptions.forEach(option=>{
        const value = option.getAttribute('value')
        if(value === activeBudget.category){
            option.setAttribute('selected','')
        }
        else{
            option.removeAttribute('selected','')
        }
    })
    amountFieldInput.value = activeBudget.amount
}


function setBudgetCardValues(){
    const totalBudgetElem = document.querySelector('#total-budget-amount')
    const amountSpentElem = document.querySelector('#total-spent-amount')
    const amountRemainingElem = document.querySelector('#remaining-budget-amount')
    if(budgets.length === 0){
        totalBudgetElem.textContent = `$0`
        amountSpentElem.textContent = `$0`
        amountRemainingElem.textContent = `$0`
        return
    }
    let totalBudget = 0
    budgets.forEach(budget=>{
        totalBudget+=budget.amount
    })
    console.log(totalBudget);

    let amountSpent = 0
    for(let i = 0; i<transactions.length; i++){
        let transaction = transactions[i]
        if(transaction.category === 'income'){
            continue
        }
        amountSpent += transaction.amount
    }

    
    let amountRemaining
    if(totalBudget<= amountSpent){
        amountRemaining = 0
    }
    else{
        amountRemaining = totalBudget - amountSpent
    }

    totalBudgetElem.textContent = `$${totalBudget}`
    amountSpentElem.textContent = `$${amountSpent}`
    amountRemainingElem.textContent = `$${amountRemaining}`
}
setBudgetCardValues()

const addNewBudgetSubmitBtn = document.querySelector('#add-new-budget-submit-btn')
addNewBudgetSubmitBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    addBudget()
})
function addBudget(){
    const addNewTransactionForm = document.querySelector('#add-new-budget-form')
    const budgetAmount = addNewTransactionForm.querySelector('#add-new-budget-amount')
    const categorySelect = addNewTransactionForm.querySelector('#add-new-budget-category')

    if(budgetAmount.value.trim() === '' || categorySelect.value.trim() === ''){
        notify('danger','Invalid Form Data')
        return
    }
    let matchingCategory = budgets.find(b=>b.category === categorySelect.value)
    if(matchingCategory){
        notify('alert','Budget already exists')
        return
    }
    budgets.push({
        category:categorySelect.value,
        amount:Number(budgetAmount.value.trim())
    })
    saveBudgets()
    notify('success','Budget Created')
    renderBudgets()
    closeModal('add-new-budget-modal')
    closeOverlay()
}

function deleteBudget(budget){
    const category = budget.dataset.category
    const budgetindex = budgets.findIndex(b=>b.category === category)
    budgets.splice(budgetindex,1)
    saveBudgets()
    notify('success','Budget Deleted')
    renderBudgets()
    setBudgetCardValues()
}

function editBudget(budget){
    const budgetAmountInputElem = editBudgetForm.querySelector('#budget-amount')
    const budgetCategorySelectElem = editBudgetForm.querySelector('#budget-category')

    const budgetAmount = budgetAmountInputElem.value
    const budgetCategory = budgetCategorySelectElem.value

    if(budgetAmount.trim() === ''){
        notify('success','Invalid form data')
        return
    }
    const budgetIndex = budgets.findIndex(b=>b.category === budgetCategory)
    budgets.splice(budgetIndex,1)
    budgets.push({
        category:budgetCategory,
        amount:Number(budgetAmount)
    })
    saveBudgets()
    notify('success','Budget Updated')
    renderBudgets()
    setBudgetCardValues()
    closeModal('edit-budget-modal')
    closeOverlay()
}


const budgetContainer = document.querySelector('.budget-section-bottom')
budgetContainer.addEventListener('click',e=>{
    if(e.target.getAttribute('id') === 'delete-budget-icon'){
        const budget = e.target.closest('.budget-section-card')
        deleteBudget(budget)
    }
    else if(e.target.classList.contains('edit-budget-btns')){
        setEditBudgetModalValues(e.target)
        openModal('edit-budget-modal')
        openOverlay()
    }
})


const updateBudgetBtn = document.querySelector('#edit-budget-submit-form-btn')
const editBudgetForm = document.querySelector('#edit-budget-form')
updateBudgetBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    editBudget()
})







/*User Profile Script*/
const submitFormDataBtn = document.querySelector('.save-form-changes')


/*=====HELPERS====*/
function getUserObject(){
    const user = JSON.parse(localStorage.getItem('user')) || {
        username:'John Doe',
        email: 'john@example.com',
        phone: '09013151297'
    }
    return user
}
function saveUserObject(user){
    localStorage.setItem('user',JSON.stringify(user))
}

function renderProfileSection(user){
    const userProfileNameElem = document.querySelector('.user-profile-username')
    const userProfileEmailElem = document.querySelector('.user-profile-user-email')
    userProfileNameElem.textContent = user.username
    userProfileEmailElem.textContent = user.email
}
function renderSideBarSection(user){
    const sidebarUsername = document.querySelector('.sidebar-username')
    const sidebarEmail = document.querySelector('.sidebar-email')
    sidebarUsername.textContent = user.username
    sidebarEmail.textContent = user.email
}


const formInputs = document.querySelectorAll('.personal-information-form-input')
formInputs.forEach(input=>{
    input.addEventListener('input',()=>{
        const debounce = debounceFunction(togglSubmitBtnClasslist,300) /*Debounce function returns a function  that is saved in this variable*/
        debounce(input)/*The variable becomes the returned function and takes the callbacks paramaters*/
    })
})

function togglSubmitBtnClasslist(input){
    if(input.value!== ''){
        submitFormDataBtn.classList.add('third-button-active')
        return
    }
    submitFormDataBtn.classList.remove('third-button-active')
}



submitFormDataBtn.addEventListener('click',(e)=>{
    handleSubmitBtnLogic(e)
})
function handleSubmitBtnLogic(e){
    e.preventDefault()
    if(!submitFormDataBtn.classList.contains('third-button-active')){
        return
    }
    const username = document.querySelector('#user-name-input').value
    const email = document.querySelector('#user-email-input').value
    const phone = document.querySelector('#user-phone-input').value

    /*Extra check Incase class check method is bypassed*/
    if(username.trim() === '' || email.trim() === '' || phone.trim() === ''){
        notify('danger','Invalid user data')
        return
    }
    
    const user = {
        username,
        email,
        phone
    }

    /*Compare old userObject to new one to check for duplicate data,if data is same as old one,notify user and return*/
    const oldUserObject = JSON.parse(localStorage.getItem('user'))
    if(oldUserObject.username === user.username && oldUserObject.email === user.email && oldUserObject.phone === user.phone){
        notify('alert','User already exists')
        return
    }
    /*Create new user object,save it to local storage,notify user,update ui*/
    saveUserObject(user)
    notify('success','User profile updated')
    renderUserProfile()
}




function notify(type,notifyMessage){
    let toast;
    if(type === 'success'){
        toast = document.querySelector('.success-toast')
    }
    else if(type === 'danger'){
        toast = document.querySelector('.danger-toast')
    }
    else if(type === 'alert'){
        toast = document.querySelector('.alert-toast')
    }
    toast.querySelector('.toast-message').textContent = notifyMessage
    toast.classList.add('toast-active')

    setTimeout(()=>{
        toast.classList.remove('toast-active')
    },3500)
}


function renderUserProfile(){
    const user = getUserObject()
    /*Profile section elements*/
    renderProfileSection(user)    
    /*Sidebar Elements*/
    renderSideBarSection(user)
    /*Change input field values to user profile values*/
    document.querySelector('#user-name-input').value = user.username
    document.querySelector('#user-email-input').value = user.email
    document.querySelector('#user-phone-input').value  = user.phone
}
renderUserProfile()


/*Settings script*/
const toggleContainer = document.querySelector('.setting-toggle-container')
toggleContainer.addEventListener('click',()=>{
    toggleContainer.classList.toggle('toggle-active')
})




/*Transactions Script*/
/*====HELPERS====*/
const tableControlNumbersContainer = document.querySelector('.numbers-container')

function getTransactionIcon(transaction){
    const transactionIconObject = dataIcons.find(icon=>icon.category === transaction.category)
    const transactionIcon = transactionIconObject.class
    return transactionIcon
}
function getTransactionSymbol(transaction){
    if(transaction.type === 'debit'){
        return '-'
    }
    else{
        return'+'
    }
}
function renderTableControlNumbers(){
    tableControlNumbersContainer.innerHTML = ''
    for(let i = 0; i<splittedTransactionsArray.length;i++){
        if(i === 3){/*If number equals 3 i.e after the first 3 numbers, add ... then the last number*/
            tableControlNumbersContainer.innerHTML += `<div class="number-overflow">...</div>`
            tableControlNumbersContainer.innerHTML += `<div class = "section-number" data-section-number="${splittedTransactionsArray.length - 1}">${splittedTransactionsArray.length}</div>`
            break
        }
        tableControlNumbersContainer.innerHTML += `<div class="section-number" data-section-number="${i}">${i+1}</div>`
    }
}


function generateTransactionHTML(transaction){
    let transactionHTMl = `
        <tr class="transaction-container" data-id = "${transaction.id}">
            <td class="transaction-date">${formatDate(transaction.date)}</td>
            <td class="transaction-category"><i class="fas ${getTransactionIcon(transaction)}"></i>${transaction.category}</td>
            <td class="transaction-description">${transaction.description}</td>
            <td class="transaction-amount ${transaction.type}-transaction-amount">${getTransactionSymbol(transaction)}$${transaction.amount.toFixed(2)}</td>
            <td class="transaction-method ${transaction.type}-transaction-method">
                <span>${transaction.type}</span>
                <i class="fas fa-ellipsis-v transaction-actions-toggle"></i>
                <div class="transaction-actions-container" data-id = "${transaction.id}">
                    <button class="edit-transaction" data-modal="edit-transaction-modal">
                        <i class="fas fa-pen"></i>
                        <span>Edit</span>
                    </button>
                    <button class="delete-transaction">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `
    return transactionHTMl
}
function checkActiveNumberElem(){
    const activeNumberElem = document.querySelector(`[data-section-number="${activeSectionNumber}"]`)
    sectionNumbers.forEach(n=>{
        n.classList.remove('active-section-number')
    })
    const numberOverflow = document.querySelector('.number-overflow')
    if(!numberOverflow){
        activeNumberElem.classList.add('active-section-number')
        return
    }
    if(activeNumberElem){
        if(numberOverflow.classList.contains('number-overflow-active')){
            numberOverflow.classList.remove('number-overflow-active')
        }
        activeNumberElem.classList.add('active-section-number')
    }
    else{
        numberOverflow.classList.add('number-overflow-active')
    }
}
function increaseTableSectionNumber(){
    currentTransactionSlidePosition+=1
    activeSectionNumber+=1
    renderTransactions()
    checkActiveNumberElem()
}
function decreaseTableSectionNumber(){
    currentTransactionSlidePosition-=1
    activeSectionNumber-=1
    renderTransactions()
    checkActiveNumberElem()
}

const transactionsContainer = document.querySelector('.transactions-container')
let currentTransactionSlidePosition = 0
let currentTransactionsNumber
const activeTableSectionTextDisplay = document.querySelector('.active-table-section-text-display')

function spreadSplittedArray(splittedArray){
    let spreadedArray = []
    for(let i = 0; i<splittedArray.length; i++){
        let transactionArray = splittedArray[i]
        for(let i = 0; i<transactionArray.length; i++){
            let transaction = transactionArray[i]
            spreadedArray.push(transaction)
        }
    }

    return spreadedArray
}
function renderActiveTableSectionDisplayText(activeTransactionArray){
    /*Use the id of the first transaction in the active transaction array to search through the spreaded array and use find index to get its index then add the number of elements in the active transaction array to get the from and to values*/
    const spreadedArray = spreadSplittedArray(splittedTransactionsArray)
    const firstTransaction = activeTransactionArray[0]

    const firstTransactionId = firstTransaction.id
    const firstTransactionIndex = spreadedArray.findIndex(t=>t.id === firstTransactionId) + 1
    transactionStart = firstTransactionIndex
    transactionEnd = transactionStart+activeTransactionArray.length-1
    
    activeTableSectionTextDisplay.innerHTML = `Showing ${transactionStart} to ${transactionEnd} of ${spreadedArray.length} transations`
}


let transactionStart = 0
let transactionEnd = 0
function renderTransactions(){
    transactionsContainer.innerHTML = '' /*Clear out all previous html before adding new one*/
    /*activeTransactionArray is the current array in the splittedArray being shown on the page*/
    if(splittedTransactionsArray.length === 0){
        transactionsContainer.innerHTML = 'You currently have no transactions'
        document.querySelector('.active-table-section-text-display').style.display = 'none'
        return
    }
    document.querySelector('.active-table-section-text-display').style.display = 'flex'
    const activeTransactionArray = splittedTransactionsArray[currentTransactionSlidePosition]
    currentTransactionsNumber = currentTransactionSlidePosition+5
    renderActiveTableSectionDisplayText(activeTransactionArray)
    renderTableControlNumbers()

    activeTransactionArray.forEach(transaction=>{
        let transactionHTML = generateTransactionHTML(transaction)
        /*Generate dymanic html for each transaction and add it to the transactions container*/
        transactionsContainer.innerHTML += transactionHTML
    })
}


function handleLeftArrow(){
    if(currentTransactionSlidePosition===0 || !activeSectionNumber){
        return
    }
    decreaseTableSectionNumber()
}
function handleRightArrow(){
    if(currentTransactionSlidePosition>=splittedTransactionsArray.length-1){
        return
    }
    increaseTableSectionNumber()
}

function generateTransactionId(){
    /*If transactions array is empty return id1*/
    if(!transactions[transactions.length-1]){
        return 'id1'
    }
    else{
        return 'id'+ transactions.length +1
    }
}




let splittedTransactionsArray = [] /*Stores splitted transactions array*/

/*Breaks array passed as arguement into arrays of at most 5 elements and atleast 1 element*/
function splitTransactionArray(transactionArray){
    splittedTransactionsArray = []
    for(let i = 0; i<transactionArray.length;i++){
        let transaction = transactionArray[i]
        const lastArray = splittedTransactionsArray[splittedTransactionsArray.length-1]
        if(!lastArray){
            splittedTransactionsArray.push([transaction])/*If array is empty push first transaction with an array*/
        }
        else if(lastArray.length<5){
            lastArray.push(transaction)
        }
        else{
            splittedTransactionsArray.push([transaction])
        }/*If last array is full, push new array*/
    }
}
splitTransactionArray(sortByDate(transactions).reverse())/*sort by date function creates a copy of the array passe as the arguement so the original transactions array is untouched reverse() to create the default newest first sort*/

renderTableControlNumbers()

renderTransactions() /*Initial transactions render render on page load*/




const sectionNumbers  = document.querySelectorAll('.section-number')
const sectionNumbersContainer = document.querySelector('.numbers-container')
let activeSectionNumber = 0;

const contolArrows = document.querySelectorAll('.control-arrows')
contolArrows.forEach(arrow=>{
    arrow.addEventListener('click',()=>{
        if(arrow.classList.contains('left-arrow')){
            handleLeftArrow()
        }
        else if(arrow.classList.contains('right-arrow')){
            handleRightArrow()
        }
    })
})







sectionNumbersContainer.addEventListener('click',(e)=>{
    if(!e.target.classList.contains('section-number')){
        return
    }
    let number = e.target
    setActiveTableSectionNumber(number.dataset.sectionNumber)
})


function setActiveTableSectionNumber(number){
    const numberOverflow = document.querySelector('.number-overflow')
    if(numberOverflow.classList.contains('number-overflow-active')){
        numberOverflow.classList.remove('number-overflow-active')
    }
    const sectionNumbersArray = Array.from(sectionNumbers)
    const activeNumberElem = sectionNumbersArray.find(n=>n.dataset.sectionNumber == number) /*Use loose equality to compare sectionNumber string to var number*/
    sectionNumbers.forEach(n=>{
        n.classList.remove('active-section-number')
    })
    const numberValue = Number(activeNumberElem.dataset.sectionNumber) /*Type cast an number to avoid type issues*/
    currentTransactionSlidePosition = numberValue
    activeSectionNumber = numberValue
    activeNumberElem.classList.add('active-section-number')
    renderTransactions()
}







function populateEditTransactionForm(transaction){
    openOverlay()
    openModal('edit-transaction-modal') /*Manually open modal and overlay as event listeners are destoryed once new transactions are added to the page cause open form btns only captures open form buttons that are on the page on page load*/

    const editTransactionForm = document.querySelector('#edit-transaction-form')
    const typeSelect = editTransactionForm.querySelector('#transaction-type')
    const typeSelectOptions = typeSelect.querySelectorAll('option')
    const transactionAmountInput = editTransactionForm.querySelector('#transaction-amount')
    const categorySelect = editTransactionForm.querySelector('#transaction-category')
    const categorySelectOptions = categorySelect.querySelectorAll('option')
    const descriptionInput = editTransactionForm.querySelector('#transaction-description')

    editTransactionForm.dataset.id = transaction.id/*Form container holds the id of the last edited transaction*/

    editTransactionDateInput.setDate(transaction.date) /*Call flatpickr edit transaction date instance and use setDate() method provided by flatpickr as elem.value would be overwritten*/

    typeSelectOptions.forEach(option=>{
        if(option.value === transaction.type){
            option.setAttribute('selected','')
        }
        else{
            option.removeAttribute('selected',false)
        }
    })
    
    transactionAmountInput.value = transaction.amount

    categorySelectOptions.forEach(option=>{
        if(option.value === transaction.category){
            option.setAttribute('selected','')
        }
        else{
            option.removeAttribute('selected',false)
        }
    })

    descriptionInput.value = transaction.description
}



const editTransactionFormSubmitBtn = document.querySelector('#edit-transaction-form-submit-btn')
editTransactionFormSubmitBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    editTransaction()
})

function editTransaction(){
    const editTransactionForm = document.querySelector('#edit-transaction-form')
    const dateInput = editTransactionForm.querySelector('.edit-transaction-date-input')
    const typeSelect = editTransactionForm.querySelector('#transaction-type')
    const transactionAmountInput = editTransactionForm.querySelector('#transaction-amount')
    const categorySelect = editTransactionForm.querySelector('#transaction-category')
    const descriptionInput = editTransactionForm.querySelector('#transaction-description')



    const transactionID = editTransactionForm.dataset.id 
    const transaction = transactions.find(t=>t.id === transactionID)
    const transactionDate = dateInput.value
    /*Typecast as number because toFixed()returns a string*/
    const transactionAmount = Number(transactionAmountInput.value.trim())
    const transactionDescription = descriptionInput.value.trim()
    const transactionCategory = categorySelect.value
    const transactionType = typeSelect.value 
    let validatedDescription = validateInput(transactionDescription)


    if(!transactionDate || !transactionAmount || !transactionDescription){
        notify('danger','Invalid transaction data')
        return
    }
    if(!validatedDescription){
        notify('alert','Only text descriptions are allowed')
        return
    }
    /*Check if the edited transaction values are same as the original transaction*/

    if(transactionID === transaction.id && transactionDate === transaction.date && transactionCategory === transaction.category && transactionDescription === transaction.description && transactionAmount === transaction.amount && transactionType === transaction.type){
        notify('alert','Transaction already exists')
        return
    }

    /*Remove old transaction before adding the updated one*/
    const transactionIndex = transactions.findIndex(t=>t.id === transactionID)
    transactions.splice(transactionIndex,1)


    const updatedTransaction = {
        id:transactionID,
        date:transactionDate,
        category:transactionCategory,
        description:transactionDescription,
        amount:transactionAmount,
        type:transactionType
    }
    transactions.push(updatedTransaction)
    saveTransactions()
    closeModal('edit-transaction-modal')
    closeOverlay()
    notify('success','Transaction Updated')
    splitTransactionArray(sortByDate(transactions).reverse())
    renderTransactions()
}




const submitTransactionBtn = document.getElementById('add-new-transaction-submit-button')
submitTransactionBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    addTransaction()
})



function addTransaction(){
    const addTransactionForm = document.getElementById('add-new-transaction-form')
    const dateInput = addTransactionForm.querySelector('.add-new-transaction-date-input')
    const typeSelect = addTransactionForm.querySelector('#transaction-type')
    const transactionAmountInput = addTransactionForm.querySelector('#transaction-amount')
    const categorySelect = addTransactionForm.querySelector('#transaction-category')
    const descriptionInput = addTransactionForm.querySelector('#transaction-description')

    /*Input field values*/
    
    const transactionID = generateTransactionId()
    const transactionDate = dateInput.value
    /*Typecast as number because toFixed()returns a string*/
    const transactionAmount = Number(transactionAmountInput.value.trim())
    const transactionDescription = descriptionInput.value.trim()
    const transactionCategory = categorySelect.value
    const transactionType = typeSelect.value 
    let validatedDescription = validateInput(transactionDescription)


    if(!transactionDate || !transactionAmount || !transactionDescription){
        notify('danger','Invalid transaction data')
        return
    }
    if(!validatedDescription){
        notify('alert','Only text descriptions are allowed')
        return
    }
    const newTransaction = {
        id:transactionID,
        date:transactionDate,
        category:transactionCategory,
        description:transactionDescription,
        amount:transactionAmount,
        type:transactionType
    }
    transactions.push(newTransaction)
    saveTransactions()
    closeModal('add-new-transaction-modal')
    closeOverlay()
    notify('success','Transaction Created')
    splitTransactionArray(sortByDate(transactions).reverse())
    renderTransactions()
}
function validateInput(string){
    return /^[a-zA-Z ']*$/.test(string)
}

function deleteTransaction(transaction){
    const transactionIndex = transactions.findIndex(t=>t.id === transaction.id)
    transactions.splice(transactionIndex,1)
    saveTransactions()
    notify('success','Transaction Deleted')
    splitTransactionArray(sortByDate(transactions).reverse())
    renderTransactions()
}




document.body.addEventListener('click',(e)=>{
    /*Check if theres an active transaction actions container, if there is, close it*/
    const activeActionsContainer = document.querySelector('.transaction-actions-container-active')
    if(activeActionsContainer){
        activeActionsContainer.classList.remove('transaction-actions-container-active')
    }
})

transactionsContainer.addEventListener('click',(e)=>{
    const clicked = e.target
    const transactionContainer = clicked.closest('.transaction-container')

    /*Use stop propagation to prevent the event from bubbling upto the document object, if stopPropagation isnt used, the container opens, the click event bubbles upto the body, the event listener is called and the container closes immediately*/
    if(clicked.classList.contains('transaction-actions-toggle')){
        e.stopPropagation()
        const transactionActionsContainer = transactionContainer.querySelector('.transaction-actions-container')
        transactionActionsContainer.classList.add('transaction-actions-container-active')
    }
    if(clicked.closest('.edit-transaction')){
        const containerId = transactionContainer.dataset.id
        const transaction = transactions.find(t=>t.id === containerId)
        populateEditTransactionForm(transaction)
    }
    if(clicked.closest('.delete-transaction')){
        const containerId = transactionContainer.dataset.id
        const transaction = transactions.find(t=>t.id === containerId)
        deleteTransaction(transaction)
    }
})


function displayEmptyTableText(){
    transactionsContainer.innerHTML = ''
    const text = document.querySelector('.empty-table-text')
    text.style.display = 'flex'
}
function removeEmptyTableText(){
    const text = document.querySelector('.empty-table-text')
    text.style.display = 'none'
}


const sortTransactions = document.querySelector('#sort-transactions')

sortTransactions.addEventListener('input',()=>{
    if(sortTransactions.value === 'newest-first'){
        splitTransactionArray(sortByDate(spreadSplittedArray(splittedTransactionsArray)).reverse())
        renderTransactions()
        return
    }
    else{
        splitTransactionArray(sortByDate(spreadSplittedArray(splittedTransactionsArray)))
        renderTransactions()
        return
    }
})

const categoryFilter = document.querySelector('#category-filter')
const typeFilter = document.querySelector('#method-filter')
const filterInputs = document.querySelectorAll('.transaction-data-filter-select')

filterInputs.forEach(input=>{
    input.addEventListener('input',()=>{
        const calendarElem = document.querySelector('#date-range-input')
        const filterDate = calendarElem.value

        const category = categoryFilter.value
        const type = typeFilter.value
        let spreadedArray;
        if(!filterDate){
            spreadedArray = transactions
        }
        else{
            spreadedArray = filterByDate(transactions,filterDate)
        }
        let filteredArray
        if(category === 'all' && type === 'all'){
            filteredArray = spreadedArray
        }
        else if(category !=='all' && type === 'all'){
            filteredArray = spreadedArray.filter(t=>t.category === category)
        }
        else if(category === 'all' && type !== 'all'){
            filteredArray = spreadedArray.filter(t=>t.type === type)
        }
        else if(category !== 'all' && type !== 'all'){
            const categoryFilteredArray = spreadedArray.filter(t=>t.category === category)
            filteredArray = categoryFilteredArray.filter(t=>t.type === type)
        }
        if(filteredArray.length === 0){
            displayEmptyTableText()
            disableTableData()
            return
        }
        else{
            removeEmptyTableText()
            enableTableData()
        }
        if(sortTransactions.value === 'newest-first'){
            splitTransactionArray(sortByDate(filteredArray).reverse())
            renderTransactions()
        }
        else{
            splitTransactionArray(sortByDate(filteredArray))
            renderTransactions()
        }
    })
})

function disableTableData(){
    document.querySelector('.active-table-section-text-display').style.display = 'none'
    document.querySelector('.table-control-container').style.display = 'none'
}
function enableTableData(){
    document.querySelector('.active-table-section-text-display').style.display = 'flex'
    document.querySelector('.table-control-container').style.display = 'flex'
}



















/*CTA,FORMS,MODALS LOGIC*/
const overlay = document.querySelector('.overlay')
const modals = document.querySelectorAll('.form-modal')
const modalsArray = Array.from(modals)/*Convert modals nodelist to array to gain access to methods such as arr.find()*/
const modalCloseBtns = document.querySelectorAll('.modal-close-btn')
let activeModal; /*Save active modal element in global scope*/

/*=====HELPERS=====*/
function openOverlay(){
    overlay.classList.add('overlay-active')
    document.body.style.overflow = 'hidden'/*Stop scrolling on page once overlay is open*/
}
function closeOverlay(){
    overlay.classList.remove('overlay-active')
    document.body.style.overflow = 'auto' /*Return page scrolling back to normal*/
}
function openModal(modal){
    activeModal = modalsArray.find(m=>m.getAttribute('id') === modal)
    activeModal.classList.add('modal-active')
    const modalForm = activeModal.querySelector('form')
    modalForm.scrollTop = 0 /*Reset form scroll position on form open so everytime the form is opened, it starts at the top*/
}
function closeModal(modal){
    activeModal = modalsArray.find(m=>m.getAttribute('id') === modal)
    activeModal.classList.remove('modal-active')
}

const openFormButtons = document.querySelectorAll('.open-form-btns')
openFormButtons.forEach(button=>{
    button.addEventListener('click',()=>{
        openOverlay()
        openModal(button.dataset.modal) /*Pass modal data attribute as arguement into openModal function*/
    })
})


overlay.addEventListener('click',()=>{
    closeOverlay()
    closeModal(activeModal.getAttribute('id'))/*Close modal using active modal's id value when user clicks overlay and modal close button*/
})

modalCloseBtns.forEach(btn=>{ /*For each modal close button close overlay and close active modal*/
    btn.addEventListener('click',()=>{
        closeOverlay()
        closeModal(activeModal.getAttribute('id'))
    })
})



function clearBudgets(){
    budgets.splice(0,budgets.length)
    localStorage.removeItem('budgets')
    notify('success','Budgets data cleared')
    renderBudgets()
    setBudgetCardValues()
}
function clearTransactions(){
    transactions.splice(0,transactions.length)
    localStorage.removeItem('transactions')
    notify('success','Transactions data cleared')
    renderTransactions()
}

function clearAppData(){
    clearBudgets()
    clearTransactions()
    notify('success','App data cleared')
}

const deleteTransactionsDataBtn = document.querySelector('#delete-transactions-data-btn')
const deleteBudgetsDataBtn = document.querySelector('#delete-budget-data-btn')
const deleteAppDataBtn = document.querySelector('#delete-app-data-btn')

deleteTransactionsDataBtn.addEventListener('click',clearTransactions)
deleteBudgetsDataBtn.addEventListener('click',clearBudgets)
deleteAppDataBtn.addEventListener('click',clearAppData)