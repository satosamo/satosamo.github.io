console.log(document.getElementById("submitButton"));
PATH = "/homepages/homepage_1/index.html"

document.getElementById("submitButton").addEventListener("click", checkPassword);
document.getElementById("passwordInput").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        checkPassword();
    }
});

async function checkPassword() {
    const input = document.getElementById("passwordInput").value;
    const messageEl = document.getElementById("message");
    
    messageEl.textContent = "";

    if (input === "dipl") {
        window.location.href = PATH;
    } else {
        messageEl.textContent = "Access Denied";
    }
}
