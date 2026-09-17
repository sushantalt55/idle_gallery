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

var colcount = 4;
var g_pageColCount = 3;
var g_imageZoom = 1;

var g_navObject = {}
// Location of the image server. Depends on dev or prod environment
var url = window.location.hostname;
// url = 'localhost'
// url = '192.168.29.254'
var port = 80
var g_imageServer = `http://${url}:${port}/content/`;
console.log(g_imageServer)



// Entry point to the app
appEntry();

function appEntry() {
    // Fetch the text file containing image paths
    // g_imageServer points upto the /content

    let side = document.querySelector('.side')
    if (localStorage.getItem('sidebarHidden')) {
        // Start hidden without playing the slide animation on page load
        side.style.transition = 'none'
        document.body.classList.add('sidebar-hidden')
        side.offsetWidth
        side.style.transition = ''
    }
    side.addEventListener('wheel', stopSideScroll, { passive: true })
    side.addEventListener('touchstart', stopSideScroll, { passive: true })

    let search = document.querySelector('#page-search')
    search.addEventListener('input', filterNavPages)
    search.addEventListener('keydown', function (e) {
        if (e.key == 'Escape') clearSearch()
    })

    document.addEventListener('mousemove', wakeControls)
    let imageBody = document.querySelector('.image-view-body')
    imageBody.addEventListener('wheel', onImageWheel, { passive: false })
    imageBody.addEventListener('pointerdown', startImagePan)
    imageBody.addEventListener('pointermove', moveImagePan)
    imageBody.addEventListener('pointerup', endImagePan)
    imageBody.addEventListener('pointercancel', endImagePan)
    window.addEventListener('scroll', maybeLoadMore, { passive: true })
    window.addEventListener('resize', maybeLoadMore)

    fetch(g_imageServer + 'data-imagepaths.txt')
        .then(response => response.text())
        .then(data => {
            let imagePaths = data.split('\n').map(path => path.trim()).filter(path => path !== '');
            g_jsonIndex = []
            imagePaths.forEach(function (item, sl) {
                let t = item.split('\\')
                let page = t[2]
                let person = t[1]
                g_jsonIndex.push({
                    'sl': sl,
                    'url': g_imageServer + item,
                    'page': page,
                    'person': person,
                    'file': t[t.length - 1]
                })

                g_navObject[page] = g_navObject[page] || []
                g_navObject[page].push(item)


                g_pages.push(page)
                g_persons.push(person)
            });

            g_pages = [...new Set(g_pages)]
            g_persons = [...new Set(g_persons)]

            migrateImageLikes()
            createNavPages()

            // Build current paths form index
            buildCurrentBuffer()

        })
        .catch(error => console.error(error));

    // while paths are fetched create the layout.
}



// "Shuffle" button: pick a new random set for the grid
function render() {
    if (g_jsonIndex.length == 0) return;
    buildCurrentBuffer()
    window.scrollTo({ top: 0 })
}

function buildCurrentBuffer() {
    // clearing current images while preserving the refrence.
    g_currentBuffer.length = 0
    for (let i = 0; i < g_settings.gridCount; i++) {
        let r = Math.floor(Math.random() * g_jsonIndex.length);
        g_currentBuffer.push(g_jsonIndex[r])
    }
    createLayout()
}



function createLayout() {
    let row = document.getElementById('imagerow')
    g_loadingMore = false
    document.querySelector('.grid-end').classList.add('hidden')
    fillColumns(row, colcount, g_currentBuffer, function (item) {
        showPage(item.page)
    })
}

// Start a fresh set of columns in the container and load the first images into them
function fillColumns(container, colCount, items, onClick) {
    container.replaceChildren()

    let cols = []
    for (let i = 0; i < colCount; i++) {
        let col = document.createElement('div')
        col.classList.add('column')
        container.appendChild(col)
        cols.push(col)
    }

    // Everything the container needs to keep adding images later
    container.layout = { token: {}, cols: cols, onClick: onClick, ready: [], next: 0, count: 0 }
    queueImages(container, items)
}

