const qBlock = document.getElementById("question-general");
const qBlockAnswer = qBlock.querySelector(".answer");
const qBlockDescription = qBlock.querySelector(".description");

const argBlock = document.getElementById("question-argument");
const argBlockAnswer = argBlock.querySelector(".answer");
const argBlockDescription = argBlock.querySelector(".description");

const checkBtn = document.getElementById("btn-check");
const nextBtn = document.getElementById("btn-next");

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * @param {Element} parent
 * @param {string} querySelector
 * @param {function(Element): any} callback
 * @returns any
*/
function executeFor(parent, querySelector, callback) {
  return callback(parent.querySelector(querySelector))
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
    await fetch("https://raw.githubusercontent.com/oxi1224/inf02-komendy/refs/heads/main/komendy.json", { cache: "no-store" })
      .then(async (res) => await res.json())
      .catch(err => {console.error(err); return []})
  );

  console.log(questions);

  nextBtn.addEventListener("click", () => {
    let qID = random(0, questions.length);
    let argID = random(0, questions[qID].arguments.length);
    checkBtn.setAttribute("data_index", `${qID}|${argID}`);
    
    qBlock
      .querySelector(".question").textContent = questions[qID].questions[0] + "?";
    qBlockAnswer.classList.remove("incorrect", "correct");
    qBlockAnswer.value = "";
    qBlockDescription.style.display = "none";
    
    argBlockAnswer.value = "";
    if (questions[qID].arguments.length == 0) {
      argBlock.classList.add("inactive-block");
      argBlock.querySelector(".question").textContent = "Brak pytania";
    } else {
      argBlock.classList.remove("inactive-block");
      argBlock.querySelector(".question").textContent = questions[qID]?.arguments[argID]?.question + "?";
      argBlockAnswer.classList.remove("incorrect", "correct");
      argBlockDescription.style.display = "none";
    }
  });

  checkBtn.addEventListener("click", () => {
    const dataIdx = checkBtn.getAttribute("data_index");
    if (dataIdx == null) {
      alert("Coś poszło nie tak");
      return;
    }
    const qID = parseInt(dataIdx.substring(0, dataIdx.indexOf("|")));
    const argID = parseInt(dataIdx.substring(dataIdx.indexOf("|") + 1));
    
    if (qBlockAnswer.value.trim() == questions[qID].command) {
      qBlockAnswer.classList.add("correct");
    } else {
      qBlockAnswer.classList.add("incorrect");
    }
    qBlockDescription.innerHTML = addCodeBlocks(questions[qID].description);
    qBlockDescription.style.display = "block";
    
    if (questions[qID].arguments.length > 0) {
      if (
        questions[qID].arguments[argID].arguments
          .filter(s => !s.startsWith("$"))
          .includes(argBlockAnswer.value.trim())
      ) {
        argBlockAnswer.classList.add("correct");
      } else {
        argBlockAnswer.classList.add("incorrect");
      }
      argBlockDescription.innerHTML = addCodeBlocks(questions[qID].arguments[argID].description);
      argBlockDescription.style.display = "block";
    } else {
      argBlock.querySelector(".question").textContent = "Brak pytania";
    }
  });
  nextBtn.click();
})();
