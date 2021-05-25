class PlayerDTO{
    constructor(name, weight) {
        this._name = name
        this._weight = weight
    }

    static fromString(value) {
        const preparedString = value.replace(/\t/g,' ').replace(/\s\s+/g, '');
        const matchInfo = preparedString.match(/^(.*)(\s+\d+)$/)
        if(!matchInfo) {
            return null
        }

        const player = matchInfo[1]
        const weight = parseFloat(matchInfo[2].trim())
        return new PlayerDTO(player, weight)
    }

    weight() {
        return this._weight;
    }

    toString() {
        return this._name + ' ' + this._weight
    }
}

class PlayerGroup {
    constructor(maxPlayers, relatedTextArea) {
        this._players = []
        this._maxPlayers = maxPlayers
        this._relatedTextArea = relatedTextArea
    }

    players() {
        return this._players
    }

    addPlayer(p) {
        this._players.push(p)
    }

    weight() {
        let totalWeight = 0
        for(let p of this._players) {
            totalWeight += p.weight()
        }
        return totalWeight
    }

    showOnGUI() {
        this._relatedTextArea.value = this.toString()
    }

    toString() {
        const parts = []
        let totalWeight = 0
        for(let p of this._players) {
            parts.push(p.toString())
            totalWeight += p.weight()
        }
        parts.push('---------')
        parts.push(totalWeight)
        return parts.join('\n')
    }

    pickPlayersFrom(players, targetWeight) {
        let tempPlayersCopy = Array.from(players)
        let currentWeight = this.weight()

        const solution = this._pickPlayers(tempPlayersCopy, 0, currentWeight, targetWeight, this._players, this._maxPlayers)
        const selectedPlayers = solution[1]
        this._players = selectedPlayers
    }

    _pickPlayers(players, pIndex, curSum, targetSum, team, teamSize) {

        if(team.length === teamSize || pIndex === players.length) {
            const score = Math.abs(targetSum-curSum)
            return [score,[...team]]
        }

        const playerOnIndex = players[pIndex]

        team.push(playerOnIndex)
        const pick = this._pickPlayers(players, pIndex+1, curSum + playerOnIndex.weight(),targetSum,team, teamSize)
        team.pop()

        const notPick = this._pickPlayers(players, pIndex+1, curSum,targetSum, team, teamSize)

        return this._chooseSolution(pick, notPick)
    }

    _chooseSolution(first, second) {
        const score1 = first[0]
        const score2 = second[0]

        const team1_length = first[1].length
        const team2_length = second[1].length
        if (team1_length === team2_length) {
            if (score1 < score2) {
                return first;
            } else {
                return second
            }
        }
        else {
            if(team1_length > team2_length) {
                return first;
            }
            else {
                return second;
            }
        }
    }
}

players = [
    new PlayerDTO( 'Алексеева Юля', 40 ),

    new PlayerDTO( 'Введенская Ирина', 60 ),
    new PlayerDTO( 'Галиев Рустам', 60 ),
    new PlayerDTO( 'Грачева Анна', 30 ),
    new PlayerDTO( 'Енютина Галина', 60 ),
    new PlayerDTO( 'Ермак Наталья', 60 ),
    new PlayerDTO( 'Ефимов Алексей', 55 ),
    new PlayerDTO( 'Луговая Валерия', 65 ),
    new PlayerDTO( 'Макарова Анна', 60 ),
    new PlayerDTO( 'Маркова Наталья', 75 ),
    new PlayerDTO( 'Новрузова Наталья', 25 ),
    //
    new PlayerDTO( 'Першина Ольга', 50 ),
    new PlayerDTO( 'Филлипова Вера', 25 ),
    new PlayerDTO( 'Чернышов Иван', 50 ),
    new PlayerDTO( 'Чернышова Елена', 60 ),
    new PlayerDTO( 'Шаляева Татьяна', 30 ),

]


groups = [
    new PlayerGroup(4, null),
    new PlayerGroup(4, null),
    new PlayerGroup(4, null),
    new PlayerGroup(4, null),
    new PlayerGroup(4, null),
    new PlayerGroup(4, null),
]

groups[1].players().push(new PlayerDTO( 'Перес Марк', 85 ))
groups[1].players().push(new PlayerDTO( 'Мустафина Регина', 40 ))

groups[0].players().push(new PlayerDTO( 'Янчевская Ления', 70 ))
groups[0].players().push(new PlayerDTO( 'Быков Владимир', 100 ))

groups[2].players().push(new PlayerDTO( 'Шляфер Илья', 70 ))
groups[2].players().push(new PlayerDTO( 'Процевская Людмила', 50 ))
//
groups[3].players().push(new PlayerDTO( 'Введенский Алексей', 90 ))
groups[3].players().push(new PlayerDTO( 'Галиева Диляра', 70 ))


function bestSolution(s1, s2) {
    if(!s1){
        return s2
    }
    if(s1[0] < s2[0]) {
        return s1;
    }
    else
        return s2;
}

BEST_SOLUTION = null

function f(players, playerIndex, groups, teamSize){
    // console.log('Called with %d', playerIndex)
    if(playerIndex === players.length) {
        let maxGroupW = -Infinity
        let minGroupW = +Infinity

        let groupPlayers = []
        for(let g of groups) {
            maxGroupW = Math.max(g.weight(), maxGroupW)
            minGroupW = Math.min(g.weight(), minGroupW)
            groupPlayers.push(g.players().slice())
        }
        let mineSolution = [maxGroupW - minGroupW, groupPlayers]
        BEST_SOLUTION = bestSolution(BEST_SOLUTION, mineSolution)
        console.log('Best: %d', BEST_SOLUTION[0])
        return
    }

    let completeGroups = groups.filter(g => g.players().length === teamSize)

    if(completeGroups.length >= 2 && BEST_SOLUTION) {
        let maxGroupW = -Infinity
        let minGroupW = +Infinity
        for(let g of completeGroups) {
            maxGroupW = Math.max(g.weight(), maxGroupW)
            minGroupW = Math.min(g.weight(), minGroupW)
        }
        let solutionW = maxGroupW - minGroupW
        let bestSolutionW = BEST_SOLUTION[0]
        if(bestSolutionW <= solutionW ) {
            console.log('Abort %d -- better already exists (%d)',solutionW, bestSolutionW)
            return
        }
    }

    // Else continue our stuff
    let freeGroups = groups.filter(g => g.players().length < teamSize).sort((a,b) => b.weight() - a.weight())
    let player = players[playerIndex]

    for (let g of freeGroups) {
        g.players().push(player)
        f(players, playerIndex + 1 , groups, teamSize)
        g.players().pop()
    }
}

f(players, 0, groups, 4)

console.log(BEST_SOLUTION)