// Add images to a container laid out by fillColumns. Each image goes into the
// shortest column once it has loaded, so columns end up roughly even. Images are
// still added in their original order, so albums read in sequence.
function queueImages(container, items, done) {
    let layout = container.layout
    let token = layout.token
    let start = layout.count
    let left = items.length
    layout.count += items.length

    items.forEach(function (item, batchIndex) {
        let i = start + batchIndex
        let img = createImage(item)
        img.setAttribute('sl', i)
        img.addEventListener('click', function () {
            layout.onClick(item, i)
        })

        let settle = function (ok) {
            // A newer layout replaced this one (zoom, shuffle, other album)
            if (container.layout.token !== token) return
            layout.ready[i] = ok ? img : null
            while (layout.next < layout.count && layout.ready[layout.next] !== undefined) {
                if (layout.ready[layout.next]) shortestColumn(layout.cols).appendChild(layout.ready[layout.next])
                layout.next++
            }
            left--
            if (left == 0 && done) done()
        }
        img.addEventListener('load', function () { settle(true) })
        img.addEventListener('error', function () { settle(false) })
    })
}

// Infinite scroll: keep adding batches to the main grid as it nears the bottom
var g_loadingMore = false
var MAX_GRID_IMAGES = 2000

function maybeLoadMore() {
    if (!g_settings.infinite || g_loadingMore || g_jsonIndex.length == 0) return;
    // The album view has its own scrolling and is always complete
    if (document.querySelector('#page-view').style.display == 'block') return;
    if (g_currentBuffer.length >= MAX_GRID_IMAGES) {
        document.querySelector('.grid-end').classList.remove('hidden')
        return;
    }
    if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 1200) return;

    let batch = []
    for (let i = 0; i < g_settings.gridCount; i++) {
        batch.push(g_jsonIndex[Math.floor(Math.random() * g_jsonIndex.length)])
    }
    g_currentBuffer.push(...batch)
    g_loadingMore = true
    queueImages(document.getElementById('imagerow'), batch, function () {
        g_loadingMore = false
        maybeLoadMore()
    })
}

function shortestColumn(cols) {
    return cols.reduce((a, b) => b.offsetHeight < a.offsetHeight ? b : a)
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
    if (!page) return;
    g_currentPage = page
    let pageView = document.querySelector('#page-view')
    let opening = pageView.style.display != 'block'
    pageView.style.display = 'block'
    let pageViewBody = pageView.querySelector('.page-view-body')

    g_pageBuffer = g_jsonIndex.filter(item => {
        return item.page == page
    })

    if (pageViewBody.dataset.page != page) pageView.scrollTop = 0
    pageViewBody.dataset.page = page
    fillColumns(pageViewBody, g_pageColCount, g_pageBuffer, function (item, i) {
        showImage(i)
    })

    pageView.querySelector('.page-name').innerText = page
    setLikeButton(pageView.querySelector('.page-liked'), localStorage.getItem("pg:" + g_currentPage))

    if (opening) wakeControls()
    highlightNavPage(true)
}

// Mark the open album in the sidebar and scroll it into view
function highlightNavPage(scroll) {
    let pageOpen = document.querySelector('#page-view').style.display == 'block'
    document.querySelectorAll('.nav-pages .nav-item').forEach(function (navItem) {
        let active = pageOpen && navItem.getAttribute('page') == g_currentPage
        navItem.classList.toggle('active', active)
        if (active && scroll && !isNavItemInView(navItem)) scrollNavItemToCenter(navItem)
    })
}

var g_sideScrollFrame = null

