
var map = L.map('map', { center: [0, 0], zoom: 0, zoomControl: false })
/*    map.dragging.disable()
    map.touchZoom.disable()
    map.doubleClickZoom.disable()
    map.scrollWheelZoom.disable()
    map.boxZoom.disable()
    map.keyboard.disable()*/
if (map.tap) map.tap.disable()

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map)

window.string = ''
window.input.value = location.hash.substring(1).toLowerCase()
if (location.hash.substring(1) == '') {
    location.hash = 'io'
    window.input.value = location.hash.substring(1).toLowerCase()
}

function updateMap() {
    let string = location.hash.substring(1).toLowerCase()
    if (string == window.string) { doStyling(); return }
    window.string = string

    west = -180
    south = -90
    width = 360
    height = 180

    for (i = 0; i < string.length; i++) {
        group = Math.floor(i / 2)
        isLat = i % 2 // is this digit latitude?
        char = string.charAt(i)
        char2Dig = string.charCodeAt(i) - 97
        exponent = Math.floor((group - 1) / 2)

        if (group == 0) {
            if (char2Dig >= 0 && char2Dig <= 17) {
                weight = 10

                if (isLat) {
                    south += weight * char2Dig
                    height = height / 18
                } else {
                    west += weight * char2Dig * 2
                    width = width / 18
                }
            } else {
                update = false
            }
        } else if (group % 2 == 0) {
            if (char2Dig >= 0 && char2Dig <= 23) {
                weight = 1 / (24 * Math.pow(10 * 24, exponent))

                if (isLat) {
                    south += weight * char2Dig
                    height = height / 24
                } else {
                    west += weight * char2Dig * 2
                    width = width / 24
                }
            } else {
                update = false
            }
        } else if (group % 2 == 1) {
            if (char >= '0' && char <= '9') {
                weight = 1 / Math.pow(24 * 10, exponent)

                if (isLat) {
                    south += weight * char
                    height = height / 10
                } else {
                    west += weight * char * 2
                    width = width / 10
                }
            } else {
                update = false
            }
        }
    }

    let right = west + width
    let left = west
    let top = south + height
    let bottom = south

    map.eachLayer(layer => {
        if (layer instanceof L.Rectangle) layer.remove()
    })

    window.rectangle = L.rectangle([[top, -180], [90, left]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[top, left], [90, right]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[top, right], [90, 180]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[bottom, -180], [top, left]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[bottom, right], [top, 180]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[-90, -180], [bottom, left]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[-90, left], [bottom, right]], { color: 'black', weight: 1 }).addTo(map)
    window.rectangle = L.rectangle([[-90, right], [bottom, 180]], { color: 'black', weight: 1 }).addTo(map)

    window.bounds = [[bottom, left], [top, right]]
    doStyling()
}

function doStyling() {
    map.fitBounds(window.bounds)
}

updateMap()
window.addEventListener('resize', () => { doStyling(); setTimeout(doStyling, 500) })
window.addEventListener('hashchange', () => { updateMap(); setTimeout(updateMap, 500) })
new ResizeObserver(() => { doStyling(); setTimeout(doStyling, 500) }).observe(document.getElementById('map'))
