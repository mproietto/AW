
'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult, param} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const cors = require('cors');
const { request } = require('express');


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti


// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/
// GET /api/courses
app.get('/api/courses', async (req, res) => {
    try {
        const result = await dao.listCourses(); /////
        
        if(result.error){
            res.json(result.error);
            res.status(404).end();
          }
        else
          res.json(result);
          
      } catch(err) {
        res.status(500).json({error: 'Database error'}).end();
      }
});


// GET /api/personalexams
app.get('/api/personalexams', isLoggedIn, async (req, res) => {
  try {
      const result = await dao.listExams(req.user.id); /////
      
      if(result.error){
          res.json(result.error);
          res.status(404).end();
        }
      else
        res.json(result);
        
    } catch(err) {
      res.status(500).json({error: 'Database error'}).end();
    }
});



// DELETE /api/deletecareer
app.delete('/api/deletecareer', isLoggedIn, async (req, res) => {

  let err1 = null;
  const id = req.user.id;
  try {
    const result = await dao.deleteCD(req.user.id);

    if (result == 0){
      err1 = new Error(`Impossible delete`)
      throw (err1);
    }

    res.json(result);
    res.status(200).end();
  } catch(err) {
    
   return res.status(503).json({ error: `Database error during the deletion of career.`});
  }
});


// POST /api/add/
app.put('/api/add', [

check('frequenza').isInt({min: 0, max: 1}),
check('examlist.*.codice').isLength({min:7, max:7}),
check('examlist.*.crediti').isInt({min:1, max:12})
],

async (req, res) => {


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(422).json({errors: errors.array()});
    }

  try {

    //verifica lato server
    if(req.body.frequenza != 0 && req.body.frequenza != 1){
      //throw ("Tipologia di frequenza non ammissibile.").json();

      return res.status(416).json({error:"Tipologia di frequenza non ammissibile"}).end();
    }

    if(req.body.examlist.length > 0){
    const totale = req.body.examlist.map(x => x.crediti).reduce((a,b) => a+b);
    
    if(req.body.frequenza == 0 && (totale>80 || totale<60)){
      //throw("Numero di crediti non consono alle limitazioni di Full Time").json();
      return res.status(416).json({error:"Numero di crediti non consono alle limitazioni di Full Time"}).end();
    }
    else{
        if(req.body.frequenza == 1 && (totale>40 || totale<20)){
          //throw("Numero di crediti non consono alle limitazioni di Part Time").json();
          return res.status(416).json({error:"Numero di crediti non consono alle limitazioni di Part Time"}).end();
        }
    }
  }
    const proped = req.body.examlist.filter(x => x.propedeuticita != null).map(y => y.propedeuticita);
    const incomp = req.body.examlist.filter(x => x.incompatibilita != null).map(y => y.incompatibilita);



    for(let a of req.body.examlist){
      if(incomp.find(x => x == a.codice)){
        return res.status(416).json({error:"Errore di incompatibilità"}).end();
        //throw("Errore di incompatibilità").json();
      }
    }

    for(let b of req.body.examlist){

      if(b.proped!=null && !proped.find(x => x == b.propedeuticita )){
        //throw("Errore di propedeuticità").json();
        return res.status(416).json({error:"Errore di propedeuticità"}).end();
      }
    }




    //esecuzione 

    for(let i of req.body.examlist){

        const result = await dao.checkOccurrencies(i.codice);
        
    }

    const result2 = await dao.deleteBeforeAdd(req.user.id, req.body.frequenza);

        for(let j of req.body.examlist){
          
          const result3 = await dao.addCareer(req.user.id, j.codice); 

        }

        return res.json("Carico aggiunto correttamente.");
    
    
  } catch(err) {
    if(err == "Capienza massima raggiunta per uno dei corsi in lista."){
      return res.status(416).json({error:err}).end();}
    res.status(503).json({error:  `Database error during the update of exams.`});
  }
});




/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});


/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`react-score-server listening at http://localhost:${port}`);
});