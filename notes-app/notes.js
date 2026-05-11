const readline = require('node:readline');

const standByPrompt = `
──────────────────────────────────────────────────────────────
  Notes App
──────────────────────────────────────────────────────────────
  [1] Titles
  [2] Retrieve note
  [3] New note
  [4] Delete note
  [5] Exit
──────────────────────────────────────────────────────────────
>`

const retrievePrompt = `\nNote id?`;

const createTitlePrompt = '\nNote title?';
const createBodyPrompt = '\nNote body?';
const deletePrompt = '\nNote to delete?';
const pressEnterPrompt = "\nPress 'enter' to continue...";

let newTitle;

///// *State Machine* /////

const Modes = {
  STANDBY: 'StandBy',
  RETRIEVING: 'Retrieving',
  CREATE_TITLE: 'Creating:Title',
  CREATE_BODY: 'Creating:Body',
  DELETING: 'Deleting'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function activateMode(mode) {
  activeMode = mode;

  switch (mode) {
  case Modes.STANDBY:
    rl.setPrompt(standByPrompt);
    break;

  case Modes.RETRIEVING:
    rl.setPrompt(retrievePrompt);
    break;

  case Modes.CREATE_TITLE:
    rl.setPrompt(createTitlePrompt);
    break;

  case Modes.CREATE_BODY:
    rl.setPrompt(createBodyPrompt);
    break;

  case Modes.DELETING:
    rl.setPrompt(deletePrompt);
    break;

  default:
    throw new Error(`Undefined mode: ${mode}`);
  }
}

///// *Initialize State* /////

let activeMode = Modes.STANDBY;

rl.setPrompt(standByPrompt);

// let notes = [];

const notes = [
  [1, "Title 1", "Firs note"],
  [2, "Title 2", "Second note"],
  [3, "Title 3", "Third note"]
];

let next_idx = notes.length + 1;

///// *Start* /////

rl.on('line', (line) => {
  switch (activeMode) {
  case 'StandBy':
    handleStandBy(line);
    break;
  case 'Retrieving':
    handleRetrieve(line);
    break;
  case 'Creating:Title':
    handleCreateTitle(line);
    break;
  case 'Creating:Body':
    handleCreateBody(line);
    break;
  case 'Deleting':
    handleDelete(line);
    break;
  default:
    throw new Error('Unexpected!');
    break;
  }
}).on('close', () => {
  console.log("Good Bye!");
  process.exit(0);
});

rl.prompt();

///// *Handlers* /////

function handleStandBy(line) {
  switch (line.trim()) {
  case '1':
    console.log('');
    for (const [id, title, body] of notes) {
      console.log(`${id}: ${title}`);
    }
    rl.prompt();
    break;
  case'2':
    activateMode(Modes.RETRIEVING);
    rl.prompt();
    break;
  case'3':
    activateMode(Modes.CREATE_TITLE);
    rl.prompt();
    break;
  case'4':
    activateMode(Modes.DELETING);
    rl.prompt();
    break;
  case '5':
    console.log("Exiting...");
    rl.close();
    break;
  default:
    console.log("Unrecognized option.");
    rl.prompt();
    break;
  }
}

function handleRetrieve(line) {
  const id = Number(line.trim());
  const idx = notes.findIndex((note) => note[0] === id);
  if (idx !== -1) {
    try {
      console.log('');
      console.log(notes[idx][2]);
    } catch (err) {
      console.error(`Something went wrong: ${err}`);
    }
  } else {
    console.log(`Couldn't find a note with id = ${id}.`);
  }
  pauseAndReturnToStandBy();
}

function handleCreateTitle(line) {
  newTitle = line.trim();
  activateMode(Modes.CREATE_BODY);
  rl.prompt();
}

function handleCreateBody(line) {
  const body = line.trim();
  if (body) {
    const newNote = [next_idx, newTitle, line.trim()];
    notes.push(newNote);
    next_idx += 1;
    console.log("\nNote created!");
  } else {
    console.log("\nNote creation canceled.");
  }
  newTitle = undefined;
  pauseAndReturnToStandBy();
}

function handleDelete(line) {
  const id = Number(line.trim());
  const idx = notes.findIndex((note) => note[0] === id);
  if (idx !== -1) {
    notes.splice(idx, 1);
    console.log(`\nNote ${id} deleted.`);
  } else {
    console.log(`Couldn't delete note with id = ${id}.`);
  }
  pauseAndReturnToStandBy();
}

function pauseAndReturnToStandBy() {
  rl.question(pressEnterPrompt, () => {
    activateMode(Modes.STANDBY);
    rl.prompt();
  });
}
