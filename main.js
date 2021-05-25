var groupsTextAreaArray = []
var preDefinedPlayersTextAreaArray = []


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

function createTextAreaChildToTable(tableRow) {
    var tableColumn = document.createElement('td')
    var groupTextArea = document.createElement('textarea')
    groupTextArea.style = 'height: 150px;'

    tableColumn.appendChild(groupTextArea)
    tableRow.appendChild(tableColumn)
    return groupTextArea
}

function clickGenerate(){
    var generateBtn = document.getElementById('generateBtn')
    generateBtn.onclick()
}

function parsePlayersFromText(text) {
    var playerRows = text.trim().split('\n')
    var players = []
    for (let row of playerRows) {

        if(!row) {
            continue
        }

        const p = PlayerDTO.fromString(row)
        if(p){
            players.push(p)
        }else {
            alert("Can't parse row: " + row)
        }
    }
    return players
}

function initUI(){
    var btn = document.createElement("number");

    document.body.appendChild(btn);               // Append <button> to <body>

    const playerList = document.getElementById('playersListTextArea')
    const generateBtn = document.getElementById('generateBtn')
    const clearBtn = document.getElementById('clearBtn')
    const groupsTableRow = document.getElementById('groupsTableRow')
    const preDefinedPlayersTableRow = document.getElementById('preDefinedPlayersTableRow')

    const countPerGroupInput = document.getElementById('countPerGroupInput')
    clearBtn.onclick = function () {
        groupsTextAreaArray.forEach(textArea => {
            textArea.value = ''
        })
    }

    generateBtn.onclick = function (){
        var players = parsePlayersFromText(playerList.value)
        var preDefinedPlayers = []
        var preDefinedPlayersCount = 0

        for(let groupId = 0; groupId < preDefinedPlayersTextAreaArray.length ; groupId++) {
            let content = preDefinedPlayersTextAreaArray[groupId].value
            preDefinedPlayers[groupId]  = []

            for (let preDefinedPlayer of parsePlayersFromText(content)) {
                preDefinedPlayers[groupId].push(preDefinedPlayer)
                preDefinedPlayersCount += 1
            }
        }

        const playerPerGroup = parseFloat(countPerGroupInput.value)
        const playersCount = players.length + preDefinedPlayersCount
        const groupCount = Math.ceil(playersCount/playerPerGroup)


        for (let groupId = 0; groupId < groupCount; groupId++) {
            if(groupId < groupsTextAreaArray.length){
                //Already created
                continue
            }

            groupsTextAreaArray[groupId] = createTextAreaChildToTable(groupsTableRow)
            preDefinedPlayersTextAreaArray[groupId] = createTextAreaChildToTable(preDefinedPlayersTableRow)
        }

        if(groupsTextAreaArray.length > groupCount) {
            for(let groupId = groupCount; groupId < groupsTextAreaArray.length ; groupId ++) {
                groupsTextAreaArray[groupId].parentElement.remove()
                preDefinedPlayersTextAreaArray[groupId].parentElement.remove()
            }

            groupsTextAreaArray.splice(groupCount, groupsTextAreaArray.length - groupCount)
            preDefinedPlayersTextAreaArray.splice(groupCount, groupsTextAreaArray.length - groupCount)
        }
        const hiddenElements = document.getElementsByClassName('show-after-generate')
        for(let e of hiddenElements) {
            e.style.display = 'inline'
        }

        generateGroups(players, groupCount, playerPerGroup, preDefinedPlayers)
    }
}
function generateGroups(players, groupCount, playerPerGroup, preDefinedPlayers) {

    let permutationCount = parseInt(document.getElementById('permutationCount').value)
    let initialSolution = averageWeightedBalancing(players,groupCount, playerPerGroup, preDefinedPlayers)

    let simulatedSolution = simulatedAnnealing(initialSolution, permutationCount)
    console.log('Solution score is: %d', simulatedSolution[1])
    for( let g of simulatedSolution[0]) {
        g.showOnGUI()
    }
    let scoreLabel = document.getElementById('scoreLabel')
    let solutionQuality = simulatedSolution[1]
    if(solutionQuality === 0) {
        scoreLabel.style.color = 'green'
    }
    else {
        scoreLabel.style.color = 'red'
    }
    scoreLabel.innerText = solutionQuality
}

function averageWeightedBalancing(players, groupCount, playerPerGroup, preDefinedPlayers){

    //Calculate expected average value
    let playerWeightSum = players.reduce(function (accumulator, currentValue){
        return accumulator + currentValue.weight();
    }, 0);


    // Construct groups & add predefined players & calc expected awerage
    let playerGroups = []
    for(let groupId = 0 ; groupId < groupCount; groupId++){
        let groupTextArea = groupsTextAreaArray[groupId]
        const group = new PlayerGroup(playerPerGroup,groupTextArea)

        // If this is not first run -> predefined players may already exists
        if (preDefinedPlayers.length >= groupCount) {
            for (let predefinedPlayer of preDefinedPlayers[groupId]) {
                group.addPlayer(predefinedPlayer,true)
            }
        }

        playerGroups.push(group)
        playerWeightSum += group.weight()
    }
    const targetGroupWeight = playerWeightSum / groupCount;

    // We will form empty groups first
    playerGroups.sort((a,b) => b.weight() - a.weight())
//    players.sort((a,b) => b.weight() - a.weight())
     shuffleArray(players)
   // shuffleArray(playerGroups)

    // Strong players first
    // players.sort((a,b) => b.weight() - a.weight())

    // Split players to teams


    let remPlayers = new Set(players)
    for(let group of playerGroups){
        group.pickPlayersFrom(remPlayers, targetGroupWeight)
        // This players already choosen
        group.players().forEach(p => {
            remPlayers.delete(p)
        })
    }
    return playerGroups
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

    for(var i = 0; i<iterations; i++) {
        let groupSwapInfo = getGroupsForSwap(groups)
        let g1 = groupSwapInfo[0]
        let g2 = groupSwapInfo[1]

        //This may happens if we cant choose two groups
        if(g1 == null || g2 == null)
            break;

        // Swap two players
        let g1SwapInfo = g1.getPlayerForSwap()
        let g2SwapInfo = g2.getPlayerForSwap()

        let g1SwapPlayer = g1SwapInfo[0]
        let g2SwapPlayer = g2SwapInfo[0]

        if(g1SwapPlayer.weight() === g2SwapPlayer.weight()) {
            continue;
        }

        g2.setPlayerAtIndex(g2SwapInfo[1],g1SwapPlayer)
        g1.setPlayerAtIndex(g1SwapInfo[1],g2SwapPlayer)

        let newSolutionScore = scoreSolution(groups)
        if(newSolutionScore<=solutionScore) {
            solutionScore = newSolutionScore
            // console.log('Swap between %s and %s was great: new score %d -> continue',
            //     g1SwapInfo[0].toString(), g2SwapInfo[0].toString(), newSolutionScore)
        }
        else {
            //Unswap -> this was bad decision
            g1.setPlayerAtIndex(g1SwapInfo[1], g1SwapPlayer)
            g2.setPlayerAtIndex(g2SwapInfo[1], g2SwapPlayer)
        }

        //Best solution found
        if(newSolutionScore === 0.0) {
            console.log('Perfect partition found at %d iteration', i)
            break
        }
    }
    return [groups, solutionScore]
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}