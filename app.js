const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fs = require('fs');

const app = express();
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

//configure mustache
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

//configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//config public to be served statically
app.use(express.static('public'));

//config Express Validator
app.use(expressValidator());


app.use(session({
  secret: '1C44-4D44-WppQ38S',
  resave: false,
  saveUninitialized: true
}));

let randomWord = words[parseInt(Math.random() * 100000)];
let randomWordLetters = randomWord.split("");
let guessedLetters = [];
let numberOfGuesses = 8;


app.get('/', function(req, res) {
  res.render('content', {space : randomWordLetters, numberOfGuesses})
});

app.get('/youwin', function (req, res){
  res.render('youwin')
})

app.post('/', function(req,res){
  if (req.body.letterInput.split('').length === 1 && guessedLetters.includes(req.body.letterInput) === false ){
    guessedLetters.push(req.body.letterInput);
    numberOfGuesses -= 1
    console.log(req.body.letterInput.split(''));
  }

  if(numberOfGuesses === 0){
    res.redirect('/gameover')
  }

  let correctLetters = randomWordLetters.map(function(letter){
    if(guessedLetters.includes(letter)){
      return letter;
    }else{
      return '_';
    }
  });


 if (correctLetters.includes(req.body.letterInput)){
   numberOfGuesses += 1
 }


  var schema = {
    'letterInput': {
      notEmpty: true,
      isLength: {
        options: [{
          max: 1
        }],
        errorMessage: 'one letter at a time please'
      },
      errorMessage: 'please guess a letter'
    },
  };
  req.assert(schema);
  let isSame = correctLetters.every(function(element, i) {
    return element === randomWordLetters[i];
  });
  if(isSame){
    res.redirect('/youwin');
  }else{
  req.getValidationResult().then(function(results) {

    if (results.isEmpty()) {
      res.render('content', {
        letters: correctLetters,
        guessed: guessedLetters,
        numberOfGuesses
      });
      // console.log(guessedLetters)
    } else {
      res.render('content', {
        letters: correctLetters,
        guessed: guessedLetters,
        numberOfGuesses,
        errors: results.array()
      });
    }
  });
  };

});
app.get('/gameover', function(req, res){
  req.session.destroy();
  res.render('gameover')
})

app.listen(3000, function() {
  console.log("I want to play a game");
  // console.log(randomWord);
  console.log(randomWordLetters);

});
