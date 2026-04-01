export let budgets = getBudgets()

export function saveBudgets(){
    localStorage.setItem('budgets',JSON.stringify(budgets))
}
export function getBudgets(){
    return JSON.parse(localStorage.getItem('budgets')) || []
}