// Smoothly scroll the sidebar so the item sits in the middle of the album list.
// Uses a custom animation because the browser's smooth scroll is too quick to follow.
function scrollNavItemToCenter(navItem) {
    let side = document.querySelector('.side')
    let panelHeight = document.querySelector('.search-panel').offsetHeight
    let visibleHeight = side.clientHeight - panelHeight
    let maxScroll = side.scrollHeight - side.clientHeight
    let target = navItem.offsetTop - panelHeight - (visibleHeight - navItem.offsetHeight) / 2
    target = Math.max(0, Math.min(maxScroll, target))

    cancelAnimationFrame(g_sideScrollFrame)
    let start = side.scrollTop
    let distance = target - start
    let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // No point animating a sidebar nobody can see
    if (reduceMotion || document.body.classList.contains('sidebar-hidden') || Math.abs(distance) < 1) {
        side.scrollTop = target
        return
    }

    // 500ms for short hops, up to 800ms for long jumps
    let duration = 500 + Math.min(Math.abs(distance), 3000) / 10
    let startTime = null
    function step(time) {
        if (startTime === null) startTime = time
        let t = Math.min((time - startTime) / duration, 1)
        let eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        side.scrollTop = start + distance * eased
        if (t < 1) g_sideScrollFrame = requestAnimationFrame(step)
    }
    g_sideScrollFrame = requestAnimationFrame(step)
}

// Let the user take over if they scroll the sidebar mid-animation
function stopSideScroll() {
    cancelAnimationFrame(g_sideScrollFrame)
}

// True when the item is fully visible below the pinned search panel
function isNavItemInView(navItem) {
    let item = navItem.getBoundingClientRect()
    let top = document.querySelector('.search-panel').getBoundingClientRect().bottom
    let bottom = document.querySelector('.side').getBoundingClientRect().bottom
    return item.height > 0 && item.top >= top - 1 && item.bottom <= bottom + 1
}

// Top-left icon: show or hide the sidebar. The choice is remembered.
function toggleSidebar() {
    let hidden = document.body.classList.toggle('sidebar-hidden')
    if (hidden) {
        localStorage.setItem('sidebarHidden', 1)
        // The settings panel lives in the sidebar's place
        closeSettings()
    }
    else {
        localStorage.removeItem('sidebarHidden')
        highlightNavPage(true)
    }
}

var g_idleTimer = null

// Show the floating arrow buttons, then fade them out after 2s without mouse movement
function wakeControls() {
    document.body.classList.remove('controls-idle')
    clearTimeout(g_idleTimer)
    if (!g_settings.autoHideNav) return;
    g_idleTimer = setTimeout(function () {
        // Keep them while the pointer rests on one
        if (document.querySelector('.nav-btn:hover')) return wakeControls()
        document.body.classList.add('controls-idle')
    }, 2000)
}

function showImage(sl) {
    if (sl >= g_pageBuffer.length) sl = g_pageBuffer.length - 1;
    if (sl < 0) sl = 0;
    let imageView = document.querySelector('#image-view')
    let opening = imageView.style.display != 'block'
    imageView.style.display = 'block'
    let imageContainer = imageView.querySelector('.image-container')
    imageContainer.replaceChildren();
    let img = createImage(g_pageBuffer[sl])
    img.setAttribute('sl', sl)
    img.addEventListener('dblclick', function () {
        setImageZoom(g_imageZoom == 1 ? 2 : 1)
    })
    imageContainer.appendChild(img);
    setImageZoom(1)
    imageView.querySelector('.page-name').innerText = g_currentPage;
    imageView.querySelector('.image-sl').innerText = `${sl + 1} / ${g_pageBuffer.length}`
    setLikeButton(imageView.querySelector('.image-liked'), localStorage.getItem(imageLikeId(g_pageBuffer[sl])))
    if (opening) wakeControls()
}

var MAX_IMAGE_ZOOM = 8

// Fit the image to the screen (1) or enlarge it to `level` times the fitted size.
// keepScroll is for wheel zooming, which positions the image itself.
function setImageZoom(level, keepScroll) {
    g_imageZoom = level
    document.querySelectorAll('.zoom-levels button').forEach(function (btn) {
        btn.classList.toggle('active', +btn.dataset.zoom == level)
    })
    let img = document.querySelector('.image-container img')
    if (!img) return;
    if (level > 1 && !img.dataset.fitHeight) {
        // Not loaded yet, nothing to measure
        if (!img.complete || !img.naturalHeight) return setImageZoom(1)
        img.dataset.fitHeight = img.getBoundingClientRect().height
    }
    img.classList.toggle('zoomed', level > 1)
    img.style.height = level > 1 ? img.dataset.fitHeight * level + 'px' : ''
    document.querySelector('.image-view-body').classList.toggle('pannable', level > 1)

    if (keepScroll) return;
    // Start from the middle of the zoomed image
    let body = document.querySelector('.image-view-body')
    body.scrollLeft = (body.scrollWidth - body.clientWidth) / 2
    body.scrollTop = (body.scrollHeight - body.clientHeight) / 2
}

