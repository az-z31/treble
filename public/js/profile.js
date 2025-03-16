window.onload = () => {
    if (!sessionStorage.name) {
        location.href = '/login';
    }
};


const logOut = document.querySelector('.logout');

logOut.onclick = () => {
    sessionStorage.clear();
    location.reload();
}