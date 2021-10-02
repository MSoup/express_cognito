
const loginButton = document.getElementById("login");

function handleLogin() {

}

if (loginButton) {
    loginButton.addEventListener("click", handleLogin);
    // Building the cognito URL from .env variables

}

console.log(finalURL);


// def exchange_code_for_token(code: str) -> dict:
//     # Post request to endpoint oauth2/login and pass in code in body
//     data = {
//         "client_id": "6g8ujpf9v6653pe56j5sff5ddi",
//         "grant_type": "authorization_code",
//         "redirect_uri": REDIRECT_URI,
//         "scope": "openid",
//         "code": code
//     }

//     headers = {
//         "Content-Type": "application/x-www-form-urlencoded"
//     }

//     response = requests.post(f'{SITE_URL}/oauth2/token', data=data, headers=headers)
//     response.raise_for_status()
//     credentials = response.json()