document.getElementById('add-entry-btn').addEventListener('click', () => {

    const descriptionEle = document.getElementById('desc-in');
    const amtEle = document.getElementById('amt-in');

    const description = descriptionEle.value.trim();
    const amt = amtEle.value;
    const transactionType = document.getElementById('transition-type').value;

    let isValid = true;

    if (!description) {
        isValid = false;
        alert('description must be provided');
    }

    if (!amt) {
        isValid = false;
        alert('Amount must be provided');
    }
    else if (amt <= 0) {
        isValid = false;
        alert('Amount must be greater then Zero');
    }

    const date = new Date();

    // const year = date.getFullYear();
    // const month = monthNames[date.getMonth()];    
    // const monthDay = date.getDate()


    if (isValid) {
        let data = {
            date: date,
            description: description,
            amount: amt,
            transactionType: transactionType,
            userId: userId
        }

        fetch("http://192.168.1.142:3000/api/transaction", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then((res) => {
            if (res.status == 201) {
                alert('Sucessfully Transaction added');
                descriptionEle.value = '';
                amtEle.value = '';

                let castedAmt = Number(amt);

                if (transactionType === 'income') {
                    income += castedAmt;
                    document.getElementById("income").innerText = `${symbol}${income}`;
                } else {
                    expense += castedAmt;
                    document.getElementById("expense").innerText = `${symbol}${expense}`;
                }

                const isExpense = transactionType == "expense";

                const type = isExpense ? "Expense" : "Income";

                const className = isExpense ? "red-500" : "green-600";

                const tableBodyObj = document.getElementById('tbody');

                const newRow = `<tr class="border-b border-[--divider]">
                                    <td class="py-2">
                                        ${monthNames[currDate.getMonth()]} ${date.getDate()}
                                    </td>
                                    <td>
                                        ${description}
                                    </td>
                                    <td class="text-${className}">
                                    ${type}
                                    </td>
                                    <td class="text-right font-medium text${className}">
                                        ${amt}
                                    </td>
                                    <td class="text-right space-x-2">
                                        <button class="update-btn text-blue-600 hover:underline">Update</button>
                                        <button class="delete-btn text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>`;

                tableBodyObj.innerHTML = newRow + `${tableBodyObj.innerHTML}`;

            } else {
                alert('Failed to added transaction')
            }
        }).catch((e) => {
            console.log(e);
        })

    }

})

function formatDateForInput(dateStr) {
    console.log(dateStr);
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
}

document.getElementById("tbody").addEventListener("click", (e) => {
    if (e.target.classList.contains("update-btn")) {
        const row = e.target.closest("tr");
        const id = row.dataset.id;
        const desc = row.children[1].innerText;
        const type = row.children[2].innerText.toLowerCase();
        const amt = row.children[3].innerText.replace(symbol, "").trim();
        const date = row.children[0].innerText;

        document.getElementById("update-desc").value = desc;
        document.getElementById("update-type").value = type;
        document.getElementById("update-amt").value = amt;
        document.getElementById("update-date").value = formatDateForInput(date);
        document.getElementById("update-modal").style.display = "flex";
        document.getElementById("save-update").dataset.id = id;
    }
});

document.getElementById("cancel-update").addEventListener("click", () => {
    document.getElementById("update-modal").style.display = "none";
});

async function getTransactionsByMonthAndYear(month, year) {
    fetch(`http://192.168.1.142:3000/api/transaction?userId=${userId}&month=${month}&year=${year}`).then(async (e) => {
        const response = await e.json();

        const data = response.data;

        let tableBody = "";
        let monthName = monthNames[month - 1];
        if (response.status == 200) {
            for (let obj of data) {

                const splitedDate = obj.date.split("T")[0].split("-");
                const isExpense = obj.isExpense;
                const type = isExpense ? "Expense" : "Income";

                const className = isExpense ? "red-500" : "green-600";


                let bodyRaw = `<tr class="border-b border-[--divider]">
                                    <td class="py-2">
                                        ${monthName} ${splitedDate[2]}
                                    </td>
                                    <td>
                                        ${obj.description}
                                    </td>
                                    <td class="text-${className}">
                                    ${type}
                                    </td>
                                    <td class="text-right font-medium text${className}">
                                        ${obj.amount}
                                    </td>
                                    <td class="text-right space-x-2">
                                        <button class="update-btn text-blue-600 hover:underline">Update</button>
                                        <button class="delete-btn text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>`;

                tableBody += bodyRaw;

            }
            document.getElementById("tbody").innerHTML = tableBody;
        }

    })
}

getTransactionsByMonthAndYear(currDate.getMonth() + 1, currDate.getFullYear())