// Mouse wheel zoom that keeps whatever is under the cursor under the cursor
function onImageWheel(e) {
    let img = document.querySelector('.image-container img')
    if (!img || !img.complete || !img.naturalHeight) return;
    e.preventDefault()

    // deltaMode 1 counts lines, 2 counts pages
    let delta = e.deltaY * (e.deltaMode == 1 ? 16 : e.deltaMode == 2 ? 100 : 1)
    let level = g_imageZoom * Math.exp(-delta * 0.0015)
    level = Math.max(1, Math.min(MAX_IMAGE_ZOOM, level))
    if (Math.abs(level - g_imageZoom) < 0.0001) return;

    // Where the cursor sits on the image, as a fraction of its size
    let before = img.getBoundingClientRect()
    let fx = (e.clientX - before.left) / before.width
    let fy = (e.clientY - before.top) / before.height

    setImageZoom(level, true)

    // Scroll so that same point of the image lands back under the cursor
    let after = img.getBoundingClientRect()
    let body = document.querySelector('.image-view-body')
    body.scrollLeft += after.left + fx * after.width - e.clientX
    body.scrollTop += after.top + fy * after.height - e.clientY
}

// Drag a zoomed image around, since the wheel now zooms instead of scrolling
var g_imagePan = null

function startImagePan(e) {
    if (g_imageZoom <= 1 || e.button != 0) return;
    let body = e.currentTarget
    g_imagePan = { x: e.clientX, y: e.clientY, left: body.scrollLeft, top: body.scrollTop }
    body.setPointerCapture(e.pointerId)
    body.classList.add('panning')
    e.preventDefault()
}

function moveImagePan(e) {
    if (!g_imagePan) return;
    e.currentTarget.scrollLeft = g_imagePan.left - (e.clientX - g_imagePan.x)
    e.currentTarget.scrollTop = g_imagePan.top - (e.clientY - g_imagePan.y)
}

function endImagePan(e) {
    if (!g_imagePan) return;
    g_imagePan = null
    e.currentTarget.classList.remove('panning')
}


function createImage(obj) {
    let img = document.createElement("img");
    img.src = obj.url;
    img.setAttribute('person', obj.person)
    img.setAttribute('page', obj.page)
    return img
}

function setLikeButton(btn, liked) {
    btn.classList.toggle('liked', !!liked)
    btn.querySelector('.fa').className = liked ? 'fa fa-heart' : 'fa fa-heart-o'
}

// Replay the little heart bounce
function popLikeButton(btn) {
    btn.classList.remove('pop')
    btn.offsetWidth
    btn.classList.add('pop')
}

function closePageView() {
    document.querySelector("#page-view").style.display = "none";
    highlightNavPage(false)
    maybeLoadMore()
}
function closeImageView() {
    document.querySelector("#image-view").style.display = "none"
    // Only rebuild the album if the random button moved to a different one
    if (document.querySelector('.page-view-body').dataset.page != g_currentPage) {
        showPage(g_currentPage)
    }
}

function nextImage() {
    let sl = document.querySelector('.image-container img').getAttribute('sl')
    showImage(parseInt(sl) + 1)
}

function prevImage() {
    let sl = document.querySelector('.image-container img').getAttribute('sl')
    showImage(parseInt(sl) - 1)
}

function spinImage() {
    let page = g_pages.random()
    g_currentPage = page
    g_pageBuffer = g_jsonIndex.filter(item => {
        return item.page == page
    })
    let sl = Math.floor(g_pageBuffer.length * Math.random())
    showImage(sl)
}

