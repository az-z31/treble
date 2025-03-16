// form loading animation

const form = [...document.querySelector('.form').children];

form.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i*100);
})

window.onload = () => {
    if(sessionStorage.name){
        location.href = '/';
    }
};


//form validation
const name = document.querySelector('.name') || null;
const email = document.querySelector('.email');
const password = document.querySelector('.password');
const submitBtn = document.querySelector('.submit-btn');

if(name == null){ // means login page is open
    submitBtn.addEventListener('click', () => {
        fetch('/login-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.id){ // Check if the response contains a user object with an id
                sessionStorage.setItem('name', data.name);
                sessionStorage.setItem('email', data.email);
                sessionStorage.setItem('userId', data.id);
                location.href = '/';
            } else {
                // If data doesn't contain user info, it's probably an error message
                alertBox(data.error || 'An error occurred during login');
            }
        })
        .catch(err => {
            console.error('Login error:', err);
            alertBox('An error occurred during login. Please try again.');
        });
    })
   
} else{ // means register page is open

    submitBtn.addEventListener('click', () => {
        fetch('/register-user', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                password: password.value
            })
        })
        .then(res => res.json())
        .then(data => {
            validateData(data);
        })
    })

}


const validateData = (data) => {
    if(!data.name){
        alertBox(data);
    } else{
        sessionStorage.setItem('name', data.name);
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('userId', data.id);
        location.href = '/';
    }
}

const alertBox = (data) => {
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}

// After successful login
sessionStorage.setItem('userId', data.id);