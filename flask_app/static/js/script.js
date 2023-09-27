fetch("https://random-word-api.herokuapp.com/word?length=5")
    .then(response => response.json())
    .then(coderData => {
        let correctGuess = coderData[0];
        const NUMBER_OF_GUESSES = 6;
        let guessesRemaining = NUMBER_OF_GUESSES;
        let currentGuess = [];
        let nextLetter = 0;
        console.log(correctGuess)

        function initBoard() {
            let board = document.getElementById("game-board");

            for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
                let row = document.createElement("div");
                row.className = "letter-row";

                for (let j = 0; j < 5; j++) {
                    let box = document.createElement("div");
                    box.className = "letter-box";
                    box.style.border = "2px solid dark-gray";
                    row.appendChild(box);
                }

                board.appendChild(row);
            }

            let form = new FormData()
            form.append("score", 0);
            fetch("/updateScore", {
                method: "post",
                body: form
            })
            .then(request => request.json())
            .then(data => data)
            .catch(err => console.log(err));
        }

        initBoard()

        document.addEventListener("keyup", (event) => {

            if (guessesRemaining === 0) 
                return;

            let pressedKey = String(event.key)
            if (pressedKey === "Backspace" && nextLetter !== 0) {
                deleteLetter();
                return;
            }

            if (pressedKey === "Enter") {
                checkGuess();
                return;
            }

            let found = pressedKey.match(/[a-z]/gi)
            if (!found || found.length > 1) 
                return;
            
            else 
                insertLetter(pressedKey);
            
        })

        function insertLetter(pressedKey) {
            if (nextLetter === 5) 
                return;
            
            pressedKey = pressedKey.toLowerCase();

            let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
            let box = row.children[nextLetter];
            animateCSS(box, "pulse");
            box.textContent = pressedKey;
            box.style.color = "white";
            box.classList.add("filled-box");
            currentGuess.push(pressedKey);
            nextLetter += 1;
        }

        function deleteLetter() {
            let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
            let box = row.children[nextLetter - 1];
            box.textContent = "";
            box.classList.remove("filled-box");
            currentGuess.pop();
            nextLetter -= 1;
        }

        function checkGuess() {
            let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
            let guessString = '';
            let rightGuess = Array.from(correctGuess);

            for (const val of currentGuess) 
                guessString += val;

            if (guessString.length != 5) {
                toastr.error("Not enough letters!")
                return;
            }

            if (!validWord(guessString)) {
                toastr.error("Word not in list!")
                return;
            }

            for (let i = 0; i < 5; i++) {
                let letterColor = '';
                let box = row.children[i];
                let letter = currentGuess[i];

                let letterPosition = rightGuess.indexOf(currentGuess[i]);
                
                if (letterPosition === -1) 
                    letterColor = 'rgb(58,58,60)';
                else {
                    if (currentGuess[i] === rightGuess[i])  
                        letterColor = 'green'; 
                    else 
                        letterColor = 'yellow';
                }

                rightGuess[letterPosition] = null;

                let delay = 250 * i;
                setTimeout(() => {
                    animateCSS(box, 'flipInX');
                    box.style.backgroundColor = letterColor;
                    shadeKeyBoard(letter, letterColor);
                }, delay)
            }

            if (guessString === correctGuess) {
                guessesRemaining -= 1;
                let guessesUsed = 6 - guessesRemaining;

                fetchData();
                
                document.getElementById("openPopupBtn").classList.add('active');
                document.getElementById("numGuesses").innerHTML = (`Good job! You got it in ${guessesUsed} ` + ((guessesUsed == 1) ? "guess" : "guesses"));
                return;
            } 
            else {
                guessesRemaining -= 1;
                currentGuess = [];
                nextLetter = 0;
                let form = new FormData()
                let guessesUsed = 6 - guessesRemaining;
                console.log(guessesUsed);
                form.append("score", guessesUsed);
                fetch("/updateScore", {
                    method: "post",
                    body: form
                })
                .then(request => request.json())
                .then(data => console.log(data))
                .catch(err => console.log(err));

                if (guessesRemaining === 0) {
                    fetch("/saveScoreLoss", {
                        method: "post",
                    })
                    .then(request => request.json())
                    .then(data => data)
                    .catch(err => console.log(err));

                    fetchData();
                    
                    document.getElementById('popup').classList.add('active');
                    document.getElementById('numGuesses').innerHTML = `The word was \"${correctGuess}.\"`;
                    document.getElementById("openPopupBtn").classList.add('active');
                    document.getElementById("playAgain").classList.add("active")
                }
            }
        }

        function fetchData(){
            fetch("/getSessionData")
            .then(request => request.json())
            .then(data => {
                if(data){
                    fetch("/saveScoreWin", {
                        method: "post",
                    })
                    .then(request => request.json())
                    .then(data => {
                        fetch(`/getPlayedData`)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("played").innerHTML = data
                        })
                        .catch(err => console.log(err))

                        fetch(`/getWinRate`)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("winR").innerHTML = data
                        })
                        .catch(err => console.log(err))

                        fetch(`/getStreakData`)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("curStreak").innerHTML = data
                        })
                        .catch(err => console.log(err))

                        fetch(`/getMaxStreakData`)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("maxStreak").innerHTML = data
                        })
                        .catch(err => console.log(err))
                        fetch(`/getScoreData`)
                        .then(response => response.json())
                        .then(data => {
                            var xValues = ["1", "2", "3", "4", "5", "6"];
                            var yValues = data
                            var barColors = [];
                            console.log("In fetch: " + guessesRemaining)
                            for(let i = 0; i < 6; i++){
                                if(6 - guessesRemaining - 1 == i)
                                    barColors[i] = "green";
                                else
                                    barColors[i] = "gray";
                            }
        
                            new Chart("chart", {
                                type:"bar",
                                data: {
                                    labels: xValues,
                                    datasets: [{
                                        backgroundColor: barColors,
                                        data: yValues
                                    }]
                                },
                                options: {
                                    legend: {display: false},
                                    title: {
                                        display: true,
                                        text: "Statistics"
                                    },
                                    scales: {
                                        yAxes:[{
                                            display: false
                                        }]
                                    }
                                }
                            });
                            document.getElementById('chart').innerHTML = JSON.stringify(data);
                            guessesRemaining = 0;
                            document.getElementById("playAgain").classList.add("active")
                        })
                        .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
    
                    document.getElementById('popup').classList.add('active');
                            
                    
                }
                else{
                    document.getElementById('popup').classList.add('active');
                    guessesRemaining = 0;
                    document.getElementById("playAgain").classList.add("active")
                }
            })
            .catch(err => console.log(err));
        }

        function shadeKeyBoard(letter, color) {
            for (const elem of document.getElementsByClassName("keyboard-button")) {
                if (elem.textContent === letter) {
                    let oldColor = elem.style.backgroundColor;
                    if (oldColor === 'green') 
                        return;

                    if (oldColor === 'yellow' && color !== 'green') 
                        return;

                    elem.style.backgroundColor = color;
                    break;
                }
            }
        }

        document.getElementById("keyboard-cont").addEventListener("click", (event) => {
            const target = event.target;

            if (!target.classList.contains("keyboard-button")) 
                return;
            
            let key = target.textContent;

            if (key === "Del") 
                key = "Backspace";
            

            document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }));
        });

        const animateCSS = (element, animation, prefix = 'animate__') =>
            new Promise((resolve, reject) => {
                const animationName = `${prefix}${animation}`;
                const node = element;
                node.style.setProperty('--animate-duration', '0.3s');

                node.classList.add(`${prefix}animated`, animationName);

                function handleAnimationEnd(event) {
                    event.stopPropagation();
                    node.classList.remove(`${prefix}animated`, animationName);
                    resolve('Animation ended');
                }

                node.addEventListener('animationend', handleAnimationEnd, { once: true });
            });
            
            document.getElementById('openPopupBtn').addEventListener('click', function() {document.getElementById('popup').classList.add('active');});
                
            if(document.getElementById("signInBtn")){
                document.getElementById('signInBtn').addEventListener('click', function() {
                    document.getElementById('popup').classList.remove('active');
                    document.getElementById('signInPopup').classList.add('active');
                    document.getElementById('closeSignIn').addEventListener('click', function(){
                        document.getElementById('signInPopup').classList.remove('active');
                    });
                    document.getElementById('signUpBtn').addEventListener('click', function() {
                        document.getElementById('signInPopup').classList.remove('active');
                        document.getElementById('signUpPopup').classList.add('active');
                        document.getElementById('closeSignUp').addEventListener('click', function(){
                            document.getElementById('signUpPopup').classList.remove('active');
                        });
                    });
                    
                });
                document.getElementById('closePopupBtn').addEventListener('click', function() {
                    document.getElementById('popup').classList.remove('active');
                });
            }
            else{
                document.getElementById('closePopupBtn').addEventListener('click', function() {
                    document.getElementById('popup').classList.remove('active');
                });
            }
    })
    .catch(err => console.log(err));

    async function validWord(word) {
        console.log("In validation:" + word)
        var response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        var coderData = await response.json();
        console.log(coderData);
    }