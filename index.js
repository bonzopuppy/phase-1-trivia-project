let currentQuestions = []; // Store the fetched questions

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function fetchQuestions() {
    fetch('https://opentdb.com/api.php?amount=10&type=multiple')
        .then(response => response.json())
        .then(data => {
            currentQuestions = data.results; // Store the questions
            listQuestions(data.results);
            displayDefaultMessage();
        })
        .catch(error => console.error('Error:', error));
}
//Display default answer container message
function displayDefaultMessage() {
    const triviaContainer = document.getElementById('trivia');
    triviaContainer.innerHTML = '<p class="default-message">Select a question to start the round!</p>';
    triviaContainer.style.display = 'block';
}

function listQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = ''; // Clear previous content

    questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question';
        questionItem.innerHTML = decodeHtml(question.question);
        
        questionItem.addEventListener('click', function () {
            // Remove active class from all questions
            document.querySelectorAll('.question').forEach(question => question.classList.remove('active'));

            // Add active class to the clicked question
            questionItem.classList.add('active');
            displayAnswers(index);
        });
        questionsList.appendChild(questionItem);
    });
   

}

function displayAnswers(index) {
    const question = currentQuestions[index];
    const triviaContainer = document.getElementById('trivia');
    triviaContainer.innerHTML = ''; // Clear previous content

    // Create a container for the question
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answer-container';

    // Shuffle the answers
    const answers = [...question.incorrect_answers, question.correct_answer]
        .sort(() => Math.random() - 0.5);

    // Display the answers
    answers.forEach((answer, answerIndex) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-item';
        const inputElement = document.createElement('input');
        inputElement.type = 'radio';
        inputElement.name = 'answers';
        inputElement.id = 'answer' + answerIndex;

        answerElement.addEventListener('click', function() {
            // Remove selected class from all answers
            document.querySelectorAll('.answer-item').forEach(el => el.classList.remove('selected-answer'));
            // Add selected class to clicked answer
            answerElement.classList.add('selected-answer');
        });


        // Set a data attribute if the answer is correct
        if (answer === question.correct_answer) {
            inputElement.dataset.correct = true;
        }

        const labelElement = document.createElement('label');
        labelElement.htmlFor = 'answer' + answerIndex;
        labelElement.textContent = decodeHtml(answer);

        answerElement.appendChild(inputElement);
        answerElement.appendChild(labelElement);
        answersContainer.appendChild(answerElement);
    });

    // Create a container for the submit button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'button';
    submitButton.textContent = 'Submit Answer';
    submitButton.addEventListener('click', () => submitAnswer(index));

    // Append the submit button to the button container
    buttonContainer.appendChild(submitButton);

    // Append the button container to the answers container
    answersContainer.appendChild(buttonContainer);

    triviaContainer.appendChild(answersContainer);
    triviaContainer.style.display = 'block'; // Show the trivia container
}

function submitAnswer(questionIndex) {
    const selectedInput = document.querySelector('input[name="answers"]:checked');
    const submitButton = document.querySelector('#trivia .button'); 

    if (selectedInput) {
        // Check if the selected answer is correct
        const isCorrect = selectedInput.dataset.correct !== undefined;

        // Disable the submit button
        submitButton.disabled = true;

        //Change button text and style based on answer correctness
        submitButton.textContent = isCorrect ? 'Correct!' : 'Wrong Answer!';
        submitButton.classList.add(isCorrect ? 'correct' : 'wrong');

        // Update the score
        const scoreElement = document.getElementById(isCorrect ? 'correctAnswers' : 'wrongAnswers');
        scoreElement.textContent = parseInt(scoreElement.textContent) + 1;

       
        // Highlight the correct and wrong answers
        const answerElements = document.querySelectorAll('#trivia .answer-item');
    answerElements.forEach(item => {
        const input = item.querySelector('input');
            if (input.dataset.correct) {
                item.classList.add('correct-answer');
            } else if (input === selectedInput && !isCorrect) {
                item.classList.add('wrong-answer');
            }
            input.disabled = true; 
            item.classList.add('revealed');
        });

         // Reveal the checkmarks or X marks
         document.querySelectorAll('.answer-item').forEach(item => {
            item.classList.add('revealed');
        });

        // Mark the question as answered and disable further input
        const questionDivs = document.getElementById('questionsList').children;
        const questionDiv = questionDivs[questionIndex];
        questionDiv.classList.add('inactive');
        console.log('Question marked as inactive');
        const inputs = document.querySelectorAll('#trivia input');
        inputs.forEach(input => input.disabled = true);

        // Display prompt text beneath button
        updateDisplayAfterAnswer();
    }
}

function updateDisplayAfterAnswer() {
    const remainingQuestions = Array.from(document.querySelectorAll('.question')).filter(q => !q.classList.contains('inactive'));

    const triviaContainer = document.getElementById('trivia');
    const scoreContainer = document.getElementById('scoreColumn'); 
    const promptContainer = document.getElementById('prompt-container');

    if (remainingQuestions.length > 0) {
        // If there are remaining questions
        const nextQuestionPrompt = document.createElement('p');
        nextQuestionPrompt.textContent = 'Select your next question!';
        nextQuestionPrompt.className = 'select-next-prompt'; 
        triviaContainer.appendChild(nextQuestionPrompt);
    } else {
        // If no remaining questions
        const readyForMorePrompt = document.createElement('p');
        readyForMorePrompt.textContent = 'Ready for more?';
        readyForMorePrompt.className = 'ready-for-more-prompt'; 
        console.log('adding ready for more prompt');
        promptContainer.appendChild(readyForMorePrompt);
    }
    console.log('Remaining questions:', remainingQuestions.length);
}

    // Event listener for the 'New Round' button
    document.getElementById('newRound').addEventListener('click', () => {
        document.getElementById('trivia').style.display = 'none'; // Hide trivia content
        document.getElementById('trivia').innerHTML = ''; // Clear trivia content
        document.getElementById('correctAnswers').textContent = '0';
        document.getElementById('wrongAnswers').textContent = '0';
        document.getElementById('prompt-container').innerHTML = ''; // Clear prompt content
        fetchQuestions();
        displayDefaultMessage();
    });

    // Initial fetch of trivia questions
    fetchQuestions();
    
