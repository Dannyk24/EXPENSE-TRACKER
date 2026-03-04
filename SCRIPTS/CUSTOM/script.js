import { setActiveTab } from "../../UTILS/navigation.js"


const navigationPanel = document.querySelector('.navigation-panel')
navigationPanel.addEventListener('click',(e)=>{
    const clickedItem =  e.target.closest('.nav-item-container')
    if(!clickedItem){
        return
    }
    const tabName = clickedItem.dataset.section
    setActiveTab(tabName)
})

