import { setActiveTab,getActiveTab } from "../../UTILS/navigation.js"
import { debounce } from "../../UTILS/performace.js"

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
        const debounced = debounce(togglSubmitBtnClasslist,300) /*Debounce function returns a function  that is saved in this variable*/
        debounced(input)/*The variable becomes the returned function and takes the callbacks paramaters*/
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
        notify('danger','User already exists')
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
    toast.querySelector('.toast-message').textContent = notifyMessage
    toast.classList.add('toast-active')

    notifyTimeoutInterval = setTimeout(()=>{
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


/*CTA,FORMS,MODALS LOGIC*/
const overlay = document.querySelector('.overlay')
const modals = document.querySelectorAll('.form-modal')
const modalsArray = Array.from(modals)/*Convert modals nodelist to array to gain access to methods such as arr.find()*/
const modalCloseBtns = document.querySelectorAll('.modal-close-btn')
const openFormButtons = document.querySelectorAll('.open-form-btns')
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
}
function closeModal(modal){
    activeModal = modalsArray.find(m=>m.getAttribute('id') === modal)
    activeModal.classList.remove('modal-active')
}


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