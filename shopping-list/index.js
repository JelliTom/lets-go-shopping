import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, get, child, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"


const appSettings = {
    databaseURL: "https://realtime-database-6b1c7-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const dbRootRef = ref(database, '/');

const inputFieldEl = document.getElementById("input-field");
const listSelectFieldEl = document.getElementById("list-select-field");
const addButtonEl = document.getElementById("add-button");
const notifierContainerEl = document.getElementById("notifier-container");
const itemListEl = document.getElementById("item-list");
const catImg = document.getElementById("cat-img");
const mainContentEl = document.getElementById("main-content");
const loaderEl = document.getElementById("loader");
let currentRef = ref(database, "items");

listSelectFieldEl.addEventListener("input", function () {
    if (listSelectFieldEl.value.trim() !== "") {
        console.log("updated list");
        currentRef = ref(database, listSelectFieldEl.value.toLowerCase());
    }
});

listSelectFieldEl.addEventListener("change", async function () {
    let inputValue = listSelectFieldEl.value;
    if (inputValue == "") {
        return;
    }
    else {
        currentRef = ref(database, listSelectFieldEl.value);
        onValue(currentRef, function (snapshot) {
            let snapVal = snapshot.val();
            if (snapVal === null) {
                console.log("No items in the database");
                itemListEl.innerHTML = "No Items yet ...";
                return;
            }
            let itemsArray = Object.entries(snapshot.val());
            console.log(itemsArray);
            clearItems(itemListEl);
            for (let i = 0; i < itemsArray.length; i++) {
                let currentBookEntry = itemsArray[i]
                addItem(itemListEl, currentBookEntry);
            }
        });
        const snapshot = await get(currentRef);
        let snapVal = snapshot.val();
        if (snapVal === null) {
            console.log("No items in the database");
            itemListEl.innerHTML = "No Items yet ...";
            return;
        }
        let itemsArray = Object.entries(snapshot.val());
        console.log(itemsArray);
        clearItems(itemListEl);
        for (let i = 0; i < itemsArray.length; i++) {
            let currentBookEntry = itemsArray[i]
            addItem(itemListEl, currentBookEntry);
        }
    }
});

window.addEventListener("load", function () {
    listSelectFieldEl.value = "items"; // Force default value
    currentRef = ref(database, "items"); // Reset database reference
    setTimeout(() => {
        loaderEl.classList.add("hidden");
        mainContentEl.classList.remove("hidden");
        mainContentEl.classList.add("visible");
    }, 3000);
});


onValue(dbRootRef, (snapshot) => {
    console.log("Here are your top-level references (keys):");
    let currentSelect = listSelectFieldEl.value;

    // Check if there's any data at the root
    if (snapshot.exists()) {
        clearItems(listSelectFieldEl);
        // Iterate through each child (which represents a top-level reference)
        snapshot.forEach((childSnapshot) => {
            const topLevelKey = childSnapshot.key; // This is the name of your reference!
            console.log(`- ${topLevelKey}`);
            if (childSnapshot.key == currentSelect) {
                listSelectFieldEl.innerHTML += `<option selected="selected" value="${topLevelKey}">${topLevelKey}</option>`;
            } else {
                listSelectFieldEl.innerHTML += `<option value="${topLevelKey}">${topLevelKey}</option>`;
            }

            // If you also wanted to see the data under that reference:
            // const dataUnderRef = childSnapshot.val();
            // console.log(`  Data:`, dataUnderRef);
        });

    } else {
        console.log("Your database root is empty!");
    }
});


function clearField(field) {
    field.value = "";
}
function updateButtonState() {
    console.log("checking state")
    if (inputFieldEl.value.trim() === "") {
        console.log("disabled")
        addButtonEl.disabled = true;
    } else {
        addButtonEl.disabled = false;
        console.log("enabled")
    }
}

// Check on page load
updateButtonState();

// Check every time the user types
inputFieldEl.addEventListener("input", updateButtonState);

catImg.addEventListener("click", function () {
    console.log("img clicked");

    catImg.classList.toggle("grow");
    setTimeout(() => {
        catImg.classList.remove("grow");
    }, 100);

});


function addItem(itemList, item) {
    const listItem = document.createElement("li");
    listItem.className = "item";
    listItem.textContent = item[1];
    itemList.appendChild(listItem);
    listItem.addEventListener("dblclick", function () {
        console.log(`you double clicked on ${item[1]}`);
        const keyToDelete = item[0];
        console.log(`Deleting item with key: ${keyToDelete}`);
        console.log(currentRef)
        let specificItemRef = child(currentRef, keyToDelete);
        remove(specificItemRef);
    });

}

function clearItems(itemList) {
    itemList.innerHTML = "";
}

inputFieldEl.onkeydown = function (event) {
    if (event.key === "Enter") {
        addButtonEl.click();
    }
};

addButtonEl.addEventListener("click", function () {
    let inputValue = inputFieldEl.value;
    if (inputValue == "") {
        return;
    }
    console.log("calling")
    console.log(`Adding item: ${inputValue}`);
    clearField(inputFieldEl)
    updateButtonState();
    notifierContainerEl.innerHTML = `Added <strong>${inputValue}</strong> to the list`;
    notifierContainerEl.classList.remove("hidden");
    notifierContainerEl.classList.add("visible");

    push(currentRef, inputValue)

    setTimeout(() => {
        notifierContainerEl.classList.remove("visible");
        notifierContainerEl.classList.add("hidden");
    }, 500);

});



onValue(currentRef, function (snapshot) {
    let snapVal = snapshot.val();
    if (snapVal === null) {
        console.log("No items in the database");
        itemListEl.innerHTML = "No Items yet ...";
        return;
    }
    let itemsArray = Object.entries(snapshot.val());
    console.log(itemsArray);
    clearItems(itemListEl);
    for (let i = 0; i < itemsArray.length; i++) {
        let currentBookEntry = itemsArray[i]
        addItem(itemListEl, currentBookEntry);
        // itemListEl.lastElementChild.addEventListener("dblclick", function () {
        //     console.log(`you double clicked on ${currentBookEntry[1]}`);
        //     const keyToDelete = currentBookEntry[0];
        //     const specificItemRef = child(itemsInDB, keyToDelete);
        //     remove(specificItemRef);
        // });
    }
});
