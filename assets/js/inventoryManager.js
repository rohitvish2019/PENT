function getAllInventories () {
    $.ajax({
        url:'/inventory/getAll/available',
        type:'GET',
        success: function(data){
            showInventories(data.items)
        },
        error: function(err){}
    })
}

function showInventories(items) {
    let container = document.getElementById('inventoryTableBody');
    container.innerHTML=``;
    for(let i=0;i<items.length;i++) {
        let item = document.createElement('tr');
        item.innerHTML=
        `
            <td>${items[i].Name}</td>
            <td>${items[i].TotalQuantity}</td>
            <td><input type=number></td>
            <td>${items[i].AlertQty}</td>
            <td>${items[i].ExpiryDate}</td>
            <td>${items[i].Batch}</td>
            <td></td>
            <td></td>
        `
        container.appendChild(item)
    }
}

getAllInventories();