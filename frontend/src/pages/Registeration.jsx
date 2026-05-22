import {useState} from 'react'
import axios from 'axios'

const Registeration = () => {
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [role,setRole] = useState('')
    const [country,setCountry] = useState('')

    const handleRegister = async (e) => {
        const userData={
            name,username,password,email,role,country
        };
        try{
            const response = await axios.post('http://localhost:9090/auth/register', userData);
            console.log('Registration successful:', response.data);
            alert('Registration successful');
        }catch(error){
            console.error('Registration failed:', error);
        }
    }

    return(
        <div>
            <h1>Register</h1>
            <input type="text" placeholder="name" onChange={(e)=>setName(e.target.value)}/>
            <br/><br/>
            <input type="text" placeholder="UserName " onChange={(e)=>setUsername(e.target.value)}/>
            <br/><br/>
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
            <br/><br/>
            <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
            <br/><br/>
            <input type="Role" placeholder="Role" onChange={(e)=>setRole(e.target.value)}/>
            <br/><br/>
            <input type="Country" placeholder="Country" onChange={(e)=>setCountry(e.target.value)}/>
            <br/><br/>
            
            
            <button onClick={handleRegister}>Register</button>
        </div>
    )

}
export default Registeration;