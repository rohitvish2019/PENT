let Complaints = new Array();
let histories = new Array()
function addEntry(type) {
    const input = document.getElementById(type + "Input");
    const value = input.value.trim();
    if(type=='complaint'){
        Complaints.push(value)
    } else if (type == 'history'){
        histories.push(value)
    }
    if (!value) return;

    const list = document.getElementById(type + "List");

    const item = document.createElement("div");
    item.className = "entry-item";

    const span = document.createElement("span");
    span.textContent = value;

    const delButton = document.createElement("button");
    delButton.textContent = "Delete";
    delButton.addEventListener('click', function(event){
        console.log(list.id)
        list.removeChild(item);
        if(list.id == 'complaintList') {
            let index = Complaints.indexOf(item);
            Complaints.splice(index,1)
        } else if(list.id == 'historyList') {
            let index = histories.indexOf(item);
            histories.splice(index,1)
        }

    })
    item.appendChild(span);
    item.appendChild(delButton);
    list.appendChild(item);

    input.value = "";
}