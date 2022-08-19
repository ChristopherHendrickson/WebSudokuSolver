let node = 0
let puzzleNumbers = []
const emptyPuzzleNumbers = [
    '','','','','','','','','','','','','','','','','','','','','','','','','','','',
    '','','','','','','','','','','','','','','','','','','','','','','','','','','',
    '','','','','','','','','','','','','','','','','','','','','','','','','','',''
]

const samplePuzzleNumbers = [
    '','','3','','6','','','','','2','','8','','','','','','7','','','6','','4','','','','',
    '8','','','','','5','','','','5','','2','','4','','','7','','','9','','','','','','','2',
    '9','','','','','','','','8','','','','','5','','3','','6','1','','','','','','','','4'
]
const rowLib = {}
const colLib = {}
const bigSquareLib = {}
let direction = 1

const getCurrentRow = function(n){
    return Math.floor((n%9)/3) + 3*Math.floor(n/27)
}

const getCurrentCol = function(n){
    return Math.floor(10*(((n%9)/3)%1))/3 + 3*((Math.floor(n/9))%3)
}

const getCurrentBigSquare = function(n){
    return Math.floor(n/9)
}

const assignSquaresToLibs = function() {
    //Creates lib objects containing reference to each HTML square within each row, column, and big square of the puzzle
    for (let i=0;i<9;i++){
        rowLib[String(i)] = []
        colLib[String(i)] = []
        bigSquareLib[String(i)] = []
    }
    
    for (let i=0;i<81;i++){
        rowLib[String(getCurrentRow(i))].push(document.getElementById("square"+String(i)))
        colLib[String(getCurrentCol(i))].push(document.getElementById("square"+String(i)))
        bigSquareLib[String(getCurrentBigSquare(i))].push(document.getElementById("square"+String(i)))
    }
}



const generateInputBoard = function(defaultPuzzleNumbers) {
    
    let boardHTML = []
    let end = ''
    let start = ''
    
    showSolveButton()

    for (let i=0;i<81;i++) {
        if ((i+1)%9 === 0) {
            //every 9th square close the bigSquare div
            end = '"></div>'
        } else if (((i+1)%3 === 0)){
            //Every third square drop a line
            end = '"><br>'
        } else {
            end = '">'
        }
        if ((i+1)%9 === 1) {
            //every 9th square make a new bigSquare div
            start = "<div class='bigSquares'>"
        } else {
            start=""
        }
        boardHTML.push(start+'<input type="text" onClick="this.select();" inputmode="numeric" value="'+ defaultPuzzleNumbers[i]+'" ' +'class="square" id="square'+i+end)
    }
    let board=document.getElementById('board')
    board.innerHTML = boardHTML.join('')

}

const showSolveButton = function () {
    document.getElementById("solveButton").style.display="inline-block";
    document.getElementById("unsolveButton").style.display="none";
}
const showUnsolveButton = function () {
    document.getElementById("solveButton").style.display="none";
    document.getElementById("unsolveButton").style.display="inline-block";
}

const startLoaderBorder = function () {
    document.getElementById("board").style.padding="10px";
    document.getElementById("board").style.border="0";
}

const stopLoaderBorder = function () {
    document.getElementById("board").style.padding="0";
    document.getElementById("board").style.border="10px solid black";
}

const resetNode = function () {
    node = 0
}
const boardIsValid = function(){
    for (let i=0;i<81;i++) {
        let temp = puzzleNumbers
        if ((temp[i]!='' && isNaN(parseInt(temp[i]))) || parseInt(temp[i]) < 1 || parseInt(temp[i]) > 9 ){
            return false
        }
        if (!valueIsValid(i)) {
            return false
        }
    }
    
    return true
}

