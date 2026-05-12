import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {registration} from "../api/apiService";

function Registration({setIsLoggedIn}){
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegistration(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        if(password !== passwordConfirm){
            setError("Passwörter stimmen nicht überein");
            setLoading(false);
            return;
        }

        try{
            const data = await registration(email, username, password, passwordConfirm);

            if(data.success){
                setIsLoggedIn(true);

                localStorage.setItem("user", JSON.stringify(data.user));

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
                <h1>Registrieren</h1>

                <form onSubmit={handleRegistration}>
                    <div>
                        <label>Email</label>
                        <br></br>
                        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required></input>
                    </div>

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

                    <div>
                        <label>Passwort bestätigen</label>
                        <br></br>
                        <input type="password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required></input>
                    </div>

                    {error && <p style={{color : "red"}}>{error}</p>}
                    {message && <p style={{color : "green"}}>{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Wird registriert " : "Registrieren"}
                    </button>
                </form>

                <p>Schon registriert? <Link to ="/login">Login</Link></p>
            </div>
    );

}

export default Registration;

