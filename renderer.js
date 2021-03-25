const parser = new DOMParser();

let refreshBtn = document.querySelector('.header a');
refreshBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    fetchData(true);
});

fetchData(false);

function fetchData(isRefreshed) {
    if (isRefreshed) {
        refreshBtn.innerText = 'Loading...'
    }

    fetch('https://www.wowhead.com/news/rss/all')
    .then(response => response.text())
    .then(txt => parser.parseFromString(txt, 'text/xml'))
    .then(parser => {
        let articles = parser.querySelectorAll('item');

        let wrapper = document.querySelector('.articles');
        wrapper.innerHTML = "";

        refreshBtn.innerText = 'Refresh';

        let now = Date.now();

        articles.forEach(article => {
            let articleElement = document.createElement('article');
            wrapper.appendChild(articleElement);

            let information = document.createElement('div');
            information.className = 'information';
            articleElement.appendChild(information);

            let thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            articleElement.appendChild(thumbnail);

            let title = document.createElement('h2');
            title.innerText = article.querySelector('title').innerHTML;
            information.appendChild(title);

            let description = document.createElement('p');
            description.innerHTML = article.querySelector('description').childNodes[0].nodeValue;
            information.appendChild(description);

            let bottomInfo = document.createElement('div');
            bottomInfo.className = 'bottom-info';
            information.appendChild(bottomInfo);

            let category = document.createElement('span');
            category.innerText = article.querySelector('category').innerHTML
            bottomInfo.appendChild(category);

            let pubDateHtml = article.querySelector('pubDate').innerHTML;

            let publishDate = new Date(Date.parse(pubDateHtml));
            let pubDate = document.createElement('span');
            pubDate.innerText = `${publishDate.getDate().toString().padStart(2,'0')}/${(publishDate.getMonth() + 1).toString().padStart(2,'0')}/${publishDate.getFullYear()}`;
            bottomInfo.appendChild(pubDate);

            let pubTime = document.createElement('span');
            pubTime.innerText = timeAgo(now - Date.parse(pubDateHtml));
            bottomInfo.appendChild(pubTime);

            let link = document.createElement('a');
            link.href = 'external:' + article.querySelector('link').innerHTML;
            link.innerText = 'View';
            bottomInfo.appendChild(link);
            
            let imageUrl = article.getElementsByTagName('media:content')[0].getAttribute('url');
            let image = document.createElement('img');
            image.src = imageUrl;
            thumbnail.appendChild(image);

            image.addEventListener('mouseleave', function() {
                let lookUpImageWrapper = document.querySelector('.image-lookup');
                lookUpImageWrapper.classList.add('hide');
            });

            image.addEventListener('mouseover', function() {
                let lookUpImageWrapper = document.querySelector('.image-lookup');
                lookUpImageWrapper.classList.remove('hide');
                
                let lookUpImage = lookUpImageWrapper.querySelector('img');
                lookUpImage.src = this.src;
            });
        });
    });
}

function timeAgo(difference) {
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