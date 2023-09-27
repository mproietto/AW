"use strict";


import { Table, Form, Button, Alert, Container, Row, Badge} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
//import MySidebar from './sidebar';
import MyNavbar from './navbar'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Col, Tab } from 'react-bootstrap';

//import FilmForm from './TableForm';
//import Error from './Error'
import TablePersonal from './Tablepersonal';

import { useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import API from './API';



function MyTable(props){




    return <>
    <MyNavbar login={props.login} logout={props.logout} loggedIn={props.loggedIn} user = {props.user}/>
    <Row className = "h-100 below-nav">
    <Container className="col-md-9 fluid">
        {props.loggedIn ? <Badge bg="secondary"> <h6>LEGENDA: <i>INCOMPATIBILE </i><i class="bi bi-x-octagon"></i> / <i>PROPEDEUTICO</i> <i class="bi bi-key"></i> </h6></Badge> : null}
        <br></br>
        <DisplayTable course={props.course} logout={props.logout} loggedIn={props.loggedIn} user = {props.user} exams={props.exams} setExams={props.setExams} deleteExam={props.deleteExam} addExam={props.addExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti} esamiincompatibili={props.esamiincompatibili}  esamipropedeutici={props.esamipropedeutici} frequenza={props.frequenza} setFrequenza={props.setFrequenza} resetEsami={props.resetEsami} deleteCarico={props.deleteCarico} addCarico={props.addCarico}/> 
    </Container>
    </Row> 
    </>
}


function DisplayTable(props) {

    

    return <>
        <main className="h-100">
       
            <Table hover striped>
            <thead>
                        <tr>
                            <th>Codice</th>
                            <th>Nome</th>
                            <th>CFU</th>
                            <th>Numero Iscritti</th>
                            <th>MaxStudenti</th>
                            <th></th>
                        </tr>
                    </thead>
                <tbody>
                   
                    <DisplayAll loggedIn={props.loggedIn} user = {props.user} course={props.course} exams={props.exams} setExams={props.setExams} deleteExam={props.deleteExam}  addExam={props.addExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti} esamiincompatibili={props.esamiincompatibili}  esamipropedeutici={props.esamipropedeutici} frequenza={props.frequenza} setFrequenza={props.setFrequenza}></DisplayAll>
                </tbody>
            </Table>
            <br></br><br></br>
        {
            props.loggedIn ? (<TablePersonal loggedIn={props.loggedIn} user = {props.user} course={props.course} exams={props.exams} setExams={props.setExams} deleteExam={props.deleteExam} addExam={props.addExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti} frequenza={props.frequenza} setFrequenza={props.setFrequenza} resetEsami={props.resetEsami} deleteCarico={props.deleteCarico} addCarico={props.addCarico}></TablePersonal>) : (null)
        }
        </main>

    </>
}

    


function DisplayAll(props) {

    
    
    return (<>
        {props.course.map((c) => <CourseRow key={c.code} course={c}   login={props.login} logout={props.logout} loggedIn={props.loggedIn} user = {props.user} exams={props.exams} setExams={props.setExams} deleteExam={props.deleteExam} addExam={props.addExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti} esamiincompatibili={props.esamiincompatibili}  esamipropedeutici={props.esamipropedeutici}/>)}
       
    </>);

}


function CourseRow(props) { 

    const [clicked, setClicked] = useState(false);
    
    const[inc, setInc] = useState(false);
    const[pro, setPro] = useState(false);
    const[taken,setTaken] = useState(false);
    

    
    
    useEffect(() => {
        if(props.esamiincompatibili.find(x => x == props.course.codice)){
            setInc(true);
        }
        else{
            setInc(false);
        }

        if(props.esamipropedeutici.find(x => x == props.course.codice)){
            setPro(true);
        }
        else{
            setPro(false);
        }
        if(props.exams.find(x => x.codice == props.course.codice)){
            setTaken(true);
        }
        else{
            setTaken(false);
        }

    
      }, [props.exams.length, props.esamiincompatibili.length,  props.esamipropedeutici.length]);


    
    

    return (
        
        <>
            {!props.loggedIn  ? <>

            <tr>
            <td>{props.course.codice}</td>
            <td><i>{props.course.nome}</i></td>
            <td><b>{props.course.crediti}</b></td>
            <td>{props.course.iscritti}</td>
            <td>{props.course.maxstudenti}</td>
            <td><Button class="btn btn-warning" onClick={() => setClicked((x) => !x)}><i className='bi bi-info-lg'></i></Button></td>
            {props.loggedIn ? <td><Button variant='success' onClick={() => { props.addExam(props.course); }}><i className='bi bi-folder-plus'></i></Button></td> : null}
            </tr>
            {clicked ? (<tr className='table-warning'><td><b>Incompatibilità: </b>{props.course.incompatibilita}</td><td><b>Propedeuticità: </b>{props.course.propedeuticita}</td></tr>) : null}
            </>
            :
            <>
            <tr className={`${inc  ? "rosso" : (pro ? "giallo" : (taken ? "verde" : null))} `}>
            <td>{props.course.codice}</td>
            <td><i>{props.course.nome}</i></td>
            <td><b>{props.course.crediti}</b></td>
            <td>{props.course.iscritti}</td>
            <td>{props.course.maxstudenti}</td>
            <td><Button class="btn btn-warning" onClick={() => setClicked((x) => !x)}><i className='bi bi-info-lg'></i></Button></td>
            {props.loggedIn ? <td><Button variant='success' onClick={() => { props.addExam(props.course);}}  disabled={inc || pro || taken ? true : false}  ><i className='bi bi-folder-plus'></i></Button></td> : null}
            
            {inc ? <td> <Button disabled={true} variant='danger'><i class="bi bi-x-octagon"></i></Button></td> : (pro ? <td><Button disabled={true} variant='warning'><i class="bi bi-key"></i></Button></td> : <td></td>)}
            
            

            
            </tr>
            {clicked ? (<tr className='table-warning'><td><b>Incompatibilità: </b>{props.course.incompatibilita}</td><td><b>Propedeuticità: </b>{props.course.propedeuticita}</td></tr>) : null}
            

            </>

            }
            
            


        </>
    );
}


export default MyTable;

