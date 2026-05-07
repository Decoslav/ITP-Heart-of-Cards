const baseURL = "../public/api/";

export async function login(username, password) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(baseURL+ "login.php",{
        method : "POST",
        body : formData,
        credentials : "include"
    });

    return response.json();
}

export async function registration(email, username, password, passwordConfirm) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("passwordConfirm", passwordConfirm);

    const response = await fetch(baseURL+"registration.php" ,{
        method : "POST",
        body : formData,
        credentials : "include"
    });
    return response.json();
}