<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { onValue, ref as refDB, update } from 'firebase/database';
import { db } from './config'
const player = ref("")

const initial = ref(true)
const room = ref([])
const set = ref([])
const yy = ref(null)
const xx = ref(null)
const gridPoint = ref([2, 2])
const action = ref("")

const game = computed(() => room.value.game)
const active = computed(() => room.value.active)
const winner = computed(() => room.value.winner)
watch(() => room.value.active, (val) => checkEnd(), syncSet())
watch(() => player.value, (val) => initGame())
const zone = computed(() => {
  let x = gridPoint.value[1]
  let y = gridPoint.value[0]
  let xy = Array(5).fill([]).map((_, row) => _ = Array(5).fill(false))
  xy[y - 1][x - 1] = true
  xy[y - 1][x] = true
  xy[y - 1][x + 1] = true
  xy[y][x - 1] = true
  xy[y][x] = true
  xy[y][x + 1] = true
  xy[y + 1][x - 1] = true
  xy[y + 1][x] = true
  xy[y + 1][x + 1] = true
  return xy
})
function initGame(winner) {
  // game.value = [
  //   ["", "", "", "", "",],
  //   ["", "", "", "", "",],
  //   ["", "", "", "", "",],
  //   ["", "", "", "", "",],
  //   ["", "", "", "", "",],
  // ]
  set.value = [
    ["", "", "", "", "",],
    ["", "", "", "", "",],
    ["", "", "", "", "",],
    ["", "", "", "", "",],
    ["", "", "", "", "",],
  ]
  yy.value = null
  xx.value = null
  gridPoint.value = [2, 2]
  action.value = "addChip"
  //only x can create game
  if (player.value == 'x') upd("", { game: set.value, winner: winner ? winner : "", active: 'x', gridPoint: gridPoint.value })
  onValue(refDB(db, "room/0"), (snapshot) => {
    room.value = snapshot.val();
    syncSet()
  })
}
function changeAction(a) {
  if (action.value == a) {
    turn()
  } else {
    resetSet()
    action.value = a
  }
}
function syncSet() {
  if (game.value) {
    set.value = JSON.parse(JSON.stringify(game.value))
    gridPoint.value = room.value.gridPoint
  }
}
function resetSet() {
  set.value = JSON.parse(JSON.stringify(game.value))
  gridPoint.value = JSON.parse(JSON.stringify(room.value.gridPoint))
  yy.value = null
  xx.value = null
}
function turn(y, x) {
  if (initial.value) initial.value = false
  action.value = "addChip"
  if (active.value == player.value) upd("", { game: set.value, active: player.value == 'x' ? 'o' : 'x', gridPoint: gridPoint.value })
}
function onCellClick(y, x) {
  if (action.value == 'addChip') addChip(y, x)
  if (action.value == 'shiftChip') shiftChip(y, x)
  if (action.value == 'setGridPoint') setGridPoint(y, x)
}
function addChip(y, x) {
  //unset last play and set new
  if (yy.value || xx.value) {
    set.value[yy.value][xx.value] = game.value[yy.value][xx.value]
  }
  if (!game.value[y][x]) {
    set.value[y][x] = player.value
    yy.value = y
    xx.value = x
  } else {
    //but work without
    //yy,xx unset
  }
}
function shiftChip(y, x) {
  //check if chip is drag(last position [yy,xx])
  if (yy.value || xx.value) {
    //check if drop cell is empty
    if (!game.value[y][x]) {
      set.value[y][x] = player.value
      yy.value = ""
      xx.value = ""
    }
  } else {
    //take chip - check it is player's
    if (set.value[y][x] == player.value) {
      set.value[y][x] = ""
      yy.value = y
      xx.value = x
    }
  }

}
function setGridPoint(y, x) {
  if (y > 0 & y < 4 & x > 0 & x < 4 & (Math.abs(x - room.value.gridPoint[1]) < 2 & Math.abs(y - room.value.gridPoint[0]) < 2)) {
    gridPoint.value = [y, x]
  }
}

function checkEnd() {
  if (!initial.value) {

    const combs = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    let zoneWithValues = game.value
      .slice(gridPoint.value[0] - 1, gridPoint.value[0] + 2)
      .map(row => row.slice(gridPoint.value[1] - 1, gridPoint.value[1] + 2))
    if (game.value) {
      let flatZone = zoneWithValues.flat()
      for (let comb of combs) {
        if (
          flatZone[comb[0]] == flatZone[comb[1]] &&
          flatZone[comb[1]] == flatZone[comb[2]] &&
          flatZone[comb[0]] != ''
        ) {
          initGame(flatZone[comb[1]])
        }
      }
    }
  }

}
function upd(key, value) {
  update(refDB(db, 'room/0/' + key), value)
}
onMounted(() => initGame())
</script>

<template>
  <div class="w-screen h-screen bg-green-200 fcc flex-col">
    <div v-if="!player" class="fcc gap-4">
      <button @click="player = 'x'">x</button>
      <p>or</p>
      <button @click="player = 'o'">o</button>
    </div>
    <div class="flex gap-6 mb-5" v-else>
      <button @click="changeAction('addChip')" :class="{ 'active': action == 'addChip' }">Add</button>
      <button @click="changeAction('shiftChip')" :class="{ 'active': action == 'shiftChip' }">Shift</button>
      <button @click="changeAction('setGridPoint')" :class="{ 'active': action == 'setGridPoint' }">Grid</button>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex gap-2" v-for="(row, y) in set">
        <div class="flex border w-10 h-10 fcc cursor-pointer" v-for="(col, x) in row"
          :class="[zone[y][x] ? 'border-blue-600' : '']" @click="onCellClick(y, x)">
          <p class="cursor-pointer text-5xl font-bold pb-3">{{ col }}</p>
        </div>
      </div>
    </div>
    <div v-if="winner" class="text-2xl text-red-400 font-black">
      {{ winner == 'x' ? 'Крестик победил!' : 'Нолик победил!' }}
    </div>
  </div>
</template>

<style scoped></style>