const valueIsValid = function(n) {
    let valid = true
    let valueChecking = document.getElementById("square"+String(n)).innerHTML

    if (valueChecking !==""){ //skip empty squares when checking if the input board is valid
        if (valueChecking >9) {
            valid = false
        }
        rowLib[String(getCurrentRow(String(n)))].forEach(squareDiv => {
            if (valueChecking===squareDiv.innerHTML & document.getElementById("square"+String(n))!==squareDiv){
                valid = false //will add a function to edit css to flash red on conflicts, so not returning after first conflict found
            }
        })
        colLib[String(getCurrentCol(String(n)))].forEach(squareDiv => {
            if (valueChecking===squareDiv.innerHTML & document.getElementById("square"+String(n))!==squareDiv){
                valid = false
            }
        })
        bigSquareLib[String(getCurrentBigSquare(String(n)))].forEach(squareDiv => {
            if (valueChecking===squareDiv.innerHTML & document.getElementById("square"+String(n))!==squareDiv){
                valid = false
            }
        })
    }
    return valid
    
}

const unsolve = function() {
    node = 82 //stops the solver loop
    if (puzzleNumbers.length==0){
        generateInputBoard(emptyPuzzleNumbers)
    } else {
        generateInputBoard(puzzleNumbers)
    }
    showSolveButton()
}   
const generateInputBoardAnon = function() {
    node = 82 //stops the solver loop
    puzzleNumbers = []
    generateInputBoard(emptyPuzzleNumbers)
}

const start = function(){
        puzzleNumbers = []
    for (let i=0;i<81;i++) {
        puzzleNumbers.push(document.getElementById("square"+i).value)
    }
    convertBoardToDivs()
    assignSquaresToLibs()
    resetNode()

    if (!boardIsValid()) {

        generateInputBoard(puzzleNumbers)
        document.getElementById("disp").innerHTML='Invalid Board'
    } else {
        showUnsolveButton()
        startLoaderBorder()
        document.getElementById("disp").innerHTML=''
        setTimeout(solveLoop,20)
    }
}

const solveLoop = function() {
    
    while (node < 81 & node >= 0){
        solver()
    }
    stopLoaderBorder()
}





const nodeHasPuzzleNumber = function(node) {
    if (puzzleNumbers[node] != ''){
        return true
    }
    return false
}

const convertBoardToDivs = function () {
    for (let i=0;i<81;i++) {
        let replacement = document.createElement("div")
        replacement.setAttribute("class","smallSquares")
        replacement.setAttribute("id","square"+String(i))
        document.getElementById("square"+String(i)).replaceWith(replacement)
        if (nodeHasPuzzleNumber(i)){
            let nodeWithValue=document.getElementById("square"+String(i))
            nodeWithValue.innerHTML = parseInt(puzzleNumbers[i])
            nodeWithValue.classList.add("hasValue")
        }
    }
}

const solver = function() {


    let currentSquare = document.getElementById("square"+String(node))
    //skip past any sqaures that are part of the puzzle
    while (nodeHasPuzzleNumber(node)){
        // alert("skipping node "+String(node)+" in" +String(direction)+" direction")
        node+=(1*direction)
        currentSquare = document.getElementById("square"+String(node))
        if (node > 80){
            break
        }
    }
    if (node > 80) {
        return
    }

    //get the value in the node
    let currentValue = currentSquare.innerHTML
    if (currentValue == '') {
        currentValue = 0
    } else {
        currentValue = parseInt(currentValue)
    }
    currentValue+=1
    currentSquare.innerHTML = currentValue
    if (valueIsValid(node)) {
        node +=1

    } else {
        
        if (currentValue >= 9){
            currentValue = ''
            direction = -1
            node+=(1*direction)
            currentSquare.innerHTML = currentValue
        } else {
            direction = 1
        }
        
    
        
    }
    if (node < 0){
        document.getElementById("disp").innerHTML='Puzzle has no Solution'
        unsolve()
        return
    }

}

document.getElementById("solveButton").addEventListener("click", start);


document.getElementById("unsolveButton").addEventListener("click", unsolve);
document.getElementById("resetButton").addEventListener("click", generateInputBoardAnon);
document.getElementById("buttonDiv").addEventListener('click', (event) => {
    const isButton = event.target.nodeName === 'BUTTON' & event.target.id!="solveButton";
    if (isButton) {
        document.getElementById("disp").innerHTML=''
    }
});
document.getElementById("sample").addEventListener("click", function() {
    generateInputBoard(samplePuzzleNumbers)
});
