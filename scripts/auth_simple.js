console.log(document.getElementById("submitButton"));
PATH_DIPL = "/homepages/homepage_dipl/index.html"
PATH_COMPBIO = "/homepages/homepage_compbio/index.html"

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
        window.location.href = PATH_DIPL;
    } else if (input === "compbio") {
        window.location.href = PATH_COMPBIO;
    } else {
        messageEl.textContent = "Access Denied";
    }
}