// Album navigation wraps around at both ends
function nextPage() {
    let i = g_pages.indexOf(g_currentPage)
    showPage(g_pages[(i + 1) % g_pages.length])
}
function prevPage() {
    let i = g_pages.indexOf(g_currentPage)
    showPage(g_pages[(i - 1 + g_pages.length) % g_pages.length])
}
function spinPage() {
    showPage(g_pages.random())
}

function pageLike() {
    let pageId = "pg:" + g_currentPage;
    if (localStorage.getItem(pageId)) {
        localStorage.removeItem(pageId)
    }
    else {
        localStorage.setItem(pageId, 1)
    }
    let btn = document.querySelector('.page-liked')
    setLikeButton(btn, localStorage.getItem(pageId))
    popLikeButton(btn)
    updateNavHeart(g_currentPage)
}

// Image likes are keyed by file name so they survive files being added or removed
function imageLikeId(item) {
    return "im:" + item.page + ":" + item.file
}

function imageLike() {
    let imageSl = +document.querySelector('.image-container img').getAttribute('sl')
    let imageId = imageLikeId(g_pageBuffer[imageSl])
    if (localStorage.getItem(imageId)) {
        localStorage.removeItem(imageId)
    }
    else {
        localStorage.setItem(imageId, 1)
    }
    let btn = document.querySelector('.image-liked')
    setLikeButton(btn, localStorage.getItem(imageId))
    popLikeButton(btn)
}

// Convert old position based likes (im:<page>:<index>) to file name based likes
function migrateImageLikes() {
    let legacy = /^im:(.+):(\d+)$/
    Object.keys(localStorage).forEach(function (key) {
        let m = key.match(legacy)
        if (!m) return;
        let item = g_jsonIndex.filter(item => item.page == m[1])[+m[2]]
        if (!item) return;
        localStorage.setItem(imageLikeId(item), 1)
        localStorage.removeItem(key)
    })
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
        navItem.setAttribute('page', item)
        navItem.addEventListener('click', function (e) {
            showPage(e.currentTarget.getAttribute('page'))
        })
        let p = document.createElement('p');
        p.innerText = item;
        navItem.appendChild(p);

        let meta = document.createElement('span')
        meta.classList.add('nav-meta')
        let count = document.createElement('span')
        count.classList.add('nav-count')
        count.innerText = g_navObject[item].length
        meta.appendChild(count)
        navItem.appendChild(meta)

        navPages.appendChild(navItem);
        updateNavHeart(item, navItem)
    })
    filterNavPages()
    highlightNavPage(false)
}

// Show or remove the heart next to an album in the sidebar
function updateNavHeart(page, navItem) {
    navItem = navItem || [...document.querySelectorAll('.nav-pages .nav-item')].find(n => n.getAttribute('page') == page)
    if (!navItem) return;
    let meta = navItem.querySelector('.nav-meta')
    let heart = meta.querySelector('.nav-heart')
    let liked = localStorage.getItem('pg:' + page)
    if (liked && !heart) {
        heart = document.createElement('i')
        heart.className = 'fa fa-heart nav-heart'
        meta.prepend(heart)
    }
    else if (!liked && heart) {
        heart.remove()
    }
}

// Hide sidebar albums whose name doesn't contain the search text
function filterNavPages() {
    let query = document.querySelector('#page-search').value.trim().toLowerCase()
    let shown = 0
    document.querySelectorAll('.nav-pages .nav-item').forEach(function (navItem) {
        let match = navItem.getAttribute('page').toLowerCase().includes(query)
        navItem.classList.toggle('hidden', !match)
        if (match) shown++
    })
    document.querySelector('.search-clear').classList.toggle('hidden', query == '')
    document.querySelector('.search-count').innerText = query == ''
        ? `${g_pages.length} albums`
        : `${shown} of ${g_pages.length} albums`
}

function clearSearch() {
    let search = document.querySelector('#page-search')
    search.value = ''
    filterNavPages()
    search.focus()
}
