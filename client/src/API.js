
const URL = 'http://localhost:3001/api'

async function getAllCourses() {
  // call  /api/courses
  const response = await fetch((URL+'/courses'), {credentials: 'include'});
  const courseJson = await response.json();
  if (response.ok) {
    if(courseJson != "Content Not Found" && courseJson != "Course not found."){
      
    return courseJson.map((el) => ({codice: el.codice, nome: el.nome, crediti: el.crediti, maxstudenti: el.maxstudenti, incompatibilita: el.incompatibilita, propedeuticita: el.propedeuticita, iscritti: el.iscritti }) )
    }
    else{
      throw courseJson;
    }

  } else {
    throw courseJson;  
  }
}


async function getAllExams() {
  // call  /api/personalexams
  const response = await fetch((URL+'/personalexams'), {credentials: 'include'});
  const courseJson = await response.json();
  if (response.ok) {
    if(courseJson != "Content Not Found" && courseJson != "Exams not found."){
      
    return courseJson.map((el) => ({codice: el.codice, nome: el.nome, crediti: el.crediti, maxstudenti: el.maxstudenti, incompatibilita: el.incompatibilita, propedeuticita: el.propedeuticita}) )
    }
    else{
      throw courseJson;
    }

  } else {
    throw courseJson;  
  }
}



function deleteCareer() {
  // call: DELETE /api/deletecareer
  return new Promise((resolve, reject) => {
    fetch((URL +'/deletecareer'), {
      method: 'DELETE',
      credentials: 'include'
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}



async function salvaCarriera(examlist, tipof) {
  // call: POST /api/add


    const response = await fetch((URL+'/add'), {
      method: 'PUT',    
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({examlist:examlist,frequenza:tipof }),
    })

    const ritorno = await response.json();
    
    
      if (response.ok) {
        return ritorno;
      } 
      else {

        throw ritorno.error;
  
      }
    
  
}

  

  async function logIn(credentials) {
    let response = await fetch(URL + '/sessions', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      const errDetail = await response.json();
      throw errDetail.message;
    }
  }
  
  async function logOut() {
    await fetch( URL + '/sessions/current', { method: 'DELETE', credentials: 'include' });
  }

  async function getUserInfo() {
    const response = await fetch(URL + '/sessions/current', {credentials: 'include'});
    const userInfo = await response.json();

    
    if (response.ok) {
      
      return userInfo;
    } else {
      
      throw userInfo;  // an object with the error coming from the server
    }
  }

const API = {getAllCourses, logIn, logOut, getUserInfo, getAllExams, deleteCareer,salvaCarriera};
export default API;