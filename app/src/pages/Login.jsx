import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {login} from "../api/apiService";

function Login({setIsLoggedIn}){
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try{
            const data = await login(username, password);

            if(data.success){
                setIsLoggedIn(true);

                localStorage.setItem("user", JSON.stringify(data.username));

                navigate("/");
            }else{
                setError(data.message);
            }
        }catch(error){
            setError("Verbindung zum Server fehlgeschlagen")
            console.error(error);
        }finally{
            setLoading(false);
        }
    }

    return(
            <div>
                <h1>Login</h1>

                <form onSubmit={handleLogin}>
                    <div>
                        <label>Benutzername</label>
                        <br></br>
                        <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required></input>
                    </div>

                    <div>
                        <label>Passwort</label>
                        <br></br>
                        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required></input>
                    </div>

                    {error && <p style={{color : "red"}}>{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Wird eingeloggt " : "Einloggen"}
                    </button>
                </form>
            </div>
    );

}

export default Login;

