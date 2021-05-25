function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

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
        this._anchorPlayers = new Set()
    }

    players() {
        return this._players
    }

    addPlayer(p,anchor) {
        this._players.push(p)
        if(anchor) {
            this._anchorPlayers.add(p)
        }
    }

    canSwap(){
        //At least one player is not anchored
        return (this._players.length > this._anchorPlayers.size)
    }

    getPlayerForSwap(){
        let selectedIndex = null
        let selectedPlayer = null

        while (selectedIndex==null) {
            let rndIndex = getRandomInt(0,this._players.length)
            let player = this._players[rndIndex]
            if(!this._anchorPlayers.has(player)) {
                selectedIndex = rndIndex
                selectedPlayer = player
            }
        }
        return [selectedPlayer, selectedIndex]
    }

    setPlayerAtIndex(index, newPlayer) {
        this._players[index] = newPlayer
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
    hasPlaces() {
        return this._players.length < this._maxPlayers
    }
    pickPlayersFrom(players, targetWeight) {
        let tempPlayersCopy = Array.from(players)
        let currentWeight = this.weight()

        const solution = this._pickPlayers(tempPlayersCopy, 0, currentWeight, targetWeight, this._players, this._maxPlayers)
        this._players = solution[1]
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

function scoreSolution(groups) {
    let maxGroupW = -Infinity
    let minGroupW = +Infinity

    for(let g of groups) {
        maxGroupW = Math.max(g.weight(), maxGroupW)
        minGroupW = Math.min(g.weight(), minGroupW)
    }
    return maxGroupW - minGroupW
}

function getGroupsForSwap(groups) {
    let g1 = null
    let g2 = null;
    let visitedIndexes = new Set()
    while(g1 == null || g2 ==null) {

        //Can't select two groups
        if(groups.length === visitedIndexes.size) {
            break
        }

        let g1Index = getRandomInt(0,groups.length)
        let g2Index = getRandomInt(0,groups.length)

        visitedIndexes.add(g1Index)
        visitedIndexes.add(g2Index)

        let g1Candidate = groups[g1Index]
        let g2Candidate = groups[g2Index]
        if(!g1 && g1Candidate.canSwap() && g1Candidate !== g2) {
            g1 = g1Candidate
        }

        if(g2 == null && g2Candidate.canSwap() && g2Candidate !== g1) {
            g2 = g2Candidate
        }
    }
    return [g1,g2]
}
//https://en.m.wikipedia.org/wiki/Simulated_annealing
function simulatedAnnealing(groups, iterations){
    let solutionScore = scoreSolution(groups)

    for(let i = 0; i<iterations; i++) {
        let groupSwapInfo = getGroupsForSwap(groups)
        let g1 = groupSwapInfo[0]
        let g2 = groupSwapInfo[1]

        //This may happens if we cant choose two groups
        if(g1 == null || g2 == null)
            break;

        // Swap two players
        let g1SwapInfo = g1.getPlayerForSwap()
        let g2SwapInfo = g2.getPlayerForSwap()

        g2.setPlayerAtIndex(g2SwapInfo[1],g1SwapInfo[0])
        g1.setPlayerAtIndex(g1SwapInfo[1],g2SwapInfo[0])

        let newSolutionScore = scoreSolution(groups)
        if(newSolutionScore<solutionScore) {
            solutionScore = newSolutionScore
            console.log('Swap between %s and %s was great: new score %d -> continue',g1SwapInfo, g2SwapInfo, newSolutionScore)
        }
        else {
            //Unswap -> this was bad decision
            g1.setPlayerAtIndex(g1SwapInfo[1], g1SwapInfo[0])
            g2.setPlayerAtIndex(g2SwapInfo[1], g2SwapInfo[0])
        }
    }
    return [groups, solutionScore]
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

groups[1].addPlayer(new PlayerDTO( 'Перес Марк', 85 ), true)
groups[1].addPlayer(new PlayerDTO( 'Мустафина Регина', 40 ), true)

groups[0].addPlayer(new PlayerDTO( 'Янчевская Ления', 70 ), true)
groups[0].addPlayer(new PlayerDTO( 'Быков Владимир', 100 ), true)

groups[2].addPlayer(new PlayerDTO( 'Шляфер Илья', 70 ),true)
groups[2].addPlayer(new PlayerDTO( 'Процевская Людмила', 50 ), true)
//
groups[3].addPlayer(new PlayerDTO( 'Введенский Алексей', 90 ),true)
groups[3].addPlayer(new PlayerDTO( 'Галиева Диляра', 70 ),true)

let remPlayers = new Set(players)
let TARGET_WEIGHT = 230
for(let group of groups){
    group.pickPlayersFrom(remPlayers, TARGET_WEIGHT)
    // This players already choosen
    group.players().forEach(p => {
        remPlayers.delete(p)
    })
}


let res = simulatedAnnealing(groups)


for(let group of groups) {
    console.log(group.toString())
    console.log('\n\n')
}

console.log('Solution score: %d', res[1])
