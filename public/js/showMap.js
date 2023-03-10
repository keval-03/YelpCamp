mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'showMap', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: camp.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(),'bottom-right');

const marker1 = new mapboxgl.Marker()
    .setPopup(
        new mapboxgl.Popup()
        .setHTML(`<h5>${camp.title}</h5><p>${camp.location}</p>`)
    )
    .setLngLat(camp.geometry.coordinates)
    .addTo(map);