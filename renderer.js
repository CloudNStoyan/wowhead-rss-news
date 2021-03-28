class Article {
    constructor(title, description, category, pubDate, timeAgo, link, imageUrl, date) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.pubDate = pubDate;
        this.timeAgo = timeAgo;
        this.link = link;
        this.imageUrl = imageUrl;
        this.date = date;
    }

    ToNode() {
        let article = document.createElement('article');
        
        article.innerHTML = `
            <div class="information">
                <h2>${this.title}</h2>
                <p>${this.description}</p>
                <div class="bottom-info">
                    <span>${this.category}</span>
                    <span>${this.pubDate}</span>
                    <span data-date="${this.date}">${this.timeAgo}</span>
                    <a href="external:${this.link}">Open Article</a>
                    <a href="external:${this.imageUrl}">Open Image</a>
                </div>
            </div>
            <div class="thumbnail">
                <img src="${this.imageUrl}"/>
            </div>`;

        let lookUpImageWrapper = document.querySelector('.image-lookup');
        let image = article.querySelector('.thumbnail img');

        image.addEventListener('mouseleave', function() {
            lookUpImageWrapper.classList.add('hide');
        });

        image.addEventListener('mouseover', function() {
            lookUpImageWrapper.classList.remove('hide');
            lookUpImageWrapper.querySelector('img').src = this.src;
        });

        return article;
    }
}

const parser = new DOMParser();

let refreshBtn = document.querySelector('.header a');
refreshBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    refreshBtn.innerText = 'Loading...'
    await fetchData();
    refreshBtn.innerText = 'Refresh';

    scrollTo({top: 0, left: 0, behavior: 'smooth'});
});

let lastRefreshDate;
let lastRefresh = document.querySelector('.last-refresh');

function UpdateTimesAgo() {
    let now = Date.now();

    lastRefresh.innerText = timeAgo(now - lastRefreshDate);

    let articles = document.querySelector('.articles').children;

    for (let i = 0; i < articles.length;i++) {
        let article = articles[i];
        let time = article.querySelector('span[data-date]');
        let date = time.getAttribute('data-date');

        time.innerText = timeAgo(now - date)
    }
}

setInterval(UpdateTimesAgo, 30000);

fetchData();

let loadingTime = document.querySelector('.loading-time');

async function fetchData() {
    let startDate = Date.now();
    await fetch('https://www.wowhead.com/news/rss/all')
        .then(response => response.text())
        .then(txt => parser.parseFromString(txt, 'text/xml'))
        .then(parser => {
            loadingTime.innerText = ((Date.now() - startDate) / 1000).toFixed(3) + ' seconds';
            
            let articles = parser.querySelectorAll('item');
            DisplayArticles(articles);

            lastRefreshDate = Date.now();
            UpdateTimesAgo();
        });
}

function DisplayArticles(articles) {
    let wrapper = document.querySelector('.articles');
    wrapper.innerHTML = "";

    let now = Date.now();

    articles.forEach(article => {
        let imageNode = article.getElementsByTagName('media:content')[0];
        let imageUrl = 'https://wow.zamimg.com/images/news/teaser-image.jpg';
        if (imageNode) {
            imageUrl = imageNode.getAttribute('url');
        }
        let pubDateHtml = article.querySelector('pubDate').innerHTML;
        let pubDate = Date.parse(pubDateHtml);
        let publishDate = new Date(pubDate);
        let articleObj = new Article(
            article.querySelector('title').innerHTML,
            article.querySelector('description').childNodes[0].nodeValue, 
            article.querySelector('category').innerHTML, 
            `${publishDate.getDate().toString().padStart(2,'0')}/${(publishDate.getMonth() + 1).toString().padStart(2,'0')}/${publishDate.getFullYear()}`,
            timeAgo(now - pubDate),
            article.querySelector('link').innerHTML,
            imageUrl,
            pubDate
        );

        wrapper.appendChild(articleObj.ToNode());
    });
}

function timeAgo(difference) {
    console.log(difference);
    var result = '';

    if (difference < 5 * 1000) {
        return 'just now';
    } else if (difference < 90 * 1000) {
        return 'moments ago';
    }

    //it has minutes
    if ((difference % 1000 * 3600) > 0) {
        if (Math.floor(difference / 1000 / 60 % 60) > 0) {
            let s = Math.floor(difference / 1000 / 60 % 60) == 1 ? '' : 's';
            result = `${Math.floor(difference / 1000 / 60 % 60)} minute${s} `;
        }
    }

    //it has hours
    if ((difference % 1000 * 3600 * 60) > 0) {
        if (Math.floor(difference / 1000 / 60 / 60 % 24) > 0) {
            let s = Math.floor(difference / 1000 / 60 / 60 % 24) == 1 ? '' : 's';
            result = `${Math.floor(difference / 1000 / 60 / 60 % 24)} hour${s}${result == '' ? '' : ','} ` + result;
        }
    }

    //it has days
    if ((difference % 1000 * 3600 * 60 * 24) > 0) {
        if (Math.floor(difference / 1000 / 60 / 60 / 24) > 0) {
            let s = Math.floor(difference / 1000 / 60 / 60 / 24) == 1 ? '' : 's';
            result = `${Math.floor(difference / 1000 / 60 / 60 / 24)} day${s}${result == '' ? '' : ','} ` + result;
        }

    }

    return result + ' ago';
}