players = [
    [ 'Алексеева Юля', 40 ],
    [ 'Быков Владимир', 100 ],
    [ 'Введенская Ирина', 60 ],
    [ 'Введенский Алексей', 90 ],
    [ 'Галиев Рустам', 60 ],
    [ 'Галиева Диляра', 70 ],
    [ 'Грачева Анна', 30 ],
    [ 'Енютина Галина', 60 ],
    [ 'Ермак Наталья', 60 ],
    [ 'Ефимов Алексей', 55 ],
    [ 'Луговая Валерия', 65 ],
    [ 'Макарова Анна', 60 ],
    [ 'Маркова Наталья', 75 ],
    [ 'Мустафина Регина', 40 ],
    [ 'Новрузова Наталья', 25 ],
    [ 'Перес Марк', 85 ],
    [ 'Першина Ольга', 50 ],
    [ 'Процевская Людмила', 50 ],
    [ 'Филлипова Вера', 25 ],
    [ 'Чернышов Иван', 50 ],
    [ 'Чернышова Елена', 60 ],
    [ 'Шаляева Татьяна', 30 ],
    [ 'Шляфер Илья', 70 ],
    [ 'Янчевская Ления', 70 ]
]


nGroups = 6
nPlayersPerGroup = 4

result = []
for (let groupId = 0 ; groupId < nGroups ; groupId++) {
    arr = []
    for(let i = 0 ; i < nPlayersPerGroup; i ++) {
        arr.push(-1)
    }
    result.push(arr)
}
console.log(result)

bestScore = +Infinity
bestSolution = null

function calcResultMetric(result) {
    maxWeight = -Infinity
    minWeight = +Infinity

    for (let gid=0; gid< result.length; gid ++){
        groupWeight = 0
        for(let playerPosition = 0; playerPosition < result[gid].length ; playerPosition ++) {
            playerId = result[gid][playerPosition]
            // console.log('PlayerId: %d', playerId)
            if(playerId != -1) {
                groupWeight += players[playerId][1]
            }
        }

        // console.log('Weight is: %d', groupWeight)

        maxWeight = Math.max(maxWeight, groupWeight)
        minWeight = Math.min(minWeight, groupWeight)
    }
    // console.log('Max weight %d minWeight %d', maxWeight, minWeight)
    return maxWeight - minWeight
}

function f(players,playersIndex,result) {
    // console.log('Called with PlayerIndex: %d, result: %s', playersIndex, result)
    if (playersIndex == players.length) {
        // console.log('EOF reached, result: %s', result)
        score = calcResultMetric(result)
        // console.log('Score is %d', score)
        if(score < bestScore) {
            bestScore = score

            arrayCopy = result.map(function(arr) {
                return arr.slice();
            });

            bestSolution = arrayCopy
        }
    }


    for(let groupId = 0; groupId< result.length; groupId++){
        for(let playerPos = 0; playerPos < result[groupId].length ; playerPos ++) {
            placeIsEmpty = result[groupId][playerPos] == -1
            if(!placeIsEmpty)
                continue

            for (let i = playersIndex ; i < players.length; i ++){
                // console.log('Found empty place at %d/%d set to -> %d', groupId, playerPos, i)
                result[groupId][playerPos] = i
                // console.log('Result after placing')
                // console.log(result)
                f(players, i+1, result)
                result[groupId][playerPos] = -1
                // console.log('I called with %d -> rollback result to %s', (i+1), result)
            }
        }
    }
}

f(players,0, result)
// console.log('Best score %d', bestScore)
if (bestSolution) {
    console.log(bestSolution)
}