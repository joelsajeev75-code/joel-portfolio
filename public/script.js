
let editId = "";

async function loadItems() {
    const response = await fetch("/items");

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const items = await response.json();

    const list = document.getElementById("items");
    list.innerHTML = "";

    items.forEach(function(item) {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.category}</p>
            <p>${item.description}</p>
            <button onclick="editItem('${item._id}',
                '${item.title}', '${item.category}',
                '${item.description}')">Edit</button>
            <button onclick="deleteItem('${item._id}')">Delete</button>
        `;

        list.appendChild(div);
    });
}

document.getElementById("itemForm").onsubmit =
async function(event) {

    event.preventDefault();

    const item = {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value
    };

    let url = "/items";
    let method = "POST";

    if (editId !== "") {
        url = "/items/" + editId;
        method = "PUT";
    }

    await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    });

    document.getElementById("itemForm").reset();

    editId = "";

    loadItems();
};

function editItem(id, title, category, description) {

    editId = id;

    document.getElementById("title").value = title;
    document.getElementById("category").value = category;
    document.getElementById("description").value = description;
}

async function deleteItem(id) {

    if (confirm("Do you want to delete this item?")) {

        await fetch("/items/" + id, {
            method: "DELETE"
        });

        loadItems();
    }
}

async function logout() {

    await fetch("/logout", {
        method: "POST"
    });

    window.location.href = "login.html";
}

loadItems();
