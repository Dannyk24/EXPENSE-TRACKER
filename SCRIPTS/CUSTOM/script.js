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

const calendar = flatpickr('#date-range-input',{
    mode:'range',
    dateFormat: "Y-m-d",
    maxDate:'today',
    altInput:true,
    altFormat:'M-d',
})

const clearCalendarBtn = document.querySelector('.clear-calendar-btn')
const calendarContainer = document.getElementById('date-range-container')
calendarContainer.addEventListener('click',()=>{
    calendar.open()
})
clearCalendarBtn.addEventListener('click',()=>{
    calendar.clear()
})

/*User Profile Script*/
const submitFormDataBtn = document.querySelector('.save-form-changes')

const formInputs = document.querySelectorAll('.personal-information-form-input')
formInputs.forEach(input=>{
    input.addEventListener('input',()=>{
        if(input.value!== ''){
            submitFormDataBtn.classList.add('third-button-active')
            return
        }
        submitFormDataBtn.classList.remove('third-button-active')
    })
})

submitFormDataBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    if(!submitFormDataBtn.classList.contains('third-button-active')){
        return
    }
    const username = document.querySelector('#user-name-input').value
    const email = document.querySelector('#user-email-input').value
    const phone = document.querySelector('#user-phone-input').value
    const user = {
        username,
        email,
        phone
    }
    localStorage.setItem('user',JSON.stringify(user))
    notify('success','User profile updated')
    renderUserProfile()
})


let notifyTimeoutInterval;
function notify(type,notifyMessage){
    let toast;
    if(type === 'success'){
        toast = document.querySelector('.success-toast')
    }
    else if(type === 'danger'){
        toast = document.querySelector('.danger-toast')
    }
    toast.querySelector('.toast-message').textContent = notifyMessage
    toast.classList.add('toast-active')

    clearTimeout(notifyTimeoutInterval)
    notifyTimeoutInterval = setTimeout(()=>{
        toast.classList.remove('toast-active')
    },3500)
}

function renderUserProfile(){
    const user = JSON.parse(localStorage.getItem('user')) || {
        username:'John Doe',
        email: 'john@example.com',
        phone: '09013151297'
    }
    /*Profile section elements*/
    const userProfileNameElem = document.querySelector('.user-profile-username')
    const userProfileEmailElem = document.querySelector('.user-profile-user-email')
    userProfileNameElem.textContent = user.username
    userProfileEmailElem.textContent = user.email

    /*Sidebar Elements*/
    const sidebarUsername = document.querySelector('.sidebar-username')
    const sidebarEmail = document.querySelector('.sidebar-email')
    sidebarUsername.textContent = user.username
    sidebarEmail.textContent = user.email

    /*Change input field values to user profile values*/
    document.querySelector('#user-name-input').value = user.username
    document.querySelector('#user-email-input').value = user.email
    document.querySelector('#user-phone-input').value  = user.phone
}
renderUserProfile()