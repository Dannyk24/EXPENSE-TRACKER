import { setActiveTab,getActiveTab } from "../../UTILS/navigation.js"


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

