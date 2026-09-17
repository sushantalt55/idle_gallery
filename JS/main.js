// image files are server form /content route
// image paths are fetched form data-imagepaths.txt. Which is stored in /content
// paths in the text file are addressed relative to IDLE folder.
// Preceeding part for absoulute address is strored in global imageServer var.
// imageServer points to the /content
//globals

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

var g_jsonIndex = [] // all avilabel paths indexed
var g_currentBuffer = []
var g_pageBuffer = []
var g_pages = []
var g_persons = []
var g_currentPage = ""

colcount = 4;
g_pageColCount = 3;
imageSerials = []

var g_navObject = {}
// Location of the image server. Depends on dev or prod environment
var url = window.location.hostname;
// url = 'localhost'
// url = '192.168.29.254'
var port = 80
g_imageServer = `http://${url}:${port}/content/`;
console.log(g_imageServer)


cols = []
mode = 1
page = "aishwarya-new3"
person = null



// Entry point to the app
appEntry();

function appEntry() {
    // Fetch the text file containing image paths
    // g_imageServer points upto the /content 

    fetch(g_imageServer + 'data-imagepaths.txt')
        .then(response => response.text())
        .then(data => {
            imagePaths = data.split('\n').filter(path => path.trim() !== '');
            // console.log(imagePaths)
            g_jsonIndex = []
            imagePaths.forEach(function (item, sl) {
                t = item.split('\\')
                // console.log(t)
                page = t[2]
                person = t[1]
                g_jsonIndex.push({
                    'sl': sl,
                    'url': g_imageServer + item,
                    'page': page,
                    'person': person
                })

                // g_navObject[person] = g_navObject[person] || {}
                // g_navObject[person][page] = g_navObject[person][page] || {}
                // g_navObject[person][page].items = g_navObject[person][page].items || []
                // g_navObject[person][page].items.push(item)

                g_navObject[page] = g_navObject[page] || []
                g_navObject[page].push(item)


                g_pages.push(page)
                g_persons.push(person)
            });

            g_pages = [...new Set(g_pages)]
            g_persons = [...new Set(g_persons)]


            // console.log(g_navObject)
            // console.log(g_jsonIndex)
            // console.log(g_persons)
            // Build current paths form index
            buildCurrentBuffer()

        })
        .catch(error => console.error(error));

    // while paths are fetched create the layout.
}



function buildCurrentBuffer() {
    // clearing current images while preserving the refrence.
    g_currentBuffer.length = 0
    for (var i = 0; i < 200; i++) {
        r = Math.floor(Math.random() * g_jsonIndex.length);
        // imagepath = imageServer + g_jsonIndex[r].url;
        g_currentBuffer.push(g_jsonIndex[r])
    }
    createLayout()
}



function createLayout() {
    row = document.getElementById('imagerow')
    row.replaceChildren();
    for (i = 0; i < colcount; i++) {
        col = document.createElement('div')
        col.classList.add('col-' + colcount)
        col.classList.add('column')
        row.appendChild(col)
    }

    populate()
}



function populate() {
    cols = document.querySelectorAll('.column');
    cols.forEach(function (c) {
        c.innerHTML = "";
    });

    g_currentBuffer.forEach(function (item, i) {
        var img = createImage(item)
        img.addEventListener('click', function (e) {
            showPage(e.currentTarget.getAttribute('page'))
        })
        a = i % colcount;
        cols[a].appendChild(img);
    })
    createNavPages()
}



function zoomOut() {
    if (colcount < 7) {
        colcount++;
        createLayout();
    }
}

function zoomIn() {
    if (colcount > 1) {
        colcount--;
        createLayout();
    }
}

function pageZoomOut() {
    if (g_pageColCount < 7) {
        g_pageColCount++;
        showPage()
    }
}

function pageZoomIn() {

    if (g_pageColCount > 1) {
        g_pageColCount--;
        showPage()
    }

}

