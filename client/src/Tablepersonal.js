"use strict";


import { Table, Form, Button, Alert, Container, Row, Badge} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
//import MySidebar from './sidebar';
//import MyNavbar from './navbar'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

//import { Col, Tab } from 'react-bootstrap';

//import FilmForm from './TableForm';
//import Error from './Error'

import { useEffect} from 'react';
//import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import API from './API';

/*
<h3>
            <Badge bg="primary">Carico didattico di {props.user.name}  [<i>{props.user.tipofrequenza == -1 ? null : props.user.tipofrequenza == 0 ? "Full Time" : "Part Time"}</i>]</Badge>&nbsp; 
                <span><Badge bg="secondary">Totale Crediti: {props.totcrediti} <i>{props.user.tipofrequenza == -1 ? null :props.user.tipofrequenza == 0 ? "[min:60/max:80]" : "[min:40/max:60]"}</i></Badge></span>
                </h3> */



                

function TablePersonal(props) {
    

    return <>

            <h3>
            <Badge bg="primary">Carico didattico di {props.user.name}  <i>{props.user.tipofrequenza == -1 ? null : props.user.tipofrequenza == 0 ? "[Full Time]" : "[Part Time]"}</i></Badge>&nbsp; 
                <span><Badge bg="secondary">Totale Crediti: {props.totcrediti} <i>{props.user.tipofrequenza == -1 ? "[Part Time (20-40)CFU / Full Time (60-80)CFU]" : props.user.tipofrequenza == 0 ? "[min:60/max:80]" : "[min:20/max:40]"}</i></Badge></span>
                </h3> 
                
            
            <Table>
            <thead>
                        <tr>
                            <th>Codice</th>
                            <th>Nome</th>
                            <th>CFU</th>
                            
                        </tr>
                    </thead>
                <tbody>
                   
                    <DisplayAllPersonal loggedIn={props.loggedIn} user = {props.user} course={props.course} exams={props.exams} setExams={props.setExams} deleteExam={props.deleteExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti} ></DisplayAllPersonal>
                    
                </tbody>
            </Table>
            <Clickable loggedIn={props.loggedIn} user = {props.user} course={props.course} exams={props.exams} setExams={props.setExams} deleteExam={props.deleteExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti} frequenza={props.frequenza} setFrequenza={props.setFrequenza} resetEsami={props.resetEsami} deleteCarico={props.deleteCarico} addCarico={props.addCarico}>
            


            </Clickable>
    </>
}

    


function DisplayAllPersonal(props) {


    return (<>
        {props.exams.map((e) => <PersonalRow key={e.code} exams={e} setExams={props.setExams} deleteExam={props.deleteExam} totcrediti={props.totcrediti} setTotcrediti={props.setTotcrediti}/>)}
    </>);

}


function PersonalRow(props) { 

    
    


    return (
        
        <>
            <tr>
                
            <td><b>{props.exams.codice}</b></td>
            <td>{props.exams.nome}</td>
            <td>{props.exams.crediti}</td>
            <td><Button variant='outline-danger' onClick={() => { props.deleteExam(props.exams); }}><i className='bi bi-trash3'></i></Button></td>
            </tr>

        
        </>
    );
}

function Clickable(props) { 


    return (
        
        <>
           { props.user.tipofrequenza == -1 ?

           <div>

            {
           props.frequenza ==-1 ?
           
            <span><Button variant='secondary' onClick={() => {props.setFrequenza(0) }}>Full Time</Button>    <Button variant='secondary' onClick={() => {props.setFrequenza(1)}}>Part Time</Button></span>
            
            :

           
            
            (props.frequenza == 0 ? 
                
                <span><Button variant='success' onClick={() => {props.setFrequenza(0) }}>Full Time</Button>    <Button variant='secondary' onClick={() => {props.setFrequenza(1)}}>Part Time</Button></span>
                :
                <span><Button variant='secondary' onClick={() => {props.setFrequenza(0) }}>Full Time</Button>    <Button variant='success' onClick={() => {props.setFrequenza(1)}}>Part Time</Button></span>
                
            )
            
            
            }
           <span style={{ paddingLeft: "69%" }}><Button variant='success' onClick={() => {props.addCarico()}}>Salva</Button>    <Button variant='warning' onClick={() => {props.resetEsami()}}>Annulla</Button></span>
           </div>
            :
            <span style={{ paddingLeft: "83%" }}><Button variant='success' onClick={() => {props.addCarico()}}>Salva</Button>    <Button variant='warning' onClick={() => {props.resetEsami()}}>Annulla</Button></span>
         }
           <br></br><br></br>




           <span><Button variant='danger' onClick={() => {props.deleteCarico()}}>Elimina Carico Didattico</Button></span>

           <br></br>

        
        </>
    );
}




export default TablePersonal;

