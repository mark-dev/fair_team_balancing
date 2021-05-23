var groupsTextAreaArray = []

function initUI(){
    var btn = document.createElement("number");

    document.body.appendChild(btn);               // Append <button> to <body>

    var playerList = document.getElementById('playersListTextArea')
    var generateBtn = document.getElementById('generateBtn')
    var clearBtn = document.getElementById('clearBtn')
    var groupsTableRow = document.getElementById('groupsTableRow')
    var countPerGroupInput = document.getElementById('countPerGroupInput')
    clearBtn.onclick = function () {
        groupsTextAreaArray.forEach(textArea => {
            textArea.value = ''
        })
    }
    generateBtn.onclick = function (){
        players = playerList.value
        players = players.trim().split('\n')
        console.log(players)

        var playersCount = players.length
        var playerPerGroup = parseFloat(countPerGroupInput.value)

        var groupCount = Math.ceil(playersCount/playerPerGroup)

        console.log('Calculated group count is:' + groupCount)

        for (let groupId = 0; groupId < groupCount; groupId++) {
            if(groupId < groupsTextAreaArray.length){
                //Already created
                continue
            }

            tableColumn = document.createElement('td')
            groupTextArea = document.createElement('textarea')
            groupTextArea.style = 'height: 150px;'

            tableColumn.appendChild(groupTextArea)

            groupsTextAreaArray[groupId] = groupTextArea

            groupsTableRow.appendChild(tableColumn)
        }
        if(groupsTextAreaArray.length > groupCount) {
            for(let groupId = groupCount; groupId < groupsTextAreaArray.length ; groupId ++) {
                groupsTextAreaArray[groupId].parentElement.remove()
            }
            groupsTextAreaArray.splice(groupCount, groupsTextAreaArray.length - groupCount)
        }
        generateGroups(players, playerPerGroup)
    }
}

function generateGroups(players, playerPerGroup){

    const groupsPrioritiQueue = new PriorityQueue((a, b) => a[0] < b[0]);

    const preDefinedPlayers = new Set()

    for(let groupId = 0 ; groupId < groupsTextAreaArray.length; groupId++){

        groupWeight = 0
        groupPlayers = []
        textArea = groupsTextAreaArray[groupId]
        textArea.value.trim().split('\n').forEach(
            row => {
                matchInfo = row.match(/^.* (\d+)$/)
                if(matchInfo)
                {
                    weight = parseFloat(matchInfo[1])
                    groupWeight += weight
                    groupPlayers.push(row)

                    preDefinedPlayers.add(row)
                }
            }
        )
        groupsPrioritiQueue.push([groupWeight,groupPlayers, textArea]);
    }

    console.log('init priority queue with size: ' + groupsPrioritiQueue.size())

    playersWithWeight = []

    players.forEach(p => {
        // Already in

        if(preDefinedPlayers.has(p)) {
            return
        }
        matchInfo = p.match(/^(.*)( \d+$)/)

        if(matchInfo){
            player = matchInfo[1]
            weight = parseFloat(matchInfo[2].trim())
            playersWithWeight.push([weight,player])
        }
    })

    shuffleArray(playersWithWeight)
    playersWithWeight.sort((a,b) => b[0] - a[0])

    console.log('Players and weight:' + playersWithWeight)

    playersWithWeight.forEach(playerAndWeight => {
        returnToQueue = []

        while(!groupsPrioritiQueue.isEmpty()) {

            lightWeightGroup = groupsPrioritiQueue.pop()
            returnToQueue.push(lightWeightGroup)

            console.log('most lightweight group is ' + lightWeightGroup)
            playerCountInThisGroup = lightWeightGroup[1].length

            playerLimitOk = playerCountInThisGroup < playerPerGroup

            canPlaceToThisGroup = playerLimitOk

            if (canPlaceToThisGroup) {
                lightWeightGroup[0] += playerAndWeight[0]
                lightWeightGroup[1].push(playerAndWeight[1] + ' ' + playerAndWeight[0])
                break
            }
        }

        // Return all items back to Queue
        returnToQueue.forEach(x => {
            groupsPrioritiQueue.push(x)
        })
    })

    console.log('\nPrint content:');
    while (!groupsPrioritiQueue.isEmpty()) {
        el = groupsPrioritiQueue.pop()

        console.log('El: '+ el)
        total = el[0]

        players = el[1].join('\n')

        el[2].value = players + '\n--------\n' + total
    }
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

const queueTop = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[queueTop];
    }
    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > queueTop) {
            this._swap(queueTop, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[queueTop] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > queueTop && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }
    _siftDown() {
        let node = queueTop;
        while (
            (left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
            ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}