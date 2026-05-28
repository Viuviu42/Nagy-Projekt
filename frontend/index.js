const hely = "http://localhost:3080/";


function regisztracio(){
    fetch(hely + "regisztracio", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        dataType: "json",
        body: JSON.stringify({
            email : document.getElementById("email").value,
            name :  document.getElementById("name").value,
            bolt : document.getElementById("bolt").checked,
            pwd : document.getElementById("pwd").value })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            window.location.href = "index.html";
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}


function bejelentkezes(){
    fetch(hely + "bejelentkezes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        dataType: "json",
        body: JSON.stringify({
            email: document.getElementById("email").value,
            pwd: document.getElementById("password").value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            sessionStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "bolt.html";
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

async function Bolt() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    document.getElementById("welcome").textContent = `Üdvözlünk, ${user.name}!`;
    const inputTer = document.getElementById("input_ter");
    const termekekTable = document.getElementById("termekek");
    const sz_hely = document.getElementById("sz_hely");
    if (user.bolt) {
        // termék kezelés + új feltöltése
        const nameInput = document.createElement("input");
        nameInput.placeholder = "Termék neve";
        const priceInput = document.createElement("input");
        priceInput.placeholder = "Termék ára";
        priceInput.type = "number";
        const raktaronInput = document.createElement("input");
        raktaronInput.type = "checkbox";
        const raktaronLabel = document.createElement("label");
        raktaronLabel.textContent = "Raktáron";
        raktaronLabel.appendChild(raktaronInput);
        const saveButton = document.createElement("button");
        saveButton.textContent = "Mentés";
        saveButton.addEventListener("click", async () => {
            const name = nameInput.value;
            const price = priceInput.value;
            const raktaron = raktaronInput.checked;
            if (!name || !price) {
                alert("Kérem töltse ki a termék nevét és árát!");
                return;
            }
            const ize = await createProduct(user.name, name, price, raktaron);
            console.log(ize)
            nameInput.value = "";
            priceInput.value = "";
            ///location.reload();
        });
        inputTer.appendChild(nameInput);
        inputTer.appendChild(priceInput);
        inputTer.appendChild(raktaronLabel);
        inputTer.appendChild(saveButton);
        const DBproducts = await getAll("products");
        if (!DBproducts) {
            alert("Hiba történt az adatok lekérésekor.");
            return;
        }
        tableMaker(DBproducts, termekekTable);
        const saveAllButton = document.createElement("button");
        saveAllButton.textContent = "Összes mentése";
        saveAllButton.addEventListener("click", () => {
            const valasz = 0;
            termekekTable.querySelectorAll("tr:not(:first-child)").forEach(async row => {
                const id = row.id;
                const name = row.cells[0].querySelector("input").value;
                const price = row.cells[1].querySelector("input").value;
                const raktaron = row.cells[2].querySelector("input").checked;
                 valasz = await updateProduct(id, name, price, raktaron);
            });
            location.reload();
            console.log(valasz)
            
        });
        sz_hely.appendChild(saveAllButton);

    }
    else{
        const kedvencekLink = document.createElement("a");
        kedvencekLink.href = "kedvencek.html";
        kedvencekLink.textContent = "Kedvenceim";
        document.getElementById("nav").appendChild(kedvencekLink);
        const kereses = document.createElement("input");
        kereses.placeholder = "Keresés...";
        const keresesButton = document.createElement("button");
        keresesButton.textContent = "Keresés";
        keresesButton.addEventListener("click", async () => {
            const searchTerm = kereses.value.trim();
            if (!searchTerm) return;
            termekekTable.innerHTML = "";
            try {
                const response = await fetch(hely + "keres/" + encodeURIComponent(searchTerm));
                const termekek = await response.json();
                if (termekek.error) {
                    alert(termekek.error);
                    return;
                }
                tableMaker(termekek, termekekTable);
            } catch (error) {
                console.error("Error:", error);
            }
        });
        inputTer.appendChild(kereses);
        inputTer.appendChild(keresesButton);
    }

}

function Kedvencek(){
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    if (user.bolt) {
        window.location.href = "bolt.html";
        return;
    }
    fetch(hely + "kedvenc/" + user.name)
    .then(response => response.json())
    .then(data => {
        document.getElementById("welcome").textContent = `Üdvözlünk, ${user.name}!`;
        const termekekTable = document.getElementById("kedvencek");
        kedvencekTableMaker(data, termekekTable);
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Hiba történt az adatok lekérésekor.");
    });

}

async function getAll(type){
    try {
        const response = await fetch(hely + "getAll/" + type);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        alert("Hiba történt az adatok lekérésekor.");
        return null;
    }
}

async function deleteItem(type, id){
    try {
        const response = await fetch(hely + "delete/" + type + "/" + id, {
            method: "DELETE"
        });
        const data = await response.json();
    } catch (error) {
        console.error("Error:", error);
        alert("Hiba történt a törlés során.");
    }
}

async function createProduct(user_name, name, price, raktaron){
    try {
        const response = await fetch(hely + "bolt", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ user_name, name, price, raktaron })
        });
        const data = await response.json();
        if (data.error) alert(data.error);
        return data.message
    } catch (error) {
        console.error("Error:", error);
        alert("Hiba történt a termék létrehozásakor.");
    }
}

async function updateProduct(id, name, price, raktaron){ // nem működik
    try {
        const response = await fetch(hely + "bolt/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ name, price, raktaron })
        });
        const data = await response.json();
        if (data.error) return data.error;
        return data.message;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteKedvenc(id){
    try {
        const response = await fetch(hely + "kedvenc/" + id, {
            method: "DELETE"
        });
        const data = await response.json();
        if (data.error) alert(data.error);
    } catch (error) {
        console.error("Error:", error);
        alert("Hiba történt a törlés során.");
    }
}

function kedvencekTableMaker(favorites, table){
    const header = table.insertRow();
    header.insertCell().textContent = "Név";
    header.insertCell().textContent = "Ár";
    header.insertCell().textContent = "Raktáron";
    header.insertCell().textContent = "Bolt";
    header.insertCell().textContent = "";
    favorites.forEach(item => {
        const row = table.insertRow();
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.price + " Ft";
        row.insertCell().textContent = item.raktaron ? "Igen" : "Nem";
        row.insertCell().textContent = item.user_name;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Törlés";
        deleteButton.addEventListener("click", async () => {
            await deleteKedvenc(item.id);
            table.deleteRow(row.rowIndex);
        });
        row.insertCell().appendChild(deleteButton);
    });
}

function tableMaker(DBproducts, termekekTable){
    const header = termekekTable.insertRow();
        header.insertCell().textContent = "Név";
        header.insertCell().textContent = "Ár";
        header.insertCell().textContent = "Raktáron";
        DBproducts.forEach(product => {
            const row = termekekTable.insertRow();
            row.id = `${product.id}`;
            const inputName = document.createElement("input");
            inputName.value = product.name;
            const inputPrice = document.createElement("input");
            inputPrice.value = product.price;
            const raktáron = document.createElement("input");
            raktáron.type = "checkbox";
            raktáron.checked = product.raktaron;
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Törlés";
            row.insertCell().appendChild(inputName);
            row.insertCell().appendChild(inputPrice);
            row.insertCell().appendChild(raktáron);
            row.insertCell().appendChild(deleteButton);
            deleteButton.addEventListener("click", () => {
                deleteItem("products", row.id);
                termekekTable.deleteRow(row.rowIndex);
            });
        });}
