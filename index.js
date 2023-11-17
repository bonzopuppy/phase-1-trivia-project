// Global variable to store current questions
let currentQuestions = [];

// Decode HTML entities in a string
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Fetch trivia questions from the API
function fetchQuestions() {
    fetch('https://opentdb.com/api.php?amount=10&type=multiple')
        .then(response => response.json())
        .then(data => {
            currentQuestions = data.results;
            listQuestions(data.results);
            displayDefaultMessage();
        })
        .catch(error => console.error('Error:', error));
}

// Display a default message in the trivia container
function displayDefaultMessage() {
    const triviaContainer = document.getElementById('trivia');
    triviaContainer.innerHTML = '<p class="default-message">Select a question to start the round!</p>';
    triviaContainer.style.display = 'block';
}

// List all fetched questions
function listQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question';
        questionItem.innerHTML = decodeHtml(question.question);
        questionItem.addEventListener('click', () => selectQuestion(questionItem, index));
        questionsList.appendChild(questionItem);
    });
}

// Handle question selection
function selectQuestion(questionItem, index) {
    clearActiveQuestions();
    questionItem.classList.add('active');
    displayAnswers(index);
}

// Clear active state from all questions
function clearActiveQuestions() {
    document.querySelectorAll('.question').forEach(question => question.classList.remove('active'));
}

// Display answers for the selected question
function displayAnswers(index) {
    const question = currentQuestions[index];
    const triviaContainer = document.getElementById('trivia');
    triviaContainer.innerHTML = '';

    const answersContainer = createAnswersContainer(question, index);
    triviaContainer.appendChild(answersContainer);
    triviaContainer.style.display = 'block';
}

// Create a container with answers and a submit button
function createAnswersContainer(question, index) {
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answer-container';

    const shuffledAnswers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
    shuffledAnswers.forEach((answer, answerIndex) => {
        answersContainer.appendChild(createAnswerElement(answer, answerIndex, question.correct_answer));
    });

    answersContainer.appendChild(createSubmitButton(index));
    return answersContainer;
}

// Create an individual answer element
function createAnswerElement(answer, answerIndex, correctAnswer) {
    const answerElement = document.createElement('div');
    answerElement.className = 'answer-item';

    const inputElement = createAnswerInput(answerIndex, answer === correctAnswer);
    const labelElement = createAnswerLabel(answerIndex, answer);

    answerElement.appendChild(inputElement);
    answerElement.appendChild(labelElement);
    answerElement.addEventListener('click', () => selectAnswer(answerElement));
    return answerElement;
}

// Create an input element for an answer
function createAnswerInput(answerIndex, isCorrect) {
    const inputElement = document.createElement('input');
    inputElement.type = 'radio';
    inputElement.name = 'answers';
    inputElement.id = 'answer' + answerIndex;
    if (isCorrect) {
        inputElement.dataset.correct = true;
    }
    return inputElement;
}

// Create a label element for an answer
function createAnswerLabel(answerIndex, answer) {
    const labelElement = document.createElement('label');
    labelElement.htmlFor = 'answer' + answerIndex;
    labelElement.textContent = decodeHtml(answer);
    return labelElement;
}

// Handle answer selection
function selectAnswer(answerElement) {
    clearSelectedAnswers();
    answerElement.classList.add('selected-answer');
}

// Clear selected state from all answers
function clearSelectedAnswers() {
    document.querySelectorAll('.answer-item').forEach(el => el.classList.remove('selected-answer'));
}

// Create a submit button
function createSubmitButton(questionIndex) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const submitButton = document.createElement('button');
    submitButton.className = 'button';
    submitButton.textContent = 'Submit Answer';
    submitButton.addEventListener('click', () => submitAnswer(questionIndex));

    buttonContainer.appendChild(submitButton);
    return buttonContainer;
}

// Submit the selected answer
function submitAnswer(questionIndex) {
    const selectedInput = document.querySelector('input[name="answers"]:checked');
    const submitButton = document.querySelector('#trivia .button');

    if (selectedInput) {
        const isCorrect = selectedInput.dataset.correct !== undefined;
        submitButton.disabled = true;
        submitButton.textContent = isCorrect ? 'Correct!' : 'Wrong Answer!';
        submitButton.classList.add(isCorrect ? 'correct' : 'wrong');

        updateScore(isCorrect);
        highlightAnswers();
        markQuestionAsAnswered(questionIndex);
        updateDisplayAfterAnswer();
    }
}

// Update the score based on the answer correctness
function updateScore(isCorrect) {
    const scoreElement = document.getElementById(isCorrect ? 'correctAnswers' : 'wrongAnswers');
    scoreElement.textContent = parseInt(scoreElement.textContent) + 1;
}

// Highlight correct and wrong answers
function highlightAnswers() {
    document.querySelectorAll('#trivia .answer-item').forEach(item => {
        const input = item.querySelector('input');
        if (input.dataset.correct) {
            item.classList.add('correct-answer');
        } else if (input.checked && !input.dataset.correct) {
            item.classList.add('wrong-answer');
        }
        input.disabled = true;
        item.classList.add('revealed');
    });
}

// Mark the question as answered
function markQuestionAsAnswered(questionIndex) {
    const questionDivs = document.getElementById('questionsList').children;
    const questionDiv = questionDivs[questionIndex];
    questionDiv.classList.add('inactive');
}

// Update the display after an answer is submitted
function updateDisplayAfterAnswer() {
    const remainingQuestions = Array.from(document.querySelectorAll('.question')).filter(q => !q.classList.contains('inactive'));
    const triviaContainer = document.getElementById('trivia');
    const promptContainer = document.getElementById('prompt-container');

    if (remainingQuestions.length > 0) {
        triviaContainer.appendChild(createNextQuestionPrompt());
    } else {
        promptContainer.appendChild(createReadyForMorePrompt());
    }
}

// Create a prompt for selecting the next question
function createNextQuestionPrompt() {
    const nextQuestionPrompt = document.createElement('p');
    nextQuestionPrompt.textContent = 'Select your next question!';
    nextQuestionPrompt.className = 'select-next-prompt';
    return nextQuestionPrompt;
}

// Create a prompt for when all questions are answered
function createReadyForMorePrompt() {
    const readyForMorePrompt = document.createElement('p');
    readyForMorePrompt.textContent = 'Ready for more?';
    readyForMorePrompt.className = 'ready-for-more-prompt';
    return readyForMorePrompt;
}

// Event listener for the 'New Round' button
document.getElementById('newRound').addEventListener('click', startNewRound);

// Start a new round of trivia
function startNewRound() {
    document.getElementById('trivia').style.display = 'none';
    document.getElementById('trivia').innerHTML = '';
    document.getElementById('correctAnswers').textContent = '0';
    document.getElementById('wrongAnswers').textContent = '0';
    document.getElementById('prompt-container').innerHTML = '';
    fetchQuestions();
    displayDefaultMessage();
}

// Initial fetch of trivia questions
fetchQuestions();
