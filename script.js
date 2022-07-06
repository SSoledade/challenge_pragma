const readLine = require('readline');
const fs = require('fs');
const readable = fs.createReadStream('Quake.txt');
const rl = readLine.createInterface({
    input: readable,
})

let log = [];
let currentGame = 0;

readLineFromTxt();

function readLineFromTxt() {
    rl.on('line', (line) => {
        let separateLine = line.split(" ")

        if (separateLine[1] == 'InitGame:') {
            console.log(`Iniciou a partida: ${currentGame}!`);
            createGame(currentGame);
        }

        if (separateLine[1] == 'ShutdownGame:') {
            currentGame++;
            createFileJson();
            console.log(" Terminou uma partida!\n");
        }

        if (separateLine[1] == 'ClientUserinfoChanged:') {
            for (let index = 0; index < log[currentGame].status.players.length; index++) {
                if (log[currentGame].status.players[index].id == separateLine[2]) {
                    updateNamePlayer(currentGame, [separateLine[3], separateLine[4], separateLine[5]], index)
                    console.log("Id linha:", separateLine[2], "id index:", log[currentGame].status.players[index].id)
                    return;
                }
            }
            createPlayer(currentGame, separateLine[2], [separateLine[3], separateLine[4], separateLine[5]]);
        }

        if (separateLine[1] == 'Kill:') {
            countKills(currentGame, parseInt(separateLine[2]), separateLine[3]);
        }

    });
}


function createGame(idGame) {
    log[idGame] = {
        "game": idGame,
        "status": {
            "total_kills": 0,
            "players": [],
        },
    };
}

function createPlayer(idGame, idPlayer, namePlayer) {
    log[idGame].status.players.push({
        "id": parseInt(idPlayer),
        "nome": formattedName(namePlayer[0], namePlayer[1], namePlayer[2]),
        "kills": 0,
        "old_names": []
    });
}

function updateNamePlayer(idGame, namePlayer, indexPlayer) {
    let namePlayerFormatted = formattedName(namePlayer[0], namePlayer[1], namePlayer[2]);

    if (namePlayerFormatted != log[idGame].status.players[indexPlayer].nome) {
        log[idGame].status.players[indexPlayer].old_names.push(log[idGame].status.players[indexPlayer].nome);
        log[idGame].status.players[indexPlayer].nome = namePlayerFormatted;
    }
}

function countKills(idGame, playerWhoKilled, playerWhoDied) {

    let killFromWorld = parseInt(playerWhoKilled) == 1022 ? true : false;
    for (let index = 0; index < log[idGame].status.players.length; index++) {

        if (log[idGame].status.players[index].id == (killFromWorld ? parseInt(playerWhoDied) : parseInt(playerWhoKilled))) {
            if (killFromWorld) {
                log[idGame].status.players[index].kills--;
            } else {
                log[idGame].status.players[index].kills++;
            }
            log[idGame].status.total_kills++;
            return;
        }
    }
}

function formattedName(string1, string2 = '', string3 = '') {

    if (string3 != '') {
        return `${string1.substring(2)} ${string2} ${string3.substring(0, string3.indexOf('\\', 0) != -1 ? string3.indexOf('\\', 0) : 15)}`;
    } else if (string2 != "") {
        return `${string1.substring(2)} ${string2.substring(0, string2.indexOf('\\', 2) != -1 ? string2.indexOf('\\', 2) : 15)}`;
    } else {
        return string1.substring(2, string1.indexOf('\\', 2) != -1 ? string1.indexOf('\\', 2) : 15);
    }
}

function createFileJson() {
    fs.truncate('parseLog.json', 0, () => {});
    fs.appendFile('parseLog.json', JSON.stringify(log), function(err) {
        if (err) throw err;
    });
}