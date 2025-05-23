
let Items = new Array();
let counter = 0
let total = 0
let patient
function addItems() {
    let itemName = document.getElementById('Item').value
    let quantity = document.getElementById('Quantity').value
    if(!itemName || itemName == '' || !quantity || quantity == ''){
        new Noty({
            theme: 'relax',
            text: 'Name & quantity is mandatory',
            type: 'error',
            layout: 'topRight',
            timeout: 1500
        }).show();
        return 
    }

    $.ajax({
        url: '/inventory/getItemByName/',
        type: 'Get',
        data: {
            name:itemName,
            quantity
        },
        success: function (data) {
            console.log(data)
            if(data.totalQty >= quantity) {
                addItemToUI(itemName, data.price, quantity, data.batch, data.expiry, data.notes, data.totalQty, data.avgAlertQty)
            } else {
                new Noty({
                    theme: 'relax',
                    text: 'Insufficient stock',
                    type: 'error',
                    layout: 'topRight',
                    timeout: 1500
                }).show();
                return 
            }
        },
        error: function (err) {}
    })
}

function addItemToUI(itemName, itemPrice, quantity, batch, expiry, notes, totalQnty, alertQty) {
    if(notes == undefined) {
        notes = ""
    }
    console.log("Data received at function")
    let bgColor
    if(totalQnty - quantity <= alertQty) {
        bgColor = "#f5031d9c"
    } else {
        bgColor = "transparent"
    }
     
    console.log(itemName)
    console.log(itemPrice)
    console.log(quantity)
    console.log(batch)
    console.log(expiry)
    let container = document.getElementById('itemsTableBody');
    let rowItem = document.createElement('tr');
    rowItem.id='rowItem_'+ (counter+1)
    rowItem.innerHTML =
        `
        <tr>
            <td>${++counter}</td>
            <td>${itemName}</td>
            <td id='price_${counter}'>${itemPrice}</td>
            <td id='qty_${counter}'>${quantity}</td>
            <td>${batch}</td>
            <td>${expiry}</td>
            <td>
                <span id="dustbinDark${counter}" onmouseover = "highlight(${counter})" onmouseout = "unhighlight(${counter})" style="display:inline-block; margin: 1%;" onclick="deleteItem(${counter})"><i class="fa-solid fa-trash-can"></i> </span>
                <span id="dustbinLight${counter}" onmouseover = "highlight(${counter})" onmouseout = "unhighlight(${counter})" style="display:none; margin: 1%;" onclick="deleteItem(${counter})"><i class="fa-regular fa-trash-can"></i> </span>
            </td>
            <td style="background-color: ${bgColor};">${totalQnty-quantity}</td>
        </tr>
    `
    container.appendChild(rowItem)
    Items.push(itemName + '$' + quantity + '$' + itemPrice + '$' + notes);
    total = total + +itemPrice*quantity
    document.getElementById('Item').value = ''
    document.getElementById('Quantity').value = ''
    document.getElementById('total').innerText = total
}

function unhighlight(x) {
    document.getElementById('dustbinDark'+x).style.display = "block";
    document.getElementById('dustbinLight'+x).style.display = "none";
}

function highlight(x) {
    document.getElementById('dustbinDark'+x).style.display = "none";
    document.getElementById('dustbinLight'+x).style.display = "block";
}

function deleteItem(counter){
    console.log('deleting item on position '+ (counter - 1))
    Items.splice(counter-1, 1, '');
    let itemPrice = parseInt(document.getElementById('price_'+counter).innerText)
    let itemQty = parseInt(document.getElementById('qty_'+counter).innerText)
    total = total - itemPrice*itemQty
    document.getElementById('rowItem_'+counter).remove()
    document.getElementById('total').innerText = total
}

function saveBill() {
    document.getElementById('addPayment').setAttribute('disabled', 'true')
    let id = document.getElementById('patientId').value;
    let cashPayment = parseInt(document.getElementById('cashPayment').value)
    let onlinePayment = parseInt(document.getElementById('onlinePayment').value)
    if(cashPayment + onlinePayment != parseInt(total)){
        new Noty({
            theme: 'relax',
            text: 'Total mismatch',
            type: 'error',
            layout: 'topRight',
            timeout: 1500
        }).show();
        return;
    }
    $.ajax({
        url: '/sales/saveBill',
        type: 'Post',
        data: {
            Type:document.getElementById('billType').value,
            Items,
            patient,
            Total:total,
            cashPayment,
            onlinePayment,
            id
        },
        success: function (data) {
            window.open('/sales/bill/view/' + data.Bill_id)
            window.location.reload()
        },
        error: function (err) {}
    })
}


function autoFillPatients() {
    let id = document.getElementById('patientId').value
    $.ajax({
        url: '/patients/getPatientById/' + id,
        type: 'Get',
        success: function (data) {
            document.getElementById('patName').value = data.patient.Name;
            document.getElementById('age').value = data.patient.Age;
            document.getElementById('gender').value = data.patient.Gender;
            document.getElementById('address').value = data.patient.Address;
            document.getElementById('mobile').value = data.patient.Mobile;
            document.getElementById('docName').value = data.patient.Doctor;
            document.getElementById('IdProof').value = data.patient.IdProof;
            new Noty({
                theme: 'relax',
                text: 'Patient setup done',
                type: 'success',
                layout: 'topRight',
                timeout: 1500
            }).show();
        },
        error: function (data) {
            document.getElementById('patName').value = '';
            document.getElementById('age').value = '';
            document.getElementById('gender').value = '';
            document.getElementById('address').value = '';
            document.getElementById('mobile').value = '';
            document.getElementById('docName').value = '';
            document.getElementById('patientId').value = ''
            document.getElementById('IdProof').value = '';
            new Noty({
                theme: 'relax',
                text: 'No data found',
                type: 'warning',
                layout: 'topRight',
                timeout: 1500
            }).show();
        }
    })
}

function closePopup(){
    document.getElementById('paymentPoppup').style.display='none'
}

function openPopup(){
    document.getElementById('paymentPoppup').style.display='block'
}

function setuppayments(){
    let cash = parseInt(document.getElementById('cashPayment').value);
    document.getElementById('onlinePayment').value = total - cash
}

function checkValidations(){
    
    let idProof=''
    if(document.getElementById('IdProof')){
        idProof = document.getElementById('IdProof').value;
    }
    patient = {
        Name: document.getElementById('patName').value,
        Age: document.getElementById('age').value,
        Gender: document.getElementById('gender').value,
        Address: document.getElementById('address').value,
        Mobile: document.getElementById('mobile').value,
        Doctor: document.getElementById('docName').value,
        IdProof : idProof
    }
    
    if (patient.Name == '' || patient.Age == '' || patient.Gender == '' || patient.Address == '' || patient.Mobile == '' || patient.Doctor == '') {
        new Noty({
            theme: 'relax',
            text: 'All Patient details are mandatory',
            type: 'error',
            layout: 'topRight',
            timeout: 1500
        }).show();
        return
    }
    if (Items.length < 1) {
        new Noty({
            theme: 'relax',
            text: 'Can not save empty report',
            type: 'error',
            layout: 'topRight',
            timeout: 1500
        }).show();
        return
    }

    openPopup();
    
}