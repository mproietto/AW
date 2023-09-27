import "./App.css"
import { Nav, Navbar, Container, Form, FormControl, Button } from 'react-bootstrap';
import {Navigate, useNavigate } from 'react-router-dom';



function MyNavbar(props) {

    const navigate = useNavigate();

    return <Navbar bg="primary" variant="dark" fixed="top">
            <Container fluid>
                <Navbar.Brand href="#home">
                   {props.loggedIn ? 
                   <span className="testo-grande">
                   Pagina Personale, {props.user.name}
                   </span>
                   :
                    <span className="testo-grande">
                        Corsi Disponibili
                    </span>}
                </Navbar.Brand>                
                
                
                
                {props.loggedIn ? 
                (<Button variant = "danger">
                <i className="bi bi-person" onClick={() => { props.logout() }}>Logout</i>
               </Button>)
                :
                (<Button variant = "outline-light">
                    <i className="bi bi-person" onClick={() => { navigate(`/login`) }}>Login</i>
                </Button>)}


            </Container>
        </Navbar>;

    
}

export default MyNavbar;