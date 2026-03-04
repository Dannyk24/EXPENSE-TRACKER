const navItems = document.querySelectorAll('.nav-item-container')
const sections = document.querySelectorAll('section')

export function setActiveTab(tabName){
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
}