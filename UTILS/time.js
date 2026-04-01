const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const date = '12-03-2026'



export function formatDate(dateString){
    const cleanedString = dateString.replaceAll('-',' ')
    const stringArray = cleanedString.split(' ') /*.split(' ') returns an array serperating each element in the string by a space character*/
    const day = stringArray[0]
    let monthNumber = stringArray[1]
    if(monthNumber.length>1){
        monthNumber = monthNumber[1]
    } /*Incase month is 0 padded e.g 04*/
    const month = months[monthNumber-1] /*Arrays are 0 indexed so subtract 1 from the month number*/
    const year = stringArray[2]
    const formattedDate = `${day} ${month} ${year}`

    return formattedDate
}


export function sortByDate(transactionsArray){
    let transactionsArrayCopy = transactionsArray.slice()
    let sortedTransactionsArray = []
    let lastTransaction;
    while(transactionsArrayCopy.length>0){
        for(let i = 0; i<transactionsArrayCopy.length; i++){
            const transaction = transactionsArrayCopy[i]
            let dateArray = transaction.date.split('-')
            let day = Number(dateArray[0])
            let month = Number(dateArray[1])
            let year = Number(dateArray[2])

            if(!lastTransaction){
                lastTransaction = transaction
                continue
            }
            let lastTransactionDateArray = lastTransaction.date.split('-')
            let lastTransactionDay = Number(lastTransactionDateArray[0])
            let lastTransactionMonth = Number(lastTransactionDateArray[1])
            let lastTransactionYear = Number(lastTransactionDateArray[2])
            
            if(year>lastTransactionYear){
                continue
            }
            else if(year<lastTransactionYear){
                lastTransaction = transaction
                continue
            }

            if(month>lastTransactionMonth){
                continue
            }
            else if(month<lastTransactionMonth){
                lastTransaction = transaction
                continue
            }

            if(day>lastTransactionDay){
                continue
            }
            else if(day<lastTransactionDay){
                lastTransaction = transaction
                continue
            }

            if(year === lastTransactionYear && month === lastTransactionMonth && day === lastTransactionDay){
                continue
            }
        }
        const lastTransactionIndex = transactionsArrayCopy.findIndex(t=>t.id === lastTransaction.id)
        transactionsArrayCopy.splice(lastTransactionIndex,1)
        sortedTransactionsArray.push(lastTransaction)
        lastTransaction = ''  
    }
    return sortedTransactionsArray
}



export function filterByDate(transactionsArray,date){
    const dateArray = date.split(' ')
    const startDate = dateArray[0]
    const startDateArray = startDate.split('-')
    const startDateDay = startDateArray[0]
    const startDateMonth = startDateArray[1]
    const startDateYear = startDateArray[2]
    const endDate = dateArray[2]
    const endDateArray = endDate.split('-')
    const endDateDay = endDateArray[0]
    const endDateMonth = endDateArray[1]
    const endDateYear = endDateArray[2]
    let filteredArray = []

    transactionsArray.forEach(transaction => {
        let dateArray = transaction.date.split('-')
        let transactionDay = dateArray[0]
        let transactionMonth = dateArray[1]
        let transactionYear = dateArray[2]
        if(transactionYear>= startDateYear  && transactionYear<= endDateYear){
            if(transactionMonth >= startDateMonth && transactionMonth<=endDateMonth){
                if(transactionDay>= startDateDay && transactionDay<= endDateDay){
                    filteredArray.push(transaction)
                }
            }
        }            
    });

    return filteredArray
}