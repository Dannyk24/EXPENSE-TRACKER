/*Income cateogry for salaries and allowance but not for budgets*/
export let transactions = getTransactions()


export function saveTransactions(){
    localStorage.setItem('transactions', JSON.stringify(transactions))
}
export function getTransactions(){
    return JSON.parse(localStorage.getItem('transactions')) || []
}

