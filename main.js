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

    hasTeamAnchor(p) {
        return this._anchorPlayers.has(p)
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
        let allCandidates = Array.from(players)
        let currentWeight = this.weight()

        let possibleSolutions = this._pickPlayers(allCandidates, 0, currentWeight,
            targetWeight, this._players, this._maxPlayers)
        return possibleSolutions
    }

    _pickPlayers(allCandidates, pIndex, curSum, targetSum, team, teamSize) {

        if(team.length === teamSize || pIndex === allCandidates.length) {
            const score = Math.abs(targetSum-curSum)
            return [
                [score, [...team]]
            ]
        }

        const playerOnIndex = allCandidates[pIndex]

        team.push(playerOnIndex)
        const pick = this._pickPlayers(allCandidates, pIndex+1, curSum + playerOnIndex.weight(),targetSum,team, teamSize)
        team.pop()

        const notPick = this._pickPlayers(allCandidates, pIndex+1, curSum,targetSum, team, teamSize)

        let solutionCandidates = []
        solutionCandidates.push(...pick)
        solutionCandidates.push(...notPick)

        return this._chooseSolutions(solutionCandidates)
    }

    _chooseSolutions(candidates) {
       // candidates.sort((a,b) => b[1].length - a[1].length || a[0] - b[0])
        let result = []

        //heuristics: if different players has same weight combination -> ignore this solution
        let knownSolutionCombinations = []

        for(let c of candidates) {
            // Weight combination fingerprint check [if any]
            if(knownSolutionCombinations.length > 0) {
                let weightCombinationUnique = true;

                for (let knownFingerprint of knownSolutionCombinations) {
                    let fingerPrintAlreadyExists = true
                    //Do not check same weight combinations
                    for (let p of c[1]) {
                        if (!knownFingerprint.has(p.weight())) {
                            fingerPrintAlreadyExists = false;
                            break;
                        }
                    }

                    if (fingerPrintAlreadyExists) {
                        weightCombinationUnique = false;
                        break;
                    }
                }

                if (!weightCombinationUnique) {
                    continue
                }
            }

            result.push(c)

            let weightCombinationFingerprint = new Set()
            for( let p of c[1]) {
                weightCombinationFingerprint.add(p.weight())
            }

            knownSolutionCombinations.push(weightCombinationFingerprint)

        }
        return result;
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
    const groupsTableRow = document.getElementById('groupsTableRow')
    const preDefinedPlayersTableRow = document.getElementById('preDefinedPlayersTableRow')

    const countPerGroupInput = document.getElementById('countPerGroupInput')

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

    console.time('Solution')
    let solution = averageWeightedBalancing(players,groupCount, playerPerGroup, preDefinedPlayers)
    console.timeEnd('Solution')

    let solutionQuality = solution[0]
    let solutionGroups = solution[1]

    for( let g of solutionGroups) {
        g.showOnGUI()
    }

    let scoreLabel = document.getElementById('scoreLabel')
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

    // We will form low groups first
    playerGroups.sort((a,b) => a.weight() - b.weight())
    shuffleArray(players)

    let remPlayers = new Set(players)
    let solution = groupChooseRecursive(0, playerGroups, remPlayers, targetGroupWeight)
    let groupPlayerArr = solution[1]
    let solutionScore = solution[0]
    for(let groupId = 0 ; groupId < playerGroups.length; groupId ++) {
        let group = playerGroups[groupId]
        group._players = groupPlayerArr[groupId]
    }

    return [solutionScore,playerGroups]
}

function groupChooseRecursive(groupIndex, groups, remPlayers, targetGroupWeight){

    if(groupIndex === groups.length) {
        let solutionArr = []
        for(let g of groups) {
            let elem = [...g.players()]
            solutionArr.push(elem)
        }
        let solutionScore = scoreSolution(groups)
        return [solutionScore, solutionArr]
    }

    let group = groups[groupIndex]

    let solutions = group.pickPlayersFrom(remPlayers, targetGroupWeight)

    console.log('We have %d solutions for group: %d', solutions.length, groupIndex)
    for(let s of solutions) {
        console.log(s.toString())
        console.log('===')
    }

    let bestSolutionScore = null;
    let bestSolution = null;

    for(let s of solutions) {

        let originalPlayers = group._players

        group._players = s[1]

        // This players already choosen
        group.players().forEach(p => {
            remPlayers.delete(p)
        })


        //Backtrack
        let solutionBacktrack = groupChooseRecursive(groupIndex+1, groups, remPlayers, targetGroupWeight)

        let backtrackScore = solutionBacktrack[0]
        if(!bestSolutionScore || bestSolutionScore > backtrackScore) {
            bestSolutionScore = backtrackScore
            bestSolution = solutionBacktrack[1]
        }

        //Revert backtrack objects
        group.players().forEach(p => {
            //Anchored players is not available for backtrack
            if(!group.hasTeamAnchor(p)) {
                remPlayers.add(p)
            }
        })

        group._players = originalPlayers

        if(backtrackScore === 0 ) {
            break;
        }
    }

    return [bestSolutionScore,bestSolution]
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

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}