let Complaints = new Array();
let Histories = new Array();
let Medicines = new Array();
let usedFor = ""
function addEntry(type) {
    
    const input = document.getElementById(type + "Input");
    let value = input.value.trim();
    value = value.toUpperCase();
    saveRecord(type, value)
    if (!value) return;
    if(type=='complaint'){
        Complaints.push(value)
    } else if (type == 'history'){
        Histories.push(value)
    } else if (type == 'medicine') {
        //saveRecord('dosage', document.getElementById('dosage').value);
        value = value + " " + document.getElementById('dosageInput').value
        Medicines.push(value)
    }
    

    const list = document.getElementById(type + "List");

    const item = document.createElement("div");
    item.className = "entry-item";

    const span = document.createElement("span");
    span.textContent = value;

    const delButton = document.createElement("button");
    delButton.innerHTML=`<img src="/images/delete.png" alt="" height="20px" width="20px">`
    //delButton.textContent = "Delete";
    delButton.addEventListener('click', function(event){
        console.log(list.id)
        
        if(list.id == 'complaintList') {
            let index = Complaints.indexOf(value);
            Complaints.splice(index,1)
        } else if(list.id == 'historyList') {
            let index = Histories.indexOf(value);
            Histories.splice(index,1)
        } else if (list.id == 'medicineList') {
            let index = Medicines.indexOf(value);
            Medicines.splice(index,1)
        }
        list.removeChild(item);

    })
    item.appendChild(span);
    item.appendChild(delButton);
    if(list != null) {
        list.appendChild(item);
    }
    

    input.value = "";
}

function saveRecord(type, value){
    console.log(value)
    if(value.toString().length > 0) {
        $.ajax({
            url:'/prefrences/save',
            type:'POST',
            data:{
                type,
                value:value.toString().toUpperCase(),
                usedFor
            }
        })
    }
    
}

function savePrescription(){
    $.ajax({
        url:'/patients/save/visitPad',
        type:'POST',
        data :{
            Histories,
            Complaints,
            Medicines,
            visitId:document.getElementById('visitId').value
        },
        success: function(data){
            window.location.href='/patients/getPrescription/'+document.getElementById('visitId').value
        },
        error:function(err) {
            new Noty({
                theme: 'relax',
                text: 'Error saving prescrption',
                type: 'error',
                layout: 'topRight',
                timeout: 1500
            }).show();
        }
    })
}

function updatePreferences(use) {
    if(document.getElementById(use+'_Prefs').checked) {
        if(!usedFor.includes(use)) {
            usedFor = usedFor + use + ','
        }
    } else {
        usedFor = usedFor.replace(use+',',"");
    }

    $.ajax({
        url:'/prefrences/find',
        type:'Post',
        data:{
            usedFor
        },
        success:function(data){pushPrefrences(data.prefrences)},
        error:function(err){console.log(err)}
    })
}


function pushPrefrences(items){
    let container = document.getElementById('complaint-options');
    container.innerHTML=``;
    for(let i=0;i<items.length;i++) {
        let item = document.createElement('option');
        item.innerText=items[i].Value
        item.setAttribute('value',items[i].Value);
        container.appendChild(item)
    }
}