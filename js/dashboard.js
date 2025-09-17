document.getElementById('add-entry-btn').addEventListener('click',()=>{
    const descriptionEle = document.getElementById('desc-in');
    const amtEle = document.getElementById('amt-in');

    const description = descriptionEle.value.trim();
    const amt = amtEle.value;
    const transactionType = document.getElementById('transition-type').value;

    let isValid = true;


    if(!description){
        isValid = false;
        alert('description must be provided');
    }

    if(!amt){
        isValid = false;
        alert('Amount must be provided');
    }
    else if(amt < 0){
        isValid = false;
        alert('Amount must be greater then Zero');
    }

    const monthNames = ['Jan','Fab','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec']

    const date = new Date();
    
    // const year = date.getFullYear();
    // const month = monthNames[date.getMonth()];    
    // const monthDay = date.getDate()
    

    if(isValid){
        let data={
            date:date,
            description:description,
            amount:amt,
            transactionType:transactionType,
            userId:userId
        }

        fetch("http://localhost:3000/api/transaction",{
            method:"POST",
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then((res)=>{
            if(res.status == 201){
                alert('Sucessfully Transaction added');
                descriptionEle.value = '';
                amtEle.value = '';
            }else{
                alert('Failed to added transaction')
            }
        }).catch((e)=>{
            console.log(e);
         })
        
    }

})