console.log('Popup HTML loaded');
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
});
window.addEventListener('load', (event) => {
    console.log('All resources finished loading');
});