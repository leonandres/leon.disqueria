document.addEventListener("DOMContentLoaded", () => {

    console.log("DOMContentLoaded se disparó");

    const menu = document.getElementById("navbar");
    const footer = document.getElementById("footer");

    if (menu) {
        fetch("nav.html")
            .then(response  => response.text())
            .then(data      => menu.innerHTML = data)
    }

    if (footer) {
        fetch("footer.html")
            .then(response  => response.text())
            .then(data      => footer.innerHTML = data)
    }
})