fetch("data/news.json")
.then(response => response.json())
.then(news => {

    // ===== HERO =====

    document.getElementById("hero-category").innerText = news[0].category;

    document.getElementById("hero-title").innerText = news[0].title;

    document.getElementById("hero-summary").innerText = news[0].summary;

    document.getElementById("hero-image").src = news[0].image;


    // ===== LATEST NEWS =====

    const grid = document.getElementById("news-grid");

    news.forEach(item=>{

        grid.innerHTML += `

        <div class="card">

            <img src="${item.image}" class="card-image">

            <h3>${item.title}</h3>

            <p>${item.summary}</p>

            <a href="${item.link}" class="read-btn">
                पूरा पढ़ें →
            </a>

        </div>

        `;

    });

});