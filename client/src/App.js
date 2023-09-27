"use strict";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Col, Container, Row, Alert } from 'react-bootstrap';
import MyTable from './Table.js';
//import FilmForm from './TableForm';
//import Error from './Error'
import { LoginForm, LogoutButton } from './LoginComponents';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import API from './API';

function App() {

  return (
    <Router>
      <App2 />
    </Router>
  )
}


function App2() {


  const [course, setCourse] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [exams, setExams] = useState([]);
  const [examsbackup, setExamsbackup] = useState([]);
  const [totcrediti, setTotcrediti] = useState(0);
  const [esamipropedeutici, setEsamipropedeutici] = useState([]);
  const [esamiincompatibili, setEsamiincompatibili] = useState([]);
  const [frequenza,setFrequenza]=useState(-1);



  const navigate = useNavigate();


  function addExam(esame) {

    if (!exams.find(e => e.codice == esame.codice)) {
      setExams(oldex => [...oldex, esame]);
      setTotcrediti(() => totcrediti + esame.crediti);
    }

  }

  //riempire il vettore delle incompatibilità
  useEffect(() => {

    const inc = exams.filter(x => x.incompatibilita!=null).flatMap(c => c.incompatibilita.split("\r\n"));
    
    setEsamiincompatibili(inc);
    

  }, [loggedIn, exams.length, esamiincompatibili.length]);


  useEffect(() => {
    
    setFrequenza(user.tipofrequenza);
  
  
  }, [loggedIn]);


    //riempire il vettore delle propedeuticità
    useEffect(() => {

      const pr = [];
      const temp = course.filter(x => x.propedeuticita != null);

      for (let i of temp){

        if(!exams.find(e => e.codice == i.propedeuticita))
        {
          pr.push(i.codice);
        }

      }
      
      setEsamipropedeutici(pr);
  
  
    }, [loggedIn, exams.length, esamipropedeutici.length]);



  function deleteExam(esame) {
    
    let block = true;

    for(let i of exams){
      if(i.propedeuticita == esame.codice)
        block=false;
    }

    if(block){
    setExams(() => exams.filter(e => (e.codice !== esame.codice)));

    setTotcrediti(() => totcrediti - esame.crediti);
    }
    else{
      setMessage("Esame non rimuovibile in quanto propedeutico")
    }
  }


  useEffect(() => {

    // fetch  /api/personalexams
    API.getAllExams()
      .then((exams) => {
        setExams(exams);
        setExamsbackup(exams);
        const n = exams.map(e => e.crediti).reduce((a, b) => a + b, 0);
        setTotcrediti(n);
      })
      .catch(err => {

        setExams([]);
      });


  }, [loggedIn]);


  useEffect(() => {
    const checkAuth = async () => {
      try {

        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        handleError(err);
      }
    };
    checkAuth();
  }, []);



  useEffect(() => {

    // fetch  /api/course

    API.getAllCourses()
      .then((courses) => {
        setCourse(courses);
        setInitialLoading(false);

      })
      .catch(err => {

        handleError(err);
        setCourse([]);
      });


  }, [loggedIn]);



  function handleError(err) {
    console.log(err);
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/loggato');
      })
      .catch(err => {

        setMessage(err);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setTotcrediti(0);
    setFrequenza(-1);
    setExams([]); 
    setMessage('');
    navigate('/')
  }


  function resetEsami(){

    setTotcrediti(0);
    setEsamiincompatibili([]);
    setEsamipropedeutici([]);
    setFrequenza(user.tipofrequenza);   /////-2??

    API.getAllExams()
      .then((exams) => {
        setExams(exams);
        const n = exams.map(e => e.crediti).reduce((a, b) => a + b, 0);
        setTotcrediti(n);
      })
      .catch(err => {

        setExams([]);
      });


  }


const deleteCarico = async () => {
 
  
  await API.deleteCareer() 
      .catch( err => handleError(err));


  await API.getUserInfo().then(info => {setUser(info); setExams([]); setExamsbackup([]); setTotcrediti(0); setEsamiincompatibili([]); setEsamipropedeutici([]); setFrequenza(-1);});

}


const addCarico = async () => {

  if(frequenza!=-1){

    if(frequenza==0 && (totcrediti<=80 && totcrediti>=60)){
      if(examsbackup.length > 0){
        await API.salvaCarriera(exams,0).then(setMessage("Carico Aggiunto")).catch(err=>{setMessage(err); API.salvaCarriera(examsbackup,0);});
        }
        else{
          await API.salvaCarriera(exams,0).then(setMessage("Carico Aggiunto")).catch(err=>{setMessage(err);});
        }
    }
    else if (frequenza==1 && (totcrediti<=40 && totcrediti>=20)){
      if(examsbackup.length > 0){
      await API.salvaCarriera(exams,1).then(setMessage("Carico Aggiunto")).catch(err=>{setMessage(err); API.salvaCarriera(examsbackup,1);});
      }
      else{
        await API.salvaCarriera(exams,1).then(setMessage("Carico Aggiunto")).catch(err=>{setMessage(err);});
      }
    }
    else{
      setMessage('Il numero di crediti immessi nel carico NON rispetta i limiti');
    }

  }
  else{
    setMessage('Selezionare Part Time o Full Time');
  }
   
    
}






  return (
    <>

      <Container fluid className="App">
        <Container>
          <Row><Col>
            {/*message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false*/}
          </Col></Row>
        </Container>
        <Routes>
          <Route path='/' element={
              initialLoading ? <Loading /> :
                            <MyTable logout={doLogOut} login={doLogIn} loggedIn={loggedIn} user={user} course={course}  exams={exams} setExams={setExams} addExam={addExam} deleteExam={deleteExam} totcrediti={totcrediti} setTotcrediti={setTotcrediti} esamiincompatibili={esamiincompatibili} esamipropedeutici={esamipropedeutici} frequenza={frequenza} setFrequenza={setFrequenza} resetEsami={resetEsami} deleteCarico={deleteCarico} addCarico={addCarico}/>} />
          <Route path='/loggato' element={loggedIn ? <MyTable logout={doLogOut} login={doLogIn} loggedIn={loggedIn} user={user} course={course}  exams={exams} setExams={setExams} addExam={addExam} deleteExam={deleteExam} totcrediti={totcrediti} setTotcrediti={setTotcrediti} esamiincompatibili={esamiincompatibili} esamipropedeutici={esamipropedeutici} frequenza={frequenza} setFrequenza={setFrequenza} resetEsami={resetEsami} deleteCarico={deleteCarico} addCarico={addCarico}/> : <Navigate to='/login'/>} />
          <Route path='/login' element={<LoginForm login={doLogIn} />} />
          <Route path='/*' />
        </Routes>
        <br></br>
        {message ? <Alert variant='danger' className='centrato' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
      </Container>
    </>
  )
}

function Loading(props) {
  return (
    <h2>Loading data ...</h2>
  )
}






export default App;