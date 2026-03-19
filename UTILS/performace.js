
export function debounce(callback,time){
    let timeoutId
    return function(...args){
        clearTimeout(timeoutId)
        timeoutId = setTimeout(()=>{
            callback(...args)
        },time)
    }
}