function showPage(page = g_currentPage) {
    g_currentPage = page
    pageView = document.querySelector('#page-view')
    pageView.style.display = 'block'
    pageViewBody = pageView.querySelector('.page-view-body')
    pageViewBody.replaceChildren();
    for (i = 0; i < g_pageColCount; i++) {
        col = document.createElement('div')
        col.classList.add('col-' + g_pageColCount)
        col.classList.add('column')
        pageViewBody.appendChild(col)
    }

    cols = pageViewBody.querySelectorAll('.column');
    cols.forEach(function (c) {
        c.innerHTML = "";
    });

    // console.log(person,page)
    g_pageBuffer = g_jsonIndex.filter(item => {
        return item.page == page
    })
    // console.log(pageBuffer)

    g_pageBuffer.forEach(function (item, i) {
        var img = createImage(item)
        img.addEventListener('click', function (e) {
            showImage(i)
        })
        img.setAttribute('sl', i)
        a = i % g_pageColCount;
        cols[a].appendChild(img);
    })

    document.querySelector('.page-name').innerHTML = page
    // pageViewBody.querySelector('img').scrollIntoView();
    document.querySelector('.page-liked').src = 'icons/like.png'
    let pageId = "pg:" + g_currentPage;
    var liked = +localStorage.getItem(pageId)
    if (liked) {
        document.querySelector('.page-liked').src = 'icons/liked.png'
    }

}

function showImage(sl) {
    if (sl == g_pageBuffer.length) sl = g_pageBuffer.length - 1;
    if (sl < 0) sl = 0;
    imageView = document.querySelector('#image-view')
    imageView.style.display = 'block'
    imageContainer = imageView.querySelector('.image-container')
    imageContainer.replaceChildren();
    var img = createImage(g_pageBuffer[sl])
    img.setAttribute('sl', sl)
    imageContainer.appendChild(img);
    imageView.querySelector('.page-name').innerHTML = g_currentPage;
    imageView.querySelector('.image-sl').innerHTML = `${sl + 1}/${g_pageBuffer.length}`
    document.querySelector('.image-liked').src = 'icons/like.png'
    let imageId = "im:" + g_currentPage + ":" + sl
    var liked = +localStorage.getItem(imageId)
    if (liked) {
        document.querySelector('.image-liked').src = 'icons/liked.png'
    }
}


function createImage(obj) {
    var img = document.createElement("img");
    img.src = obj.url;
    img.setAttribute('person', obj.person)
    img.setAttribute('page', obj.page)
    return img
}

function closePageView() {
    document.querySelector("#page-view").style.display = "none";
}
function closeImageView() {
    document.querySelector("#image-view").style.display = "none"
    showPage(g_currentPage)
}

function nextImage() {
    sl = document.querySelector('.image-container img').getAttribute('sl')
    showImage(parseInt(sl) + 1)
}

function prevImage() {
    sl = document.querySelector('.image-container img').getAttribute('sl')
    showImage(parseInt(sl) - 1)
}

function spinImage() {
    let page = g_pages.random()
    g_currentPage = page
    g_pageBuffer = g_jsonIndex.filter(item => {
        return item.page == page
    })
    let sl = Math.floor(g_pageBuffer.length * Math.random())
    console.log(page, sl)
    // showPage(page)
    showImage(sl)
}

function nextPage() {
    showPage(g_pages[g_pages.indexOf(g_currentPage) + 1])
}
function prevPage() {
    showPage(g_pages[g_pages.indexOf(g_currentPage) - 1])
}
function spinPage() {
    showPage(g_pages.random())
}

function pageLike() {
    let pageId = "pg:" + g_currentPage;
    var liked = +(localStorage.getItem(pageId) | 0)
    if (liked == 0) {
        localStorage.setItem(pageId, 1)
    }
    else {
        localStorage.removeItem(pageId)
    }
    showPage(g_currentPage)
}

function imageLike() {
    let imageSl = +document.querySelector('.image-container img').getAttribute('sl')
    let imageId = "im:" + g_currentPage + ":" + imageSl
    let liked = +(localStorage.getItem(imageId) | 0)
    console.log(liked)
    if (liked == 0) {
        localStorage.setItem(imageId, 1)
    }
    else {
        localStorage.removeItem(imageId)
    }
    showImage(imageSl)
}

function showCurrentPage() {
    closeImageView()
}


function createNavPages() {
    let navPages = document.querySelector('.nav-pages');
    navPages.innerHTML = "";
    g_pages.forEach(function (item, i) {
        let navItem = document.createElement('div');
        navItem.classList.add('nav-item');
        let p = document.createElement('p');
        p.innerText = item;
        navItem.appendChild(p);
        let icon = document.createElement('span')
        icon.classList.add('fa')
        if (localStorage.getItem('pg:' + item))
            icon.classList.add('fa-heart')
        navItem.appendChild(icon)
        navPages.appendChild(navItem);
    })

}