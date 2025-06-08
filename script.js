const qBlock = document.getElementById("question-general");
const argBlock = document.getElementById("question-argument");
const checkBtn = document.getElementById("btn-check");
const nextQuestionBtn = document.getElementById("btn-next");

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * @param {string} txt
*/
function addCodeBlocks(txt) {
  let out = "";
  let aposCount = 0;
  for (let i = 0; i < txt.length; i++) {
    if (txt.charAt(i) == "`") {
      if (aposCount != 0 && aposCount % 2 != 0) {
        out += "</span>";
      } else {
        out += '<span class="codeblock">';
      }
      aposCount++;
    } else {
      out += txt.charAt(i);
    }
  }
  return out;
}

/**
 * @typedef {Object} ArgumentQuestion
 * @property {string} question
 * @property {string[]} arguments
 * @property {string} description
*/

/**
 * @typedef {Object} GeneralQuestion
 * @property {string[]} questions
 * @property {string} command
 * @property {string} description
 * @property {ArgumentQuestion[]} arguments
*/

(async () => {
  /**
   * @type {GeneralQuestion[]}
   * @const
  */
  const questions = Object.freeze(
    await fetch("https://raw.githubusercontent.com/oxi1224/inf02-komendy/refs/heads/main/komendy.json")
      .then(async (res) => await res.json())
      .catch(_ => [])
  );

  nextQuestionBtn.addEventListener("click", () => {
    let qID = random(0, questions.length);
    let argID = random(0, questions[qID].arguments.length);
    checkBtn.setAttribute("data_index", `${qID}|${argID}`);
    
    qBlock
      .querySelector(".question").textContent = questions[qID].questions[0] + "?";
    qBlock.querySelector(".answer").classList.remove("incorrect", "correct");
    qBlock.querySelector(".description").style.display = "none";
    
    argBlock
      .querySelector(".question")
      .textContent = questions[qID].arguments.length == 0 ? "Brak pytania" : questions[qID]?.arguments[argID]?.question + "?";
    argBlock.querySelector(".answer").classList.remove("incorrect", "correct");
    argBlock.querySelector(".description").style.display = "none";
  });

  checkBtn.addEventListener("click", () => {
    const dataIdx = checkBtn.getAttribute("data_index");
    if (dataIdx == null) {
      alert("Coś poszło nie tak");
      return;
    }
    const qID = parseInt(dataIdx.substring(0, dataIdx.indexOf("|")));
    const argID = parseInt(dataIdx.substring(dataIdx.indexOf("|") + 1));
    
    if (qBlock.querySelector(".answer").value.trim() == questions[qID].command) {
      qBlock.querySelector(".answer").classList.add("correct");
    } else {
      qBlock.querySelector(".answer").classList.add("incorrect");
    }
    qBlock.querySelector(".description").innerHTML = addCodeBlocks(questions[qID].description);
    qBlock.querySelector(".description").style.display = "block";
    
    if (questions[qID].arguments.length > 0) {
      if (
        questions[qID].arguments[argID].arguments
          .filter(s => !s.startsWith("$"))
          .includes(argBlock.querySelector(".answer").value.trim())
      ) {
        argBlock.querySelector(".answer").classList.add("correct");
      } else {
        argBlock.querySelector(".answer").classList.add("incorrect");
      }
      argBlock.querySelector(".description").innerHTML = addCodeBlocks(questions[qID].arguments[argID].description);
      argBlock.querySelector(".description").style.display = "block";
    } else {
      argBlock.querySelector(".question").textContent = "Brak pytania";
    }
  });
})();
