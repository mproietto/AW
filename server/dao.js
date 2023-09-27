'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('DatabaseEsame.sqlite', (err) => {
  if(err) throw err;
});

// get all course
exports.listCourses = () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT codice, nome, crediti, maxstudenti, incompatibilita, propedeuticita, COUNT(carriera.codiceesame) AS num FROM corsi LEFT JOIN carriera ON corsi.codice = carriera.codiceesame GROUP BY corsi.codice, corsi.nome, corsi.crediti, corsi.maxstudenti, corsi.incompatibilita, corsi.propedeuticita ORDER BY nome' ;
      db.all(query, (err, rows) => {
        if (err) {
            reject(err);
            return;
        }
        if (rows.length == 0) {
            resolve({error: 'Course not found.'});
        } else {
          
            const course = rows.map(el => ({codice: el.codice, nome: el.nome, crediti: el.crediti, maxstudenti: el.maxstudenti, incompatibilita: el.incompatibilita, propedeuticita: el.propedeuticita, iscritti:el.num}));
            resolve(course);
        }
      });
    });
  };



  //get the exams of a student   
  exports.listExams = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT  studenti.id, corsi.codice, corsi.nome, corsi.crediti, corsi.maxstudenti, corsi.incompatibilita, corsi.propedeuticita, studenti.tipofrequenza FROM corsi JOIN carriera ON corsi.codice = carriera.codiceesame JOIN studenti ON carriera.codicestudente = studenti.id WHERE studenti.id = ?' ;
      db.all(query, [id], (err, rows) => {
        if (err) {
            reject(err);
            return;
        }
        if (rows.length == 0) {
            resolve({error: 'Exams not found.'});
        } else {
          
            const exam = rows.map(el => ({codice: el.codice, nome: el.nome, crediti: el.crediti, maxstudenti: el.maxstudenti, incompatibilita:el.incompatibilita, propedeuticita:el.propedeuticita}));
            resolve(exam);
        }
      });
    });
  };


// delete the entire career of a student
exports.deleteCD = (id) => {

  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM carriera WHERE codicestudente = ?';
    db.all(sql, [id], function(err) {
      if (err) {
        reject(err);
        return; 
      } 
    });

    
    const sql2= 'UPDATE studenti SET tipofrequenza = -1 WHERE id = ?'
    db.all(sql2, [id], function(err2) {
      if (err2) {
        reject(err2);
        return; 
      } else
        resolve(this.changes);
    });

    
  });
}



exports.deleteBeforeAdd = (id, tipo) => {

  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM carriera WHERE codicestudente = ?';
    db.all(sql, [id], function(err) {
      if (err) {
        reject(err);
        return; 
      } 
    });


    const sql2= 'UPDATE studenti SET tipofrequenza = ? WHERE id = ?'
    db.all(sql2, [tipo, id], function(err2) {
      if (err2) {
        reject(err2);
        return; 
      } else
        resolve(this.changes);
    });

    
  });
}

exports.checkOccurrencies = (examid) => {
  return new Promise((resolve, reject) => {
    
    const sql = 'SELECT COUNT(carriera.codiceesame) AS NumIscritti, corsi.maxstudenti FROM corsi LEFT JOIN carriera ON corsi.codice = carriera.codiceesame WHERE corsi.codice = ? GROUP BY corsi.codice, maxstudenti' ;
    db.all(sql, [examid], (err, rows) => {
    

      if (err) {
          reject(err);
          return;
      }

      let numIscr = rows[0].NumIscritti;
      let maxStud = rows[0].maxstudenti;


      

      if(maxStud <= numIscr && maxStud != null){

         reject("Capienza massima raggiunta per uno dei corsi in lista.");
         return;
      }
      else{
        resolve(true);
      }



    });
  });
};



exports.addCareer = (studentid,examid) => { 
  return new Promise((resolve, reject) => {


    const sql = 'INSERT INTO carriera( codicestudente, codiceesame) VALUES( ?, ? )';
    db.run(sql, [ studentid, examid ],  function (err){
      if (err) {
        reject(err);
      }
      else {
        resolve(true);
      }
    });
  });
};

