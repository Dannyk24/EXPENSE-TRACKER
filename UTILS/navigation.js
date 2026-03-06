const navItems = document.querySelectorAll('.nav-item-container')
const sections = document.querySelectorAll('section')
const activeSectionName = document.querySelector('.active-section-name')


let activeTab = ''
export function setActiveTab(tabName){
    /*Check if user clicked already active tab*/
    if(activeTab === tabName){
        return
    }

    navItems.forEach((item)=>{
        item.classList.toggle('active-nav-item',
            item.dataset.section === tabName
        )
    })
    sections.forEach(section=>{
        section.classList.toggle('active-section',
            section.dataset.section === tabName
        )
    })
    activeTab = tabName
    saveActiveTab(tabName)
    setActiveSectionName(tabName)
}

/*HELPERS*/
function saveActiveTab(tabName){
    sessionStorage.setItem('active-tab', tabName)
}
export function getActiveTab(){
    return sessionStorage.getItem('active-tab') || 'dashboard'
}
function setActiveSectionName(tabName){
    activeSectionName.textContent = capitalizeText(tabName)
}
function capitalizeText(text){
    text.toLowerCase().trim()
    let formattedString =''
    for(let i = 1; i<text.length;i++){
        let char = text[i]
        formattedString+=char
    }
    let firstLetter = text[0].toUpperCase()
    return firstLetter + formattedString
}

