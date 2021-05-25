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
    constructor(maxPlayers) {
        this._players = []
        this._maxPlayers = maxPlayers
    }

    players() {
        return this._players
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
        const solution = this._pickPlayers(tempPlayersCopy, 0, 0, targetWeight, [], this._maxPlayers)
        const selectedPlayers = solution[1]
        selectedPlayers.forEach(p => this._players.push(p))
    }

    _pickPlayers(players, pIndex, curSum, targetSum, team, teamSize) {

        if(team.length == teamSize || pIndex == players.length) {
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
    new PlayerDTO( 'Быков Владимир', 100 ),
    new PlayerDTO( 'Введенская Ирина', 60 ),
    new PlayerDTO( 'Введенский Алексей', 90 ),
    new PlayerDTO( 'Галиев Рустам', 60 ),
    new PlayerDTO( 'Галиева Диляра', 70 ),
    new PlayerDTO( 'Грачева Анна', 30 ),
    new PlayerDTO( 'Енютина Галина', 60 ),
    new PlayerDTO( 'Ермак Наталья', 60 ),
    new PlayerDTO( 'Ефимов Алексей', 55 ),
    new PlayerDTO( 'Луговая Валерия', 65 ),
    new PlayerDTO( 'Макарова Анна', 60 ),
    new PlayerDTO( 'Маркова Наталья', 75 ),
    new PlayerDTO( 'Мустафина Регина', 40 ),
    new PlayerDTO( 'Новрузова Наталья', 25 ),
    new PlayerDTO( 'Перес Марк', 85 ),
    new PlayerDTO( 'Першина Ольга', 50 ),
    new PlayerDTO( 'Процевская Людмила', 50 ),
    new PlayerDTO( 'Филлипова Вера', 25 ),
    new PlayerDTO( 'Чернышов Иван', 50 ),
    new PlayerDTO( 'Чернышова Елена', 60 ),
    new PlayerDTO( 'Шаляева Татьяна', 30 ),
    new PlayerDTO( 'Шляфер Илья', 70 ),
    new PlayerDTO( 'Янчевская Ления', 70 )
]


//Calculate expected average value
const sum = players.reduce(function (accumulator, currentValue){
    return accumulator + currentValue.weight();
}, 0);

playerPerTeam = 4
teamCount = players.length / playerPerTeam

const targetSum = sum / teamCount;

console.log('Target sum: %d', targetSum)



remPlayers = new Set(players)
for (let groupId = 0; groupId < teamCount ; groupId++) {
    let g = new PlayerGroup(playerPerTeam)
    g.pickPlayersFrom(remPlayers,targetSum)
    // This players already choosen
    g.players().forEach(p => {
        remPlayers.delete(p)
    })

    console.log(g.toString())
    console.log('=============================')
}