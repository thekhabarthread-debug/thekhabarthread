fetch("data/news.json")
.then(response => response.json())
.then(news => {

    // Hero News
    document.getElementById("hero-category").innerText = news[0].category;

    document.getElementById("hero-title").innerText = news[0].title;

    document.getElementById("hero-summary").innerText = news[0].summary;

    document.getElementById("hero-image").src = news[0].image